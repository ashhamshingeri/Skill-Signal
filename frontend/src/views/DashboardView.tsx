import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, getDataMode } from '../services/api';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import { GapBarChart } from '../components/Charts/GapBarChart';
import { ConfidenceGauge } from '../components/Charts/ConfidenceGauge';
import { JobSeekerDashboardView } from './JobSeekerDashboardView';
import { TrainingManagerDashboardView } from './TrainingManagerDashboardView';
import {
  TrendingUp,
  AlertTriangle,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { userRole, setActiveTab, selectedStateId, setSelectedStateId, setSelectedSkillId, setSelectedDistrictId } = useApp();

  if (userRole === 'job_seeker') {
    return <JobSeekerDashboardView />;
  }

  if (userRole === 'training_centre') {
    return <TrainingManagerDashboardView />;
  }

  const [data, setData] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dataMode = getDataMode();

  useEffect(() => {
    loadDashboard();
  }, [selectedStateId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, statesRes] = await Promise.all([
        api.getDashboardOverview({ stateId: selectedStateId || undefined }),
        api.getStates(),
      ]);
      setData(dashRes);
      setStates(statesRes.states || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const macroTrendData = [
    { month: 'Oct 25', demand: 62.4, supply: 48.0 },
    { month: 'Nov 25', demand: 66.8, supply: 49.5 },
    { month: 'Dec 25', demand: 71.2, supply: 51.0 },
    { month: 'Jan 26', demand: 76.5, supply: 52.4 },
    { month: 'Feb 26', demand: 81.0, supply: 53.8 },
    { month: 'Mar 26', demand: 86.4, supply: 55.2 },
    { month: 'Apr 26', demand: 90.1, supply: 56.5, forecastDemand: 90.1, lowerConfidence: 84.0, upperConfidence: 96.2 },
    { month: 'May 26', demand: 93.8, supply: 58.0, forecastDemand: 93.8, lowerConfidence: 86.5, upperConfidence: 101.1 },
    { month: 'Jun 26', demand: 97.2, supply: 59.4, forecastDemand: 97.2, lowerConfidence: 88.0, upperConfidence: 106.4 },
  ];

  const summary = data?.summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Editorial Dashboard Hero Header */}
      <div
        className="card-white"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-secondary) 100%)',
          borderLeft: '4px solid var(--accent-purple)',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-signature">Workforce Intelligence Feed</span>
            {data?._dataMode === 'prototype' && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#d97706', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>PROTOTYPE DATA</span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loading ? 'Loading...' : 'Updated Today • 37.2M Telemetry Records'}</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
            India&apos;s Workforce Is Changing.
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            See where hiring demand is surging, specialized skills are becoming scarce, and training capacity should deploy next.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn-signature btn-sm"
              onClick={() => setActiveTab('gaps')}
            >
              <span>Explore Skill Gaps</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="btn-secondary btn-sm"
              onClick={() => setActiveTab('ai-analyst')}
            >
              <Sparkles size={14} color="#7c3aed" />
              <span>Ask AI Policy Analyst</span>
            </button>
          </div>
        </div>

        {/* State Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Filter by Region
          </label>
          <select
            className="input-field select-field"
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">🇮🇳 All India (National Overview)</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Differentiated KPI Cards */}
      <div className="grid-4">
        {/* Card 1: Critical Shortages (Red/Pink Gradient Accent) */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderTop: '3px solid #ef4444',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
          }}
          onClick={() => setActiveTab('gaps')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Critical Skill Shortages
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#ef4444" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>
            {summary?.criticalShortages ?? '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>+4 this month (EV, VLSI, Green Hydrogen)</span>
          </div>
        </div>

        {/* Card 2: Fast-Growing Skills (Purple Gradient Accent) */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderTop: '3px solid #7c3aed',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          }}
          onClick={() => setActiveTab('skills')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Fast-Growing Skills
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#7c3aed', margin: '0.25rem 0' }}>
            {summary?.totalSkillsTracked ?? '—'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>+18.4% hiring momentum</span>
          </div>
        </div>

        {/* Card 3: Districts Analysed (Cyan/Green Accent) */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderTop: '3px solid #0891b2',
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.08)',
          }}
          onClick={() => setActiveTab('districts')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Districts Analysed
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} color="#0891b2" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0891b2', margin: '0.25rem 0' }}>
            {summary?.totalDistrictsCovered ?? '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            84.5% Tier-2 & Tier-3 coverage
          </div>
        </div>

        {/* Card 4: Forecast Confidence (Violet Accent) */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            cursor: 'pointer',
            borderTop: '3px solid #8b5cf6',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
          }}
          onClick={() => setActiveTab('forecasts')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Forecast Reliability
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8b5cf6', margin: '0.25rem 0' }}>
            {summary?.avgConfidenceScore ? `${summary.avgConfidenceScore}%` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
            High confidence (95% CI bounds)
          </div>
        </div>
      </div>

      {/* Feature Spotlight: Dark Intelligence Panel */}
      <div
        className="dark-intelligence-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div>
          <div className="badge badge-critical" style={{ marginBottom: '0.75rem' }}>
            Workforce Intelligence Spotlight
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            &ldquo;Where should training capacity move next?&rdquo;
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Automotive transition in Western India is creating an acute deficit for <strong>EV Powertrain Diagnostics</strong>. OEM hiring expansion in the Chakan-Talegaon industrial cluster is accelerating faster than current ITI batch output.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-signature btn-sm"
              onClick={() => {
                setSelectedSkillId('sk-01');
                setActiveTab('skills');
              }}
            >
              <span>Inspect EV Diagnostics Signal</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="btn-dark btn-sm"
              onClick={() => {
                setSelectedDistrictId('dst-pune');
                setActiveTab('districts');
              }}
            >
              <MapPin size={14} />
              <span>View Pune District Profile</span>
            </button>
          </div>
        </div>

        {/* Telemetry Snapshot Matrix */}
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8' }}>Geographic Cluster</span>
            <strong style={{ color: '#ffffff' }}>Pune & Pimpri (Maharashtra)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8' }}>Hiring Demand Growth</span>
            <strong style={{ color: '#38bdf8' }}>+52% YoY Surge</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8' }}>Current Training Supply</span>
            <strong style={{ color: '#f87171' }}>+8% (Severe Funnel Deficit)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: '#94a3b8' }}>Projected 6-Mo Gap</span>
            <strong style={{ color: '#ec4899' }}>+48% Gap Expansion</strong>
          </div>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem', fontSize: '0.72rem', color: '#a855f7' }}>
            ⚡ Recommended Action: Authorize 4 PMKVY EV simulation labs & deploy 4-wk bridge course for ICE mechanics.
          </div>
        </div>
      </div>

      {/* Stacked Charts: Macro Time Series + Model Reliability */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <TrendLineChart
          data={macroTrendData}
          title="Macro National Demand vs. Training Supply (Historical + 3-Mo Forecast)"
        />

        <div className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Model Reliability Score
              </h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Multi-source validation and PLFS regression index
              </div>
            </div>
            <ConfidenceGauge score={88} label="Statistical Validation" subtext="Multi-factor decomposition" />
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-around', gap: '1rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Connected Feeds: </span>
              <strong style={{ color: '#059669' }}>10 Live (NCS & SIDH)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Placement Rate: </span>
              <strong style={{ color: 'var(--accent-purple)' }}>68.4% national avg</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Bottom: Top Skill Deficits + Priority Directives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <GapBarChart
          items={
            data?.topShortages?.length > 0
              ? data.topShortages
              : [
                  { name: 'EV Powertrain Diagnostics', demandIndex: 88.4, supplyIndex: 32.1, gapIndex: 56.3 },
                  { name: 'Semiconductor VLSI Layout', demandIndex: 86.8, supplyIndex: 29.4, gapIndex: 57.4 },
                  { name: 'Generative AI Engineering', demandIndex: 94.2, supplyIndex: 38.0, gapIndex: 56.2 },
                  { name: 'Solar PV Grid Integration', demandIndex: 82.1, supplyIndex: 41.5, gapIndex: 40.6 },
                  { name: 'Cybersecurity Threat Hunting', demandIndex: 89.5, supplyIndex: 49.0, gapIndex: 40.5 },
                ]
          }
          title="Top Acute Skill Deficits (National Priority)"
        />

        {/* Priority Directives Card */}
        <div className="card-white" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Priority Policy Interventions
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated resource allocation briefs</span>
            </div>
            <button
              className="btn-outline"
              onClick={() => setActiveTab('recommendations')}
            >
              View All Directives
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                title: 'Scale EV Diagnostics at Pune & Pimpri ITIs',
                desc: 'Automotive OEM hiring spike in Chakan cluster indicates 48% gap expansion over 6 months.',
                badge: 'Critical Priority',
                badgeColor: '#ef4444',
                skillId: 'sk-01',
              },
              {
                title: 'Establish Advanced Fab-Design Hub in Bengaluru & Mysuru',
                desc: 'ISM semiconductor fab commitments require 1,200 layout engineers by Q4 2026.',
                badge: 'Critical Priority',
                badgeColor: '#ef4444',
                skillId: 'sk-05',
              },
              {
                title: 'Surya Ghar Rooftop Solar Technician Bridge Program',
                desc: 'Gujarat DISCOM installations constrained by 2,500 certified inverter technicians.',
                badge: 'High Priority',
                badgeColor: '#d97706',
                skillId: 'sk-02',
              },
            ].map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.875rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onClick={() => {
                  setSelectedSkillId(rec.skillId);
                  setActiveTab('recommendations');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rec.title}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: rec.badgeColor,
                      background: `${rec.badgeColor}15`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {rec.badge}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {rec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
