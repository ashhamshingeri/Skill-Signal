import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useApp, type UserRole } from '../context/AppContext';
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  UserCheck,
  Building2,
  BarChart3,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';

import { IndiaIntelligenceMap } from '../components/IndiaIntelligenceMap';

type AuthMode = 'signin' | 'signup';
type FilterMode = 'live' | 'district' | 'forecast';

export const LoginView: React.FC = () => {
  const { login, demoLogin } = useApp();

  // Form state
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Map UI state
  const [activeFilter, setActiveFilter] = useState<FilterMode>('live');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).toUpperCase();
      setCurrentTime(`${dateStr}\n${timeStr} IST`);
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await login(email, password, rememberMe);
    setLoading(false);
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    demoLogin(role);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: '#f8fafc',
        backgroundImage: `
          radial-gradient(at 12% 8%,  rgba(224,231,255,0.65) 0, transparent 50%),
          radial-gradient(at 88% 8%,  rgba(245,232,255,0.70) 0, transparent 50%),
          radial-gradient(at 50% 92%, rgba(240,253,250,0.55) 0, transparent 50%)
        `,
        position: 'relative',
        overflow: 'hidden',
        color: '#0f172a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ─── Ambient blobs ─── */}
      <div style={{ position: 'absolute', top: '-8%', right: '26%', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)', filter: 'blur(55px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '4%', width: '560px', height: '560px', background: 'radial-gradient(circle, rgba(56,189,248,0.11) 0%, transparent 70%)', filter: 'blur(65px)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* ══════════════════════════════════════════════════════════════════
          LEFT PANEL — Auth Card
          ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: '1 1 380px',
          maxWidth: '500px',
          minWidth: '320px',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 20,
          boxSizing: 'border-box',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99,102,241,0.3)', flexShrink: 0 }}>
            <Activity size={26} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.45rem', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>SkillSignal</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>MSDE | Labour Market Intelligence</div>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 0.6rem 0' }}>
            See where India's{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              workforce
            </span>{' '}
            is going.
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
            Turn labour-market signals into district-level intelligence, forecasts and actionable training decisions.
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: '22px', padding: '1.4rem', boxShadow: '0 18px 38px -14px rgba(0,0,0,0.06), 0 0 0 1px rgba(226,232,240,0.8)', marginBottom: '1.25rem' }}>

          {/* Sign In / Create Account tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '13px', marginBottom: '1.15rem' }}>
            {(['signin', 'signup'] as AuthMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                style={{
                  flex: 1,
                  padding: '0.52rem 0',
                  borderRadius: '10px',
                  border: 'none',
                  background: authMode === mode ? '#fff' : 'transparent',
                  color: authMode === mode ? '#7c3aed' : '#64748b',
                  fontWeight: authMode === mode ? 700 : 500,
                  fontSize: '0.83rem',
                  boxShadow: authMode === mode ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  transition: 'all 0.2s',
                }}
              >
                {mode === 'signin' ? <UserCheck size={14} /> : <Briefcase size={14} />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Official / Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  required
                  style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '11px', fontSize: '0.86rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '0.65rem 2.4rem 0.65rem 2.4rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '11px', fontSize: '0.86rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '1.1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#475569' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: '#7c3aed', width: '14px', height: '14px', borderRadius: '4px' }} />
                Keep me signed in
              </label>
              <a href="#forgot" onClick={e => { e.preventDefault(); alert('Password reset link dispatched to nodal officer.'); }} style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>

            {/* CTA button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.78rem', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', border: 'none', borderRadius: '13px', fontSize: '0.93rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(236,72,153,0.32)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(236,72,153,0.42)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(236,72,153,0.32)'; }}
            >
              {loading ? 'Authenticating…' : 'Enter Intelligence Workspace'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8' }}>OR TRY A DEMO ACCOUNT</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.55rem' }}>
              {([
                { role: 'policymaker' as UserRole,     label: 'Policymaker',      sub: 'National intelligence', icon: <Building2 size={15} />,   color: '#7c3aed', bg: 'rgba(124,58,237,0.09)' },
                { role: 'training_centre' as UserRole, label: 'Training Mgr',     sub: 'Demand & capacity',     icon: <GraduationCap size={15} />,color: '#0284c7', bg: 'rgba(2,132,199,0.09)'  },
                { role: 'job_seeker' as UserRole,      label: 'Job Seeker',       sub: 'Skill opportunities',   icon: <Briefcase size={15} />,    color: '#ea580c', bg: 'rgba(234,88,12,0.09)'  },
              ]).map(({ role, label, sub, icon, color, bg }) => (
                <button
                  key={role}
                  id={`demo-${role}`}
                  type="button"
                  onClick={() => handleDemoLogin(role)}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '13px', padding: '0.7rem 0.3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: '0.35rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center', marginTop: '1px' }}>{sub}</div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.58rem', fontWeight: 700, color, background: bg, padding: '0.08rem 0.45rem', borderRadius: '999px' }}>DEMO</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem', fontSize: '0.72rem', color: '#64748b', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { icon: <ShieldCheck size={13} />, label: 'Secure session' },
            { icon: <UserCheck size={13} />,   label: 'Role-based access' },
            { icon: <BarChart3 size={13} />,   label: 'Government-grade' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {icon}<span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT PANEL — India Intelligence Map
          ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: '2 1 600px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem 2rem 1.25rem',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* ─── Top Bar: Filter Tabs + Clock ─── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem', zIndex: 30 }}>

          {/* Filter tabs */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', padding: '3px', borderRadius: '999px', border: '1px solid rgba(226,232,240,0.8)', gap: '0.25rem' }}>
            {(['live', 'district', 'forecast'] as FilterMode[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                style={{ padding: '0.38rem 0.9rem', borderRadius: '999px', border: 'none', background: activeFilter === f ? 'rgba(168,85,247,0.14)' : 'transparent', color: activeFilter === f ? '#7c3aed' : '#64748b', fontSize: '0.76rem', fontWeight: activeFilter === f ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
              >
                {f === 'live' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />}
                {f === 'live' ? 'Live Intelligence' : f === 'district' ? 'District Insights' : 'Skill Forecasts'}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Light/dark toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)', padding: '3px 6px', borderRadius: '999px', border: '1px solid rgba(226,232,240,0.8)', gap: '2px' }}>
              {[{ m: false, icon: <Sun size={13} /> }, { m: true, icon: <Moon size={13} /> }].map(({ m, icon }) => (
                <button key={String(m)} type="button" onClick={() => setIsDarkMode(m)} style={{ border: 'none', background: isDarkMode === m ? (m ? '#1e293b' : '#fff') : 'transparent', color: isDarkMode === m ? (m ? '#f8fafc' : '#0f172a') : '#94a3b8', padding: '4px 6px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: isDarkMode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>{icon}</button>
              ))}
            </div>

            {/* IST Clock */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                {currentTime || 'Loading…'}
              </div>
            </div>
          </div>
        </div>

        {/* ─── National Metrics Strip (top-right absolute) ─── */}
        <div style={{ position: 'absolute', top: '4.5rem', right: '2rem', zIndex: 25, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', border: '1px solid rgba(226,232,240,0.9)', borderRadius: '15px', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '1.1rem', boxShadow: '0 6px 20px -4px rgba(0,0,0,0.05)' }}>
          {[
            { val: '40', label: 'Districts in dataset', color: '#0284c7' },
            { val: '36', label: 'Skills tracked',       color: '#7c3aed' },
            { val: '14', label: 'Industries covered',   color: '#ea580c' },
          ].map(({ val, label, color }, i, arr) => (
            <React.Fragment key={val}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.63rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ─── MAIN MAP AREA ─── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', height: '100%', minHeight: '680px' }}>
          <IndiaIntelligenceMap width={850} height={700} />
        </div>
      </div>

      {/* ─── Responsive Media Query hack ─── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          /* Stack left panel above right on mobile */
        }
      `}</style>
    </div>
  );
};
