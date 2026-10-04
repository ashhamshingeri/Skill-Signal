import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  Building,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Key,
  ShieldAlert,
  Edit2,
  Save,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, userRole, setActiveTab, theme, setTheme, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [org, setOrg] = useState(user?.organization || '');

  const handleSave = () => {
    setIsEditing(false);
    showToast('Profile details updated successfully', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-signature">Authenticated Account</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MSDE National Registry</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>
            User Profile & Workspace Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Manage your personal identity, enterprise roles, and preferences.
          </p>
        </div>

        <button
          className="btn-secondary btn-sm"
          onClick={() => setActiveTab('settings-security')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <Key size={14} />
          <span>Security & Sessions</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Avatar & Role Summary Card */}
        <div className="card-white" style={{ padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'var(--gradient-signature)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
              marginBottom: '1rem',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {user?.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {user?.email}
          </p>

          <span
            className="badge badge-signature"
            style={{ textTransform: 'uppercase', fontSize: '0.7rem', marginBottom: '1.5rem' }}
          >
            {userRole}
          </span>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email Status</span>
              <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Verified
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account Tier</span>
              <strong style={{ color: 'var(--text-primary)' }}>Government Official</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Jurisdiction</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.stateName || 'All India'}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details & Theme Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Identity Form */}
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Account Information
              </h4>
              <button
                className="btn-outline"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    disabled={!isEditing}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Organization / Ministry
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={org}
                    disabled={!isEditing}
                    onChange={(e) => setOrg(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Appearance & Theme
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select your interface theme preference across workspaces.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'light', label: 'Light Mode', icon: <Sun size={18} color="#d97706" /> },
                { id: 'dark', label: 'Dark Charcoal', icon: <Moon size={18} color="#8b5cf6" /> },
                { id: 'system', label: 'System Default', icon: <Laptop size={18} color="#0891b2" /> },
              ].map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isSelected ? '#7c3aed' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.icon}
                    <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7c3aed' : 'var(--text-primary)' }}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
