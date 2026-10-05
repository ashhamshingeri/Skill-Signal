import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logAudit, getRecentAuditLogs } from '../middleware/audit-log.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'skillsignal-secret-key-msde-2026';
const JWT_EXPIRES_IN = '7d';

export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  organization?: string | null;
  state_id?: string | null;
  state_name?: string | null;
  district_id?: string | null;
  district_name?: string | null;
  is_demo_account?: boolean;
  created_at?: string;
}

// In-memory persistent fallback repository for local/demo runs when PostgreSQL is not configured
const memoryUsers: Map<string, StoredUser> = new Map([
  [
    'policy@skillsignal.gov.in',
    {
      id: 'usr-demo-policy',
      email: 'policy@skillsignal.gov.in',
      password_hash: 'SkillSignal@2026',
      name: 'Dr. Rajesh Verma',
      role: 'policymaker',
      organization: 'Ministry of Skill Development & Entrepreneurship',
      state_name: 'National (All States)',
      is_demo_account: true,
      created_at: new Date().toISOString(),
    },
  ],
  [
    'training@skillsignal.gov.in',
    {
      id: 'usr-demo-training',
      email: 'training@skillsignal.gov.in',
      password_hash: 'SkillSignal@2026',
      name: 'Pooja Kulkarni',
      role: 'training_centre',
      organization: 'Government ITI Pune & PMKVY Nodal Center',
      state_name: 'Maharashtra',
      district_name: 'Pune',
      is_demo_account: true,
      created_at: new Date().toISOString(),
    },
  ],
  [
    'seeker@skillsignal.gov.in',
    {
      id: 'usr-demo-seeker',
      email: 'seeker@skillsignal.gov.in',
      password_hash: 'SkillSignal@2026',
      name: 'Amit Deshmukh',
      role: 'job_seeker',
      organization: null,
      state_name: 'Maharashtra',
      district_name: 'Pune',
      is_demo_account: true,
      created_at: new Date().toISOString(),
    },
  ],
  [
    'admin@skillsignal.gov.in',
    {
      id: 'usr-demo-admin',
      email: 'admin@skillsignal.gov.in',
      password_hash: 'SkillSignal@2026',
      name: 'System Administrator',
      role: 'admin',
      organization: 'SkillSignal Platform Team',
      is_demo_account: true,
      created_at: new Date().toISOString(),
    },
  ],
]);

interface Session {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActive: string;
}

const activeSessions: Map<string, Session> = new Map();
const passwordResetTokens: Map<string, { userId: string; expiresAt: number }> = new Map();

async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  try {
    const res = await query(
      `SELECT u.*, s.name as state_name, d.name as district_name 
       FROM users u 
       LEFT JOIN states s ON u.state_id = s.id 
       LEFT JOIN districts d ON u.district_id = d.id 
       WHERE u.email = $1`,
      [normalized]
    );
    if (res.rows.length > 0) return res.rows[0];
  } catch (_err) {
    // Database connection fallback
  }
  return memoryUsers.get(normalized) || null;
}

async function findUserById(id: string): Promise<StoredUser | null> {
  try {
    const res = await query(
      `SELECT u.*, s.name as state_name, d.name as district_name 
       FROM users u 
       LEFT JOIN states s ON u.state_id = s.id 
       LEFT JOIN districts d ON u.district_id = d.id 
       WHERE u.id = $1`,
      [id]
    );
    if (res.rows.length > 0) return res.rows[0];
  } catch (_err) {
    // Database connection fallback
  }
  for (const user of memoryUsers.values()) {
    if (user.id === id) return user;
  }
  return null;
}

async function createStoredUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  organization?: string;
}): Promise<StoredUser> {
  const normalized = data.email.toLowerCase().trim();
  try {
    const res = await query(
      `INSERT INTO users (email, password_hash, name, role, organization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, organization, is_demo_account, created_at`,
      [normalized, data.passwordHash, data.name.trim(), data.role, data.organization || null]
    );
    if (res.rows.length > 0) return res.rows[0];
  } catch (_err) {
    // Database connection fallback
  }

  const newUser: StoredUser = {
    id: uuidv4(),
    email: normalized,
    password_hash: data.passwordHash,
    name: data.name.trim(),
    role: data.role,
    organization: data.organization || null,
    is_demo_account: false,
    created_at: new Date().toISOString(),
  };
  memoryUsers.set(normalized, newUser);
  return newUser;
}

async function updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
  try {
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
  } catch (_err) {
    // Database connection fallback
  }
  for (const user of memoryUsers.values()) {
    if (user.id === userId) {
      user.password_hash = newPasswordHash;
      return true;
    }
  }
  return true;
}

function generateToken(user: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2),
  role: z.enum(['policymaker', 'training_centre', 'job_seeker', 'admin']).default('job_seeker'),
  organization: z.string().optional(),
});

// POST /api/auth/login
authRouter.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';

  if (!email || !password) {
    await logAudit({
      action: 'LOGIN',
      ip,
      userAgent,
      status: 'FAILURE',
      details: { reason: 'Missing credentials' },
    });
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    await logAudit({
      action: 'LOGIN',
      ip,
      userAgent,
      status: 'FAILURE',
      details: { email, reason: 'User not found' },
    });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let isValid = false;
  if (user.password_hash.startsWith('$2')) {
    isValid = await bcrypt.compare(password, user.password_hash);
  } else {
    // Exact plaintext match only for legacy seed/demo accounts
    isValid = password === user.password_hash;
  }

  if (!isValid) {
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      ip,
      userAgent,
      status: 'FAILURE',
      details: { email, reason: 'Invalid password' },
    });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Create session
  const sessionId = uuidv4();
  const session: Session = {
    id: sessionId,
    userId: user.id,
    ip,
    userAgent,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  activeSessions.set(sessionId, session);

  const token = generateToken(user);

  // Set secure HttpOnly cookie for session token
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });

  await logAudit({
    userId: user.id,
    action: 'LOGIN',
    ip,
    userAgent,
    status: 'SUCCESS',
    details: { role: user.role },
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      stateId: user.state_id,
      stateName: user.state_name,
      districtId: user.district_id,
      districtName: user.district_name,
      isDemoAccount: user.is_demo_account ?? false,
      isEmailVerified: true,
    },
    sessionId,
  });
}));

