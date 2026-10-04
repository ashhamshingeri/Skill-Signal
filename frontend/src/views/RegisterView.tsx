import React, { useState } from 'react';
import { useApp, type UserRole } from '../context/AppContext';
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { register, setActiveTab } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('policymaker');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !passwordsMatch || !hasMinLength) return;
    setLoading(true);
    await register({ name, email, password, role, organization });
    setLoading(false);
  };

  const roleOptions: Array<{ id: UserRole; title: string; desc: string; icon: React.ReactNode }> = [
    {
      id: 'policymaker',
      title: 'Policymaker (MSDE)',
      desc: 'National & State resource allocation, macro labour forecasting',
      icon: <ShieldCheck size={18} color="#7c3aed" />,
    },
    {
      id: 'training_centre',
      title: 'Training Centre (ITI/PMKVY)',
      desc: 'Course curriculum alignment & regional capacity planning',
      icon: <GraduationCap size={18} color="#059669" />,
    },
    {
      id: 'job_seeker',
      title: 'Candidate / Seeker',
      desc: 'Career pathways, skill substitution & upskilling roadmaps',
      icon: <Briefcase size={18} color="#d97706" />,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        padding: '2.5rem 1rem',
        position: 'relative',
      }}
    >
      <div className="bg-decorations">
        <div className="orb-purple" />
        <div className="orb-cyan" />
      </div>

      <div
        className="card-white"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2.5rem',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--gradient-signature)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
              marginBottom: '0.75rem',
            }}
          >
            <Activity size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Create SkillSignal Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Join the national labour market intelligence workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name & Organization */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Dr. Rajesh Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Department / Org
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="MSDE / ITI Hub"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
              Official Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              <input
                type="email"
                className="input-field"
                placeholder="name@organization.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '32px' }}
                required
              />
            </div>
          </div>

          {/* Role Selection Cards */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
              Select Workspace Role
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {roleOptions.map((opt) => {
                const isSelected = role === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setRole(opt.id)}
                    style={{
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isSelected ? '#7c3aed' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt.icon}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#7c3aed' : 'var(--text-primary)' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min 8 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '13px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Requirements Dynamic Meter */}
          {password && (
            <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.625rem', borderRadius: '8px', fontSize: '0.72rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: hasMinLength ? '#059669' : '#94a3b8' }}>
                {hasMinLength ? <CheckCircle2 size={12} /> : <XCircle size={12} />} 8+ characters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: hasUpper ? '#059669' : '#94a3b8' }}>
                {hasUpper ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Uppercase letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: hasLower ? '#059669' : '#94a3b8' }}>
                {hasLower ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Lowercase letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: hasNumber ? '#059669' : '#94a3b8' }}>
                {hasNumber ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Number included
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-signature"
            disabled={loading || !hasMinLength}
            style={{ width: '100%', height: '44px', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Creating account...' : 'Create SkillSignal Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
