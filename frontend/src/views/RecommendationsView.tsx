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
  const { user, userRole, setActiveTab, setSelectedSkillId, showToast } = useApp();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [exported, setExported] = useState(false);

  const isJobSeeker = userRole === 'job_seeker';

  // Specific personalized career recommendations for candidate
  const jobSeekerRecommendations = [
    {
      id: 'jsr-01',
      title: 'Complete 4-Week EV Powertrain Diagnostics Bridge Module',
      category: 'Bridge Course',
      priority: 'critical',
      skillName: 'Electric Vehicle Powertrain Diagnostics',
      location: 'Government ITI Pune / ITI Bengaluru',
      description: 'Accredited PMKVY 4.0 bridge course subsidizing 100% of training fees. Covers PMSM motor drives, high-voltage battery disconnect, and CAN-bus telemetry.',
      reasoning: 'Your ICE mechanical background satisfies 78% of prerequisites. Completing this 4-week module qualifies you for immediate OEM technician roles.',
      suggestedAction: 'Enroll in upcoming batch starting next month at Government ITI Pune. Download curriculum overview below.',
      demandGrowth: '+52%',
      wageUplift: '+42%',
      confidence: 94,
    },
    {
      id: 'jsr-02',
      title: 'Learn Battery Management Systems (BMS) Telemetry',
      category: 'Skill Mastery',
      priority: 'high',
      skillName: 'BMS CAN-bus Telemetry',
      location: 'Online / Simulation Labs',
      description: 'BMS diagnostic proficiency is required in over 85% of EV diagnostic job descriptions in Western and Southern automotive corridors.',
      reasoning: 'Mastering cell voltage balancing, state-of-health (SoH) metrics, and thermal sensor calibration fills your primary technical skill gap.',
      suggestedAction: 'Practice on virtual simulation software and review OBD-II CAN-bus logging protocols.',
      demandGrowth: '+48%',
      wageUplift: '+35%',
      confidence: 91,
    },
    {
      id: 'jsr-03',
      title: 'Obtain Level 2 High-Voltage Safety Protocol Certificate',
      category: 'Certification',
      priority: 'critical',
      skillName: 'High-Voltage EV Safety',
      location: 'Automotive Skills Development Council (ASDC)',
      description: 'Mandatory workplace safety certification required by major OEMs before allowing technicians on active high-voltage vehicle bays.',
      reasoning: 'Zero-tolerance safety compliance in industrial EV workshops requires formal certified disconnect procedure knowledge.',
      suggestedAction: 'Take the 1-week ASDC safety protocol assessment module.',
      demandGrowth: '+55%',
      wageUplift: '+25%',
      confidence: 96,
    },
    {
      id: 'jsr-04',
      title: 'Explore OEM & Fleet Hiring in Pune Chakan & Bengaluru',
      category: 'Career Opportunity',
      priority: 'high',
      skillName: 'EV Fleet Diagnostics',
      location: 'Pune (Chakan) & Bengaluru Urban',
      description: 'Over 1,850 open vacancies posted by automotive OEMs, commercial fleet aggregators, and battery manufacturers.',
      reasoning: 'Fastest hiring velocity in Western India with entry technician salaries starting at ₹3.8L - ₹5.2L per annum.',
      suggestedAction: 'Prepare your updated verified SkillSignal profile and submit directly to accredited recruiters.',
      demandGrowth: '+52%',
      wageUplift: '+42%',
      confidence: 89,
    },
    {
      id: 'jsr-05',
      title: 'Build a Practical BMS Simulation Project',
      category: 'Practical Project',
      priority: 'medium',
      skillName: 'Thermal & Electrical Simulation',
      location: 'Independent Portfolio',
      description: 'Create a documented workbench project analyzing fault codes in a simulated 48V/400V battery pack.',
      reasoning: 'Demonstrating hands-on diagnostic capability significantly accelerates interview placement rates.',
      suggestedAction: 'Document OBD-II code readings and sensor failure diagnostics in your profile portfolio.',
      demandGrowth: '+30%',
      wageUplift: '+20%',
      confidence: 85,
    },
  ];

  useEffect(() => {
    if (!isJobSeeker) {
      loadRecommendations();
    } else {
      const filtered = filterPriority === 'all'
        ? jobSeekerRecommendations
        : jobSeekerRecommendations.filter(r => r.priority === filterPriority);
      setRecommendations(filtered);
      if (filtered.length > 0 && !selectedRec) {
        setSelectedRec(filtered[0]);
      }
    }
  }, [filterPriority, isJobSeeker]);

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
    showToast(isJobSeeker ? 'Career Action Plan downloaded' : 'Policy brief exported', 'success');
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div className="card-white" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-primary">
              {isJobSeeker ? 'Personalized Career Guidance' : 'Automated Resource Allocation'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {isJobSeeker ? 'Career & Learning Recommendations' : 'Policy & Capacity Recommendations'}
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-purple)', margin: '0.2rem 0 0.25rem 0' }}>
            {isJobSeeker
              ? 'Personalized actions, bridge courses, and certifications to achieve your target career.'
              : 'Automated recommendations calculated from empirical demand spikes and forecasting trends.'}
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {isJobSeeker
              ? 'Bridge courses · Skill acquisition milestones · Certification clearances · Hiring opportunities'
              : 'Policy directives · PMKVY seating quotas · Hardware grant allocations'}
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
            <span>{exported ? 'Downloaded' : isJobSeeker ? 'Save Action Plan' : 'Export PDF Brief'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left List + Right Detailed Directive */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr', gap: '1.25rem' }}>
        {/* Left Column: Recommendations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isJobSeeker ? 'Active Career Recommendations' : 'Active Directives'} ({recommendations.length})
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
                    {rec.priority.toUpperCase()} {isJobSeeker ? (rec.category ? `• ${rec.category}` : 'ACTION') : 'PRIORITY'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} color="#7c3aed" />
                    <span>{rec.location || `${rec.districtName || 'Pune'}, ${rec.stateName || 'Maharashtra'}`}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {rec.title}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.65rem' }}>
                  {rec.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span>Confidence: <strong style={{ color: '#c084fc' }}>{rec.confidence || rec.forecastConfidence || 92}%</strong></span>
                  {isJobSeeker && rec.wageUplift ? (
                    <span>Wage Uplift: <strong style={{ color: '#10b981' }}>{rec.wageUplift}</strong></span>
                  ) : (
                    <span>Demand Growth: <strong style={{ color: '#38bdf8' }}>{typeof rec.demandGrowth === 'number' ? `+${(rec.demandGrowth * 100).toFixed(0)}%` : rec.demandGrowth || '+52%'} YoY</strong></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Directive / Career Action Brief */}
        {selectedRec ? (
          <div className="card-white" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`badge ${selectedRec.priority === 'critical' ? 'badge-critical' : 'badge-shortage'}`}>
                  {isJobSeeker
                    ? `${selectedRec.priority.toUpperCase()} CAREER ACTION`
                    : `${selectedRec.priority.toUpperCase()} DIRECTIVE • MSDE-2026-REC-${selectedRec.id}`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isJobSeeker ? 'Matched with your Career Profile' : 'Generated from Live Telemetry'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {selectedRec.title}
              </h3>
            </div>

            {/* Target Details Grid */}
            <div className="grid-3" style={{ background: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Skill / Area</div>
                <strong style={{ fontSize: '0.85rem', color: '#7c3aed' }}>{selectedRec.skillName || 'EV Diagnostics'}</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Location / Hub</div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {selectedRec.location || `${selectedRec.districtName || 'Pune'}, ${selectedRec.stateName || 'Maharashtra'}`}
                </strong>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Market Validation</div>
                <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>{selectedRec.confidence || selectedRec.forecastConfidence || 92}% High Match</strong>
              </div>
            </div>

            {/* Empirical Reasoning */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <TrendingUp size={16} color="#7c3aed" />
                <span>{isJobSeeker ? 'Why This Matters for Your Career' : 'Empirical Market Evidence & Deficit Analysis'}</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedRec.reasoning}
              </p>
            </div>

            {/* Suggested Action Protocol */}
            <div style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '1rem', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Lightbulb size={16} color="#7c3aed" />
                <span>{isJobSeeker ? 'Next Step to Take' : 'Recommended MSDE Action & Resource Allocation'}</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedRec.suggestedAction}
              </p>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                className="btn btn-ai btn-sm"
                onClick={() => {
                  setSelectedSkillId(selectedRec.skillId || 'sk-01');
                  setActiveTab('ai-analyst');
                }}
              >
                <Sparkles size={14} />
                <span>{isJobSeeker ? 'Ask Career Advisor for Learning Guide' : 'Simulate Policy Impact'}</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleExport}
              >
                <FileDown size={14} />
                <span>{isJobSeeker ? 'Save to My Plan' : 'Print Action Memo'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="card-white flex items-center justify-center p-12 text-slate-400">
            Select a recommendation to view details
          </div>
        )}
      </div>
    </div>
  );
};