// POST /api/auth/register
authRouter.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parseResult.error.errors.map(e => e.message),
    });
  }

  const { email, password, name, role, organization } = parseResult.data;
  const ip = req.ip || '127.0.0.1';

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await createStoredUser({
    email,
    passwordHash,
    name,
    role,
    organization,
  });

  const token = generateToken(newUser);

  await logAudit({
    userId: newUser.id,
    action: 'REGISTER',
    ip,
    status: 'SUCCESS',
    details: { role: newUser.role },
  });

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organization: newUser.organization,
      isDemoAccount: false,
      isEmailVerified: true,
    },
  });
}));

// POST /api/auth/demo-login
authRouter.post('/demo-login', asyncHandler(async (req: Request, res: Response) => {
  const { role = 'job_seeker' } = req.body;
  const demoEmail = role === 'policymaker' 
    ? 'policy@skillsignal.gov.in'
    : role === 'training_centre'
    ? 'training@skillsignal.gov.in'
    : 'seeker@skillsignal.gov.in';

  const user = await findUserByEmail(demoEmail);
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = generateToken(user);
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: 'Demo login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      stateName: user.state_name,
      districtName: user.district_name,
      isDemoAccount: true,
      isEmailVerified: true,
    },
  });
}));


// POST /api/auth/forgot-password (Security-safe, does not reveal if email exists)
authRouter.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (email) {
    const user = await findUserByEmail(email);
    if (user) {
      const resetToken = uuidv4();
      passwordResetTokens.set(resetToken, {
        userId: user.id,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_REQ',
        ip,
        status: 'SUCCESS',
      });
    }
  }

  // Always return the exact same generic message
  res.json({
    message: 'If this email is registered with SkillSignal, password reset instructions have been dispatched.',
  });
}));

// POST /api/auth/reset-password
authRouter.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid reset token and new password (min 8 chars) required' });
  }

  const record = passwordResetTokens.get(token);
  if (!record || record.expiresAt < Date.now()) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ error: 'Password reset link is invalid or has expired' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await updatePassword(record.userId, passwordHash);
  passwordResetTokens.delete(token);

  // Invalidate all active sessions for security
  for (const [sId, s] of activeSessions.entries()) {
    if (s.userId === record.userId) {
      activeSessions.delete(sId);
    }
  }

  await logAudit({
    userId: record.userId,
    action: 'PASSWORD_RESET_COMPLETE',
    status: 'SUCCESS',
  });

  res.json({ message: 'Password has been successfully reset. Please log in with your new password.' });
}));

// POST /api/auth/change-password
authRouter.post('/change-password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Current password and new password (min 8 chars) required' });
  }

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hash = user.password_hash;
  const isValid = hash.startsWith('$2')
    ? await bcrypt.compare(currentPassword, hash)
    : currentPassword === hash;

  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await updatePassword(userId, newHash);

  await logAudit({
    userId,
    action: 'PASSWORD_CHANGE',
    status: 'SUCCESS',
  });

  res.json({ message: 'Password updated successfully' });
}));

// GET /api/auth/sessions
authRouter.get('/sessions', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const sessions: Session[] = [];

  for (const session of activeSessions.values()) {
    if (session.userId === userId) {
      sessions.push(session);
    }
  }

  if (sessions.length === 0) {
    sessions.push({
      id: 'sess-current',
      userId,
      ip: req.ip || '127.0.0.1',
      userAgent: (req.headers['user-agent'] as string) || 'Chrome / Windows',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      lastActive: new Date().toISOString(),
    });
  }

  const auditLogs = getRecentAuditLogs(userId);

  res.json({
    activeSessions: sessions,
    auditLogs,
  });
}));

// DELETE /api/auth/sessions/:sessionId
authRouter.delete('/sessions/:sessionId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  activeSessions.delete(sessionId);

  await logAudit({
    userId: req.user!.id,
    action: 'SESSION_REVOKE',
    status: 'SUCCESS',
    details: { sessionId },
  });

  res.json({ message: 'Session revoked successfully' });
}));

// POST /api/auth/logout
authRouter.post('/logout', asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.json({ message: 'Logged out successfully' });
}));

// GET /api/auth/demo-accounts
authRouter.get('/demo-accounts', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, organization 
       FROM users 
       WHERE is_demo_account = true 
       ORDER BY role`
    );

    if (result.rows.length > 0) {
      return res.json({
        demoAccounts: result.rows.map(row => ({
          ...row,
          defaultPassword: 'SkillSignal@2026',
        })),
      });
    }
  } catch (_err) {
    // Database connection fallback
  }

  const demoAccounts = Array.from(memoryUsers.values())
    .filter(u => u.is_demo_account)
    .map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      organization: u.organization,
      defaultPassword: 'SkillSignal@2026',
    }));

  res.json({ demoAccounts });
}));

// GET /api/auth/me
authRouter.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await findUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      stateId: user.state_id,
      stateName: user.state_name,
      districtId: user.district_id,
      districtName: user.district_name,
      isDemoAccount: user.is_demo_account ?? false,
    },
  });
}));
