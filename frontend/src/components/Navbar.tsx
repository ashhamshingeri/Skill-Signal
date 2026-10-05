import React, { useState } from 'react';
import { useApp, type UserRole } from '../context/AppContext';
import {
  Activity,
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  UserCheck,
  Sun,
  Moon,
  Laptop,
  Key,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    userRole,
    setUserRole,
    setSearchOpen,
    notificationsOpen,
    setNotificationsOpen,
    liveSyncStatus,
    triggerSync,
    setActiveTab,
    theme,
    setTheme,
    logout,
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    policymaker: { label: 'Policymaker (MSDE)', color: '#7c3aed' },
    training_centre: { label: 'Training Centre (ITI)', color: '#059669' },
    job_seeker: { label: 'Candidate / Seeker', color: '#d97706' },
    admin: { label: 'Administrator', color: '#8b5cf6' },
  };

  return (
    <header
      className="glass-header"
      style={{
        height: '68px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
      }}
    >
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--gradient-signature)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.35)',
            }}
          >
            <Activity size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                SkillSignal
              </span>
              <span className="badge badge-signature" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                v2.6
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Labour Market Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Center Search Trigger */}
      <div style={{ flex: 1, maxWidth: '440px', margin: '0 1.5rem' }}>
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            width: '100%',
            height: '40px',
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '0 0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} color="#7c3aed" />
            <span>Search skills, districts, forecasts, sectors...</span>
          </div>
          <kbd
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: AI Assistant, Theme Toggle, Notifications, Profile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Ask AI button */}
        <button
          className="btn-signature btn-sm"
          onClick={() => setActiveTab('ai-analyst')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <Sparkles size={14} />
          <span>
            {userRole === 'job_seeker'
              ? 'Ask Career Advisor'
              : userRole === 'training_centre'
              ? 'Ask Training Advisor'
              : 'Ask AI Analyst'}
          </span>
        </button>

        {/* Theme Mode Toggle Button */}
        <button
          className="btn-secondary"
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
          title={`Theme: ${theme}`}
          style={{ width: '38px', height: '38px', padding: 0 }}
        >
          {theme === 'dark' ? (
            <Moon size={16} color="#8b5cf6" />
          ) : theme === 'light' ? (
            <Sun size={16} color="#d97706" />
          ) : (
            <Laptop size={16} color="#0891b2" />
          )}
        </button>

        {/* Data Sync Button */}
        <button
          className="btn-secondary"
          onClick={triggerSync}
          title="Refresh Data Pipelines"
          style={{ width: '38px', height: '38px', padding: 0 }}
        >
          <RefreshCw
            size={15}
            color="var(--text-muted)"
            style={{
              animation: liveSyncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>

        {/* Notifications Trigger */}
        <button
          className="btn-secondary"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          title="Notifications & Alerts"
          style={{ position: 'relative', width: '38px', height: '38px', padding: 0 }}
        >
          <Bell size={16} color="var(--text-muted)" />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
            }}
          />
        </button>

        {/* User Profile Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--gradient-signature)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {profileDropdownOpen && (
            <div
              className="card-white"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '240px',
                padding: '0.75rem',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user?.email}
                </div>
                <span className="badge badge-signature" style={{ fontSize: '0.62rem', marginTop: '4px' }}>
                  {roleLabels[userRole]?.label || userRole}
                </span>
              </div>

              {/* Role Switcher (Only visible in Demo Mode) */}
              {user?.isDemoAccount && (
                <div style={{ padding: '0.25rem 0.5rem' }}>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                    Demo Workspace Role
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {(['policymaker', 'training_centre', 'job_seeker', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setUserRole(r)}
                        style={{
                          padding: '4px 6px',
                          fontSize: '0.65rem',
                          fontWeight: userRole === r ? 700 : 500,
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: userRole === r ? '#7c3aed' : 'var(--border-subtle)',
                          background: userRole === r ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                          color: userRole === r ? '#7c3aed' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {r.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.25rem' }} />

              <button
                className="btn-secondary btn-sm"
                onClick={() => setActiveTab('profile')}
                style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'transparent' }}
              >
                <User size={14} />
                <span>Account Profile</span>
              </button>

              <button
                className="btn-secondary btn-sm"
                onClick={() => setActiveTab('settings-security')}
                style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'transparent' }}
              >
                <Key size={14} />
                <span>Security & Sessions</span>
              </button>

              <button
                className="btn-secondary btn-sm"
                onClick={logout}
                style={{ justifyContent: 'flex-start', width: '100%', border: 'none', background: 'transparent', color: '#ef4444' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
