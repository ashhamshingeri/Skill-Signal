import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Shield,
  Key,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Trash2,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const SecuritySettingsView: React.FC = () => {
  const { showToast, logout } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const res = await api.getSessions();
      setSessions(res.activeSessions || []);
      setAuditLogs(res.auditLogs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8) {
      showToast('Please check password requirements (min 8 characters and matching)', 'error');
      return;
    }

    setLoadingPass(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      showToast(res.message || 'Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Failed to update password. Current password may be incorrect.', 'error');
    } finally {
      setLoadingPass(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    await api.revokeSession(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('Session terminated successfully', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-critical">Security & Authentication</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enterprise Access Controls</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Security, Passwords & Active Sessions
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage authentication credentials, session tokens, and security audit logs.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Section: Change Password */}
        <div className="card-white" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#7c3aed" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Update Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-signature"
              disabled={loadingPass}
              style={{ marginTop: '0.5rem' }}
            >
              <span>{loadingPass ? 'Updating...' : 'Update Password'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Right Column: 2FA Status Card & Honest Security Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 2FA Card */}
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="#0891b2" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Two-Factor Authentication (2FA)
                </h3>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                COMING SOON (v2.7)
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Time-based One-Time Password (TOTP) support for authenticator apps (Google Authenticator, Microsoft Authenticator) will be integrated in the next major government compliance release.
            </p>

            <button className="btn-secondary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              Setup Hardware / TOTP Key
            </button>
          </div>

          {/* Honest Security Baseline */}
          <div className="card-white" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>Active Security Protections</span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <li>✓ Argon2id / bcrypt salted hashing for all user credentials</li>
              <li>✓ Secure HttpOnly session cookies with strict CSRF protection</li>
              <li>✓ AI prompt-injection sandboxing on all NLP policy queries</li>
              <li>✓ Parameterized SQL queries preventing injection attacks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Sessions Manager */}
      <div className="card-white" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Sessions & Connected Devices
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Devices currently authorized to access your SkillSignal account
            </span>
          </div>

          <button
            className="btn-outline btn-sm"
            onClick={logout}
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={14} />
            <span>Sign Out All Devices</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.map((sess) => {
            const isMobile = sess.userAgent.includes('iPhone') || sess.userAgent.includes('Android');
            const isCurrent = sess.id === 'sess-current';

            return (
              <div
                key={sess.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {isMobile ? <Smartphone size={20} color="#7c3aed" /> : <Laptop size={20} color="#0891b2" />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {sess.userAgent}
                      </span>
                      {isCurrent && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      IP: {sess.ip} • Last Active: {sess.lastActive ? new Date(sess.lastActive).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => handleRevokeSession(sess.id)}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <Trash2 size={13} />
                    <span>Revoke</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
