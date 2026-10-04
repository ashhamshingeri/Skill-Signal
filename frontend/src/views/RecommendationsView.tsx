import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  ShieldCheck,
  Printer,
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const { setActiveTab, setSelectedSkillId } = useApp();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [filterPriority]);

  const loadRecommendations = async () => {
    try {
      const res = await api.getRecommendations({
        priority: filterPriority !== 'all' ? filterPriority : undefined,
      });
      const list = res.recommendations || [];
      setRecommendations(list);
      if (list.length > 0 && !selectedRec) {
        setSelectedRec(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div className="card-white" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Recommendations
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-purple)', margin: '0.2rem 0 0.25rem 0' }}>
            Automated recommendations calculated from empirical demand spikes and forecasting trends.
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Policy directives · PMKVY seating quotas · Hardware grant allocations
          </div>
        </div>

        {/* Priority Filter & Export Button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="input-field select-field"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ width: '160px', height: '36px', fontSize: '0.78rem' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            {exported ? <CheckCircle2 size={14} color="#10b981" /> : <FileDown size={14} />}
            <span>{exported ? 'Brief Exported' : 'Export PDF Brief'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left List + Right Detailed Directive */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '1.25rem' }}>
        {/* Left Column: Recommendations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Directives ({recommendations.length})
          </div>

          {recommendations.map((rec) => {
            const isSelected = selectedRec?.id === rec.id;
            const isCritical = rec.priority === 'critical';
            const isHigh = rec.priority === 'high';

            return (
              <div
                key={rec.id}
                className="card-white"
                style={{
                  padding: '1.1rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'rgba(124, 58, 237, 0.4)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface)',
                  position: 'relative',
                }}
                onClick={() => setSelectedRec(rec)}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '15%',
                      bottom: '15%',
                      width: '3px',
                      background: 'var(--accent-purple)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span
                    className={`badge ${isCritical ? 'badge-critical' : isHigh ? 'badge-shortage' : 'badge-balanced'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {rec.priority.toUpperCase()} PRIORITY
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} color="#7c3aed" />
                    <span>{rec.districtName}, {rec.stateName}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {rec.title}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.65rem' }}>
                  {rec.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span>Confidence: <strong style={{ color: '#c084fc' }}>{rec.forecastConfidence}%</strong></span>
                  <span>Demand Growth: <strong style={{ color: '#38bdf8' }}>+{(rec.demandGrowth * 100).toFixed(0)}% YoY</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Directive Brief */}
        {selectedRec ? (
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`badge ${selectedRec.priority === 'critical' ? 'badge-critical' : 'badge-shortage'}`}>
                  {selectedRec.priority.toUpperCase()} DIRECTIVE • MSDE-2026-REC-{selectedRec.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Generated from Live Telemetry
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#f8fafc', lineHeight: 1.3 }}>
                {selectedRec.title}
              </h3>
            </div>

            {/* Target Details Grid */}
            <div className="grid-3" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Target Skill Cluster</div>
                <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>{selectedRec.skillName}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Geographic Focus</div>
                <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{selectedRec.districtName}, {selectedRec.stateName}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Forecast Confidence</div>
                <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>{selectedRec.forecastConfidence}% High</strong>
              </div>
            </div>

            {/* Empirical Reasoning */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <TrendingUp size={16} color="#38bdf8" />
                <span>Empirical Market Evidence & Deficit Analysis</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {selectedRec.reasoning}
              </p>
            </div>

            {/* Suggested Action Protocol */}
            <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Lightbulb size={16} color="#38bdf8" />
                <span>Recommended MSDE Action & Resource Allocation</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#f8fafc', lineHeight: 1.5 }}>
                {selectedRec.suggestedAction}
              </p>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button
                className="btn btn-ai btn-sm"
                onClick={() => {
                  setSelectedSkillId(selectedRec.skillId);
                  setActiveTab('ai-analyst');
                }}
              >
                <Sparkles size={14} />
                <span>Ask AI Analyst to Simulate Impact</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleExport}
              >
                <Printer size={14} />
                <span>Print Action Memo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card flex items-center justify-center p-12 text-slate-400">
            Select a directive to view details
          </div>
        )}
      </div>
    </div>
  );
};
