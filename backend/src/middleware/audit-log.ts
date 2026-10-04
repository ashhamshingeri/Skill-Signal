import { query } from '../database/connection.js';

export interface AuditLogEntry {
  userId?: string | null;
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET_REQ' | 'PASSWORD_RESET_COMPLETE' | 'DATA_EXPORT' | 'AI_QUERY' | 'SESSION_REVOKE';
  resource?: string;
  ip?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, unknown>;
}

// In-memory fallback if audit_logs table isn't migrated yet
const inMemoryAuditLogs: (AuditLogEntry & { timestamp: string })[] = [];

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  inMemoryAuditLogs.unshift({ ...entry, timestamp });

  if (inMemoryAuditLogs.length > 500) {
    inMemoryAuditLogs.pop();
  }

  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, ip, details, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.userId || null,
        entry.action,
        entry.resource || null,
        entry.ip || null,
        JSON.stringify(entry.details || {}),
        entry.status,
      ]
    );
  } catch (_err) {
    // Graceful fallback to in-memory log if table does not exist
  }
}

export function getRecentAuditLogs(userId?: string) {
  if (userId) {
    return inMemoryAuditLogs.filter(log => log.userId === userId);
  }
  return inMemoryAuditLogs.slice(0, 50);
}
