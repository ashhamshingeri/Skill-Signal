import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Database,
  BrainCircuit,
  Grid3X3,
  GitFork,
  ChevronRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const { setActiveTab, demoLogin } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* Background Decor */}
      <div className="bg-decorations">
        <div className="orb-purple" />
        <div className="orb-cyan" />
        <div className="orb-pink" />
      </div>

      {/* Top Landing Navigation */}
      <header
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--gradient-signature)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)',
            }}
          >
            <Activity size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SkillSignal
            </span>
            <span className="badge badge-signature" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
              MSDE v2.6
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>

          <button
            className="btn-signature btn-sm"
            onClick={() => setActiveTab('dashboard')}
          >
            <span>Launch Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto' }}>
        <div
          className="badge badge-signature"
          style={{
            marginBottom: '1.5rem',
            padding: '0.4rem 1rem',
            fontSize: '0.8rem',
            background: 'rgba(124, 58, 237, 0.1)',
            borderColor: 'rgba(124, 58, 237, 0.25)',
          }}
        >
          <Sparkles size={14} /> AI-Enabled Labour Market Intelligence & Skill Forecasting Engine
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, #7c3aed 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          The future of workforce demand, mapped before it happens.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
          }}
        >
          Empowering policymakers, ITIs, and state skill missions to anticipate shortages, optimize PMKVY training allocations, and deploy transition pathways with empirical confidence.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button
            className="btn-signature"
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            <span>Explore Skill Intelligence</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn-secondary"
            onClick={() => setActiveTab('ai-analyst')}
            style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            <Sparkles size={18} color="#7c3aed" />
            <span>Ask the AI Policy Copilot</span>
          </button>
        </div>

        {/* Live Metrics Ticker Strip */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Districts Covered</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)' }}>768</div>
            <div style={{ fontSize: '0.72rem', color: '#059669' }}>84.5% Tier-2/3 telemetry</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skill Deficits Tracked</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-rose)' }}>24 Critical</div>
            <div style={{ fontSize: '0.72rem', color: '#d97706' }}>Immediate CapEx priority</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Forecast Confidence</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-violet)' }}>88.2%</div>
            <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>3 to 12-month horizon</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Data Records Processed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>37.2M</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>NCS, SIDH, PLFS & ATS</div>
          </div>
        </div>
      </section>

      {/* Featured Platform Capabilities Grid */}
      <section style={{ padding: '3rem 2rem 5rem', maxWidth: '1200px', margin: '0 auto', zIndex: 10, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Built for Evidence-Driven National Workforce Decisions
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Empirical intelligence across all 4 pillars of the skill development lifecycle.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div className="card-white" style={{ padding: '1.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('gaps')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Grid3X3 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Cross-District Gap Matrix
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Spot regional shortages before they become economic bottlenecks. Compare district hiring surges against local ITI graduation quotas.
            </p>
          </div>

          <div className="card-white" style={{ padding: '1.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('substitution')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <GitFork size={20} color="#7c3aed" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Skill Substitution Pathways
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Map workers from declining trades into emerging high-wage roles (e.g. ICE mechanic to EV diagnostics in 4 weeks) at 75% reduced training cost.
            </p>
          </div>

          <div className="card-white" style={{ padding: '1.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('forecasts')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#0891b2" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Multi-Quarter Forecasting
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              3, 6, and 12-month forward projections with factor decomposition (Trend + Seasonality + Half-Life Obsolescence Decay).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>© 2026 SkillSignal — Ministry of Skill Development & Entrepreneurship (MSDE) Intelligence Layer. SIH26246 Architecture.</p>
      </footer>
    </div>
  );
};
