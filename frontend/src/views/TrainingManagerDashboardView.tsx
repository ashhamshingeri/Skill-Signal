import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, getDataMode } from '../services/api';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import { GapBarChart } from '../components/Charts/GapBarChart';
import {
  GraduationCap,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const TrainingManagerDashboardView: React.FC = () => {
  const { user, setActiveTab, setSelectedSkillId, selectedStateId, setSelectedStateId } = useApp();
  const [data, setData] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const trainingTrendData = [
    { month: 'Oct 25', demand: 58.0, supply: 42.0 },
    { month: 'Nov 25', demand: 63.5, supply: 44.0 },
    { month: 'Dec 25', demand: 68.0, supply: 46.5 },
    { month: 'Jan 26', demand: 74.0, supply: 48.0 },
    { month: 'Feb 26', demand: 79.5, supply: 49.8 },
    { month: 'Mar 26', demand: 85.0, supply: 51.5 },
    { month: 'Apr 26', demand: 89.0, supply: 53.0, forecastDemand: 89.0, lowerConfidence: 83.0, upperConfidence: 95.0 },
    { month: 'May 26', demand: 93.5, supply: 54.5, forecastDemand: 93.5, lowerConfidence: 86.0, upperConfidence: 100.0 },
    { month: 'Jun 26', demand: 97.0, supply: 56.0, forecastDemand: 97.0, lowerConfidence: 88.5, upperConfidence: 105.0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Hero Card ─────────────────────────────────────────────── */}
      <div
        className="card-white"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(2, 132, 199, 0.05) 100%)',
          borderLeft: '4px solid #0284c7',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-signature" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
              Training Center Operations & Planning
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.organization || 'Government ITI Pune & PMKVY Nodal Center'}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
            Training Demand & Course Planning
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Align ITI batch quotas, PMKVY seat allocations, and instructor capacity with employer hiring demand across regional industrial clusters.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-signature btn-sm"
              onClick={() => setActiveTab('recommendations')}
              style={{ background: 'linear-gradient(135deg, #0284c7, #7c3aed)' }}
            >
              <span>View Course Planning Directives</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('substitution')}
            >
              <BookOpen size={14} color="#0284c7" />
              <span>Explore Bridge Curriculums</span>
            </button>
          </div>
        </div>

        {/* State Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Training Jurisdiction
          </label>
          <select
            className="input-field select-field"
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">🇮🇳 National Overview</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Central Training Decision Pipeline ───────────────────────── */}
      <div className="card-white" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
          Training Centre Decision Pipeline: Demand → Skill Gap → Capacity → Course → Batch → Outcome
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('skills')}>
            <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>1. Local Demand</span>
          </div>
          <ArrowRight size={15} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('gaps')}>
            <span className="badge badge-critical" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>2. Skill Gap</span>
          </div>
          <ArrowRight size={15} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('districts')}>
            <span className="badge badge-shortage" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>3. Training Capacity</span>
          </div>
          <ArrowRight size={15} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('substitution')}>
            <span className="badge badge-signature" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>4. Course & Curriculum</span>
          </div>
          <ArrowRight size={15} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => setActiveTab('recommendations')}>
            <span className="badge badge-balanced" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>5. Batch Sizing</span>
          </div>
          <ArrowRight size={15} color="var(--text-muted)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>6. Placement Outcome</span>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Cards for Training Manager ───────────────────────── */}
      <div className="grid-4">
        <div className="card-white" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Acute Skill Deficits
            </span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ef4444', margin: '0.2rem 0' }}>
            {data?.summary?.criticalShortages || 5}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
            EV, Solar PV & VLSI demand surges
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.5rem', borderTop: '3px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tracked Skill Trades
            </span>
            <Layers size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0284c7', margin: '0.2rem 0' }}>
            {data?.summary?.totalSkillsTracked || 36}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
            14 Industries mapped
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average Placement Rate
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981', margin: '0.2rem 0' }}>
            74.2%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            +6.8% for bridge courses
          </div>
        </div>

        <div className="card-white" style={{ padding: '1.5rem', borderTop: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Capacity Utilization
            </span>
            <Users size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8b5cf6', margin: '0.2rem 0' }}>
            88.5%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
            PMKVY 4.0 batch allocation active
          </div>
        </div>
      </div>

      {/* ── Charts: Demand vs Supply + Gap Breakdown ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <TrendLineChart
          data={trainingTrendData}
          title="Regional Hiring Demand vs. Certified Trainee Supply"
        />

        <GapBarChart
          items={[
            { name: 'EV Powertrain Diagnostics', demandIndex: 88.4, supplyIndex: 32.1, gapIndex: 56.3 },
            { name: 'Semiconductor VLSI Layout', demandIndex: 86.8, supplyIndex: 29.4, gapIndex: 57.4 },
            { name: 'Solar PV Grid Integration', demandIndex: 82.1, supplyIndex: 41.5, gapIndex: 40.6 },
            { name: 'Generative AI Data Labeling', demandIndex: 94.2, supplyIndex: 38.0, gapIndex: 56.2 },
          ]}
          title="Top Skill Shortages for Batch Expansion"
        />
      </div>
    </div>
  );
};
