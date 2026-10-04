import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error-handler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillsignal-secret-key-msde-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'policymaker' | 'training_centre' | 'job_seeker' | 'admin';
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  // Extract token from Authorization header or signed cookies
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(createError(401, 'Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (_err) {
    next(createError(401, 'Invalid or expired session token'));
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createError(403, `Forbidden: Requires one of [${allowedRoles.join(', ')}] permissions`)
      );
    }

    next();
  };
}
