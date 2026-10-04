import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import {
  BrainCircuit,
  Search,
  Leaf,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  GitFork,
  AlertOctagon,
  Sparkles,
  MapPin,
  HelpCircle,
  Sparkle,
} from 'lucide-react';

export const SkillIntelligenceView: React.FC = () => {
  const { selectedSkillId, setSelectedSkillId, setActiveTab } = useApp();
  const [skills, setSkills] = useState<any[]>([]);
  const [activeSkill, setActiveSkill] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGapFilter, setSelectedGapFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, [selectedType, selectedGapFilter]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await api.getSkills({
        skillType: selectedType !== 'all' ? selectedType : undefined,
        gapLevel: selectedGapFilter !== 'all' ? selectedGapFilter : undefined,
      });
      const skillList = res.skills || [];
      setSkills(skillList);

      if (selectedSkillId) {
        const found = skillList.find((s: any) => s.id === selectedSkillId);
        if (found) setActiveSkill(found);
        else if (skillList.length > 0) setActiveSkill(skillList[0]);
      } else if (skillList.length > 0 && !activeSkill) {
        setActiveSkill(skillList[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q);
  });

  const getSkillTypeBadge = (type: string) => {
    switch (type) {
      case 'green':
        return <span className="badge badge-green"><Leaf size={11} /> Green Tech</span>;
      case 'emerging':
        return <span className="badge badge-emerging"><Zap size={11} /> Emerging AI</span>;
      default:
        return <span className="badge badge-primary">{type}</span>;
    }
  };

  const getGapBadge = (gapLevel: string, gapIndex: number) => {
    if (gapLevel === 'critical_shortage') {
      return <span className="badge badge-critical">Critical Shortage (+{gapIndex.toFixed(0)})</span>;
    }
    if (gapLevel === 'shortage') {
      return <span className="badge badge-shortage">Shortage (+{gapIndex.toFixed(0)})</span>;
    }
    if (gapLevel === 'balanced') {
      return <span className="badge badge-balanced">Balanced ({gapIndex.toFixed(0)})</span>;
    }
    return <span className="badge badge-surplus">Surplus ({gapIndex.toFixed(0)})</span>;
  };

  // Trend data for selected skill
  const skillTrendData = [
    { month: 'Oct 25', demand: activeSkill ? activeSkill.demandIndex * 0.7 : 60, supply: activeSkill ? activeSkill.supplyIndex * 0.8 : 45 },
    { month: 'Nov 25', demand: activeSkill ? activeSkill.demandIndex * 0.76 : 65, supply: activeSkill ? activeSkill.supplyIndex * 0.85 : 48 },
    { month: 'Dec 25', demand: activeSkill ? activeSkill.demandIndex * 0.83 : 70, supply: activeSkill ? activeSkill.supplyIndex * 0.9 : 50 },
    { month: 'Jan 26', demand: activeSkill ? activeSkill.demandIndex * 0.9 : 78, supply: activeSkill ? activeSkill.supplyIndex * 0.94 : 51 },
    { month: 'Feb 26', demand: activeSkill ? activeSkill.demandIndex * 0.95 : 82, supply: activeSkill ? activeSkill.supplyIndex * 0.97 : 52 },
    { month: 'Mar 26', demand: activeSkill ? activeSkill.demandIndex : 88, supply: activeSkill ? activeSkill.supplyIndex : 54 },
    { month: 'Apr 26', demand: activeSkill ? activeSkill.demandIndex * 1.05 : 92, supply: activeSkill ? activeSkill.supplyIndex * 1.02 : 56, forecastDemand: activeSkill ? activeSkill.demandIndex * 1.05 : 92, lowerConfidence: activeSkill ? activeSkill.demandIndex * 0.98 : 86, upperConfidence: activeSkill ? activeSkill.demandIndex * 1.12 : 98 },
    { month: 'May 26', demand: activeSkill ? activeSkill.demandIndex * 1.12 : 96, supply: activeSkill ? activeSkill.supplyIndex * 1.04 : 57, forecastDemand: activeSkill ? activeSkill.demandIndex * 1.12 : 96, lowerConfidence: activeSkill ? activeSkill.demandIndex * 1.02 : 90, upperConfidence: activeSkill ? activeSkill.demandIndex * 1.2 : 104 },
    { month: 'Jun 26', demand: activeSkill ? activeSkill.demandIndex * 1.18 : 100, supply: activeSkill ? activeSkill.supplyIndex * 1.06 : 58, forecastDemand: activeSkill ? activeSkill.demandIndex * 1.18 : 100, lowerConfidence: activeSkill ? activeSkill.demandIndex * 1.06 : 93, upperConfidence: activeSkill ? activeSkill.demandIndex * 1.28 : 110 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ─── Simplified Header ─── */}
      <div className="card-white" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Skill Intelligence
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-purple)', margin: '0.2rem 0 0.25rem 0' }}>
            Track which skills are growing, fading, or becoming scarce.
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Dynamic taxonomy · Demand velocity · Skill half-life
          </div>
        </div>

        <button
          className="btn btn-ai btn-sm"
          onClick={() => setActiveTab('substitution')}
          style={{ gap: '0.4rem' }}
        >
          <Sparkles size={14} />
          <span>Explore Substitution Pathways</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── Two-Column Desktop Layout (36% Left / 64% Right) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '36% 64%', gap: '1.25rem' }}>
        {/* Left Column: Skill Explorer */}
        <div className="card-white" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '800px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Explore Skills
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search skills, sectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
            />
          </div>

          {/* Filter Pills: Type */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'technical', label: 'Technical' },
              { id: 'vocational', label: 'Vocational' },
              { id: 'green', label: 'Green' },
              { id: 'emerging', label: 'Emerging' },
              { id: 'digital', label: 'Digital' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedType === t.id ? '#7c3aed' : 'var(--border-subtle)',
                  background: selectedType === t.id ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-surface-secondary)',
                  color: selectedType === t.id ? '#7c3aed' : 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: selectedType === t.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter Pills: Gap */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All gaps' },
              { id: 'critical_shortage', label: 'Critical' },
              { id: 'shortage', label: 'Shortage' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'surplus', label: 'Surplus' },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGapFilter(g.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: selectedGapFilter === g.id ? '#0284c7' : 'var(--border-subtle)',
                  background: selectedGapFilter === g.id ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg-surface-secondary)',
                  color: selectedGapFilter === g.id ? '#0284c7' : 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: selectedGapFilter === g.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Skill List Items */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, paddingRight: '2px' }}>
            {filteredSkills.map((skill) => {
              const isSelected = activeSkill?.id === skill.id;
              return (
                <div
                  key={skill.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(124, 58, 237, 0.35)' : 'var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onClick={() => {
                    setActiveSkill(skill);
                    setSelectedSkillId(skill.id);
                  }}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#7c3aed' : 'var(--text-primary)' }}>
                      {skill.name}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed' }}>
                      +{skill.demandIndex}% demand
                    </span>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {skill.industry}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {getSkillTypeBadge(skill.skillType)}
                      {getGapBadge(skill.gapLevel, skill.gapIndex)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Skill Deep-Dive */}
        {activeSkill ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Selected Skill Header & What This Means */}
            <div className="card-white" style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                    {getSkillTypeBadge(activeSkill.skillType)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {activeSkill.industry}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {activeSkill.name}
                  </h3>
                </div>

                {getGapBadge(activeSkill.gapLevel, activeSkill.gapIndex)}
              </div>

              {/* What this means explanation */}
              <div style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: '10px', padding: '0.65rem 0.9rem', marginBottom: '1.1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  WHAT THIS MEANS
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {activeSkill.gapLevel === 'critical_shortage' || activeSkill.gapLevel === 'shortage'
                    ? `Employer demand is rising faster than available training supply. High vacancy risk in industrial clusters.`
                    : activeSkill.gapLevel === 'balanced'
                    ? `Training capacity is aligned with industry hiring pace across active districts.`
                    : `Supply exceeds current hiring demand. Opportunity to pivot workforce to adjacent high-growth pathways.`}
                </p>
              </div>

              {/* 3 Metric Cards: Half-Life, Velocity, Net Gap */}
              <div className="grid-3">
                <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <Clock size={14} color="#d97706" />
                    <span>Half-Life</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
                    {activeSkill.halfLifeMonths} months
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {activeSkill.halfLifeMonths <= 20 ? 'Fast curriculum turnover needed' : 'Stable industrial lifespan'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <TrendingUp size={14} color="#0891b2" />
                    <span>Demand Velocity</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0891b2', lineHeight: 1.1 }}>
                    {activeSkill.momentum}×
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    vs national median growth
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <AlertOctagon size={14} color={activeSkill.gapIndex > 0 ? '#ef4444' : '#10b981'} />
                    <span>Net Gap Index</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: activeSkill.gapIndex > 0 ? '#ef4444' : '#10b981', lineHeight: 1.1 }}>
                    {activeSkill.gapIndex > 0 ? `+${activeSkill.gapIndex.toFixed(1)}` : activeSkill.gapIndex.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {activeSkill.gapLevel === 'critical_shortage' ? 'Critical shortage' : activeSkill.gapLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Series Chart Card */}
            <TrendLineChart
              data={skillTrendData}
              title={`Demand vs Supply Trajectory: ${activeSkill.name}`}
            />

            {/* Action Recommendation Card */}
            <div
              className="card-white"
              style={{
                padding: '1.1rem 1.35rem',
                borderLeft: '4px solid #7c3aed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  RECOMMENDED NEXT STEP
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Expand {activeSkill.name} training capacity in high-gap districts.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('districts')}
                >
                  <MapPin size={13} />
                  <span>View District Gaps</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedSkillId(activeSkill.id);
                    setActiveTab('substitution');
                  }}
                >
                  <GitFork size={13} />
                  <span>Explore Substitution</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Page Empty State */
          <div className="card-white" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', minHeight: '400px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: '1rem' }}>
              <BrainCircuit size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Choose a skill to begin
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
              Select a skill from the explorer on the left to see demand velocity, half-life metrics, historical trajectory, and forecast intelligence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillIntelligenceView;

