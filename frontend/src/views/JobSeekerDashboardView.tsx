import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  GraduationCap,
  Target,
  Compass,
  MapPin,
  ChevronRight,
  BookOpen,
  Award,
  Zap,
  Plus,
  Edit3,
} from 'lucide-react';

export const JobSeekerDashboardView: React.FC = () => {
  const { user, updateUser, setActiveTab, setSelectedSkillId } = useApp();
  const [showCareerSelector, setShowCareerSelector] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Target career options
  const targetCareerOptions = [
    { id: 'ev', title: 'Electric Vehicle Powertrain Diagnostics', sector: 'Green Automotive', growth: '+52% YoY', bridgeWeeks: 4, wageUplift: '+42%', overlap: 78 },
    { id: 'solar', title: 'Solar PV Grid Integration & Inverter Maintenance', sector: 'Clean Energy', growth: '+44% YoY', bridgeWeeks: 3, wageUplift: '+38%', overlap: 84 },
    { id: 'ai-data', title: 'Multilingual AI Data Annotator & Prompt Evaluator', sector: 'Information Technology', growth: '+62% YoY', bridgeWeeks: 2, wageUplift: '+55%', overlap: 72 },
    { id: 'vlsi', title: 'Semiconductor VLSI Layout & Verification Associate', sector: 'Electronics & Chips', growth: '+65% YoY', bridgeWeeks: 8, wageUplift: '+85%', overlap: 68 },
    { id: 'cnc', title: 'CNC 5-Axis Precision Machining Specialist', sector: 'Advanced Manufacturing', growth: '+28% YoY', bridgeWeeks: 4, wageUplift: '+32%', overlap: 75 },
  ];

  const isRealUser = !user?.isDemoAccount;
  const isFreshAccount = isRealUser && (!user?.targetCareer && (!user?.currentSkills || user.currentSkills.length === 0));

  // Current profile attributes - only fallback to dummy records for Demo persona
  const currentOccupation = user?.currentOccupation || (isRealUser ? 'Candidate Profile (Pending Role Setup)' : 'Internal Combustion Engine (ICE) Mechanic');
  const targetCareer = user?.targetCareer || (isRealUser ? '' : 'Electric Vehicle Powertrain Diagnostics');
  const education = user?.education || (isRealUser ? 'Self-Directed / Unspecified' : 'Diploma in Mechanical Engineering');
  const currentSkills = user?.currentSkills && user.currentSkills.length > 0
    ? user.currentSkills
    : isRealUser
    ? []
    : [
        'Mechanical chassis assembly & suspension',
        'Braking & regenerative hydraulics',
        'OBD-II diagnostic tools & fault code reading',
        'Workshop safety & high-current protocols',
      ];

  // Specific skill gaps based on selected target career
  const getSkillGapsForTarget = (target: string) => {
    if (!target) return [];
    if (target.includes('Electric Vehicle') || target.includes('EV')) {
      return [
        { name: 'High-voltage EV safety & disconnect protocols', duration: '1 Week', difficulty: 'Essential', status: 'pending' },
        { name: 'Battery Management Systems (BMS) CAN-bus telemetry', duration: '1.5 Weeks', difficulty: 'High Impact', status: 'pending' },
        { name: 'PMSM electric traction motor diagnostics', duration: '1 Week', difficulty: 'Technical', status: 'pending' },
        { name: 'Thermal cooling loop failure simulation', duration: '0.5 Week', difficulty: 'Practical', status: 'pending' },
      ];
    }
    if (target.includes('Solar')) {
      return [
        { name: 'Rooftop MPPT charge controller configuration', duration: '1 Week', difficulty: 'High Impact', status: 'pending' },
        { name: 'Grid-tied micro-inverter synchronization', duration: '1 Week', difficulty: 'Technical', status: 'pending' },
        { name: 'Net-metering DISCOM compliance standards', duration: '0.5 Week', difficulty: 'Regulatory', status: 'pending' },
        { name: 'Solar irradiance & shading calculation', duration: '0.5 Week', difficulty: 'Practical', status: 'pending' },
      ];
    }
    if (target.includes('AI') || target.includes('Annotator')) {
      return [
        { name: 'RLHF grading frameworks & rubric evaluation', duration: '1 Week', difficulty: 'High Impact', status: 'pending' },
        { name: 'Hallucination & toxicity tagging protocols', duration: '0.5 Week', difficulty: 'Practical', status: 'pending' },
        { name: 'Multimodal bounding box & segmentation tools', duration: '0.5 Week', difficulty: 'Technical', status: 'pending' },
      ];
    }
    return [
      { name: 'Specialized diagnostic toolsets & EDA cadence', duration: '2 Weeks', difficulty: 'High Impact', status: 'pending' },
      { name: 'Safety and compliance certification', duration: '1 Week', difficulty: 'Essential', status: 'pending' },
    ];
  };

  const skillGaps = getSkillGapsForTarget(targetCareer);

  // Calculate readiness score
  const selectedCareerMeta = targetCareerOptions.find(c => c.title === targetCareer) || targetCareerOptions[0];
  const readinessScore = targetCareer
    ? Math.min(Math.round(selectedCareerMeta.overlap * (currentSkills.length > 0 ? (currentSkills.length / 4) : 0.5)), 95)
    : 0;

  const handleSelectTargetCareer = (careerTitle: string) => {
    updateUser({ targetCareer: careerTitle });
    setShowCareerSelector(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const updated = [...currentSkills, newSkillInput.trim()];
    updateUser({ currentSkills: updated });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter(s => s !== skillToRemove);
    updateUser({ currentSkills: updated });
  };

  // Trajectory data for target career demand
  const targetCareerTrend = [
    { month: 'Oct 25', demand: 54, supply: 22 },
    { month: 'Nov 25', demand: 62, supply: 24 },
    { month: 'Dec 25', demand: 70, supply: 27 },
    { month: 'Jan 26', demand: 79, supply: 29 },
    { month: 'Feb 26', demand: 86, supply: 31 },
    { month: 'Mar 26', demand: 92, supply: 33 },
    { month: 'Apr 26', demand: 98, supply: 35, forecastDemand: 98, lowerConfidence: 91, upperConfidence: 105 },
    { month: 'May 26', demand: 104, supply: 37, forecastDemand: 104, lowerConfidence: 96, upperConfidence: 112 },
    { month: 'Jun 26', demand: 110, supply: 39, forecastDemand: 110, lowerConfidence: 100, upperConfidence: 120 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Top Personalized Hero Banner ───────────────────────────── */}
      <div
        className="card-white"
        style={{
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(124, 58, 237, 0.05) 100%)',
          borderLeft: '4px solid #7c3aed',
          borderRadius: '18px',
        }}
      >
        <div style={{ maxWidth: '760px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-signature">Candidate Career Workspace</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Personalized labour market intelligence for {user?.name || 'Aakash Sharma'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.4rem' }}>
            What should you do next in your career?
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', margin: '0.6rem 0 1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-surface-secondary)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Briefcase size={14} color="#64748b" />
              <span>Current: <strong>{currentOccupation}</strong></span>
            </div>

            <ArrowRight size={14} color="#7c3aed" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(124, 58, 237, 0.1)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.25)', fontSize: '0.8rem', color: '#7c3aed' }}>
              <Target size={14} color="#7c3aed" />
              <span>Target: <strong>{targetCareer || 'Select Target Career'}</strong></span>
            </div>

            <button
              onClick={() => setShowCareerSelector(!showCareerSelector)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.72rem', padding: '2px 8px', color: '#7c3aed' }}
            >
              <Edit3 size={12} />
              <span>{targetCareer ? 'Change Target' : 'Select Target'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {targetCareer && selectedCareerMeta ? (
              <>
                Hiring demand for <strong>{targetCareer}</strong> is growing at <strong>{selectedCareerMeta.growth}</strong> in your region. With your background, a <strong>{selectedCareerMeta.bridgeWeeks}-week bridge module</strong> qualifies you with an estimated <strong>{selectedCareerMeta.wageUplift} wage uplift</strong>.
              </>
            ) : (
              'Welcome! Select a target high-growth career pathway below to discover your skill gap index, training bridge durations, and wage uplift.'
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
          <button
            className="btn btn-signature btn-md"
            onClick={() => {
              if (!targetCareer) {
                setShowCareerSelector(true);
              } else {
                setSelectedSkillId('sk-01');
                setActiveTab('substitution');
              }
            }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Compass size={15} />
            <span>{targetCareer ? 'View Bridge Pathway' : 'Choose Target Pathway'}</span>
          </button>

          <button
            className="btn btn-secondary btn-md"
            onClick={() => setActiveTab('ai-analyst')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Sparkles size={15} color="#7c3aed" />
            <span>Ask AI Career Advisor</span>
          </button>
        </div>
      </div>

      {/* ── Target Career Quick Selector Modal / Accordion ───────────── */}
      {showCareerSelector && (
        <div className="card-white" style={{ padding: '1.25rem 1.5rem', border: '1px solid #7c3aed', background: 'var(--bg-surface-secondary)', borderRadius: '14px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Select Your Target In-Demand Career
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Readiness score & recommendations update dynamically
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {targetCareerOptions.map((opt) => {
              const isSelected = opt.title === targetCareer;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectTargetCareer(opt.title)}
                  style={{
                    padding: '0.9rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isSelected ? '#7c3aed' : 'var(--border-subtle)',
                    background: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#7c3aed' : 'var(--text-primary)' }}>
                      {opt.title}
                    </span>
                    {isSelected && <CheckCircle2 size={16} color="#7c3aed" />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                    {opt.sector}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>Demand: <strong style={{ color: '#0891b2' }}>{opt.growth}</strong></span>
                    <span>Wage: <strong style={{ color: '#10b981' }}>{opt.wageUplift}</strong></span>
                    <span>Bridge: <strong>{opt.bridgeWeeks} wks</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4 Top Career KPI Cards ──────────────────────────────────── */}
      <div className="grid-4">
        {/* Card 1: Skill Readiness Score */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            borderTop: '3px solid #7c3aed',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => (!targetCareer ? setShowCareerSelector(true) : setActiveTab('gaps'))}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Skill Readiness Match
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#7c3aed', margin: '0.2rem 0' }}>
            {targetCareer ? `${readinessScore}%` : 'Setup'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: targetCareer ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            {targetCareer ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{targetCareer ? (readinessScore >= 60 ? 'Calculated from current skills' : 'Bridge courses needed') : 'Select target career to compute'}</span>
          </div>
        </div>

        {/* Card 2: Market Hiring Momentum */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            borderTop: '3px solid #0891b2',
            boxShadow: '0 4px 20px rgba(8, 145, 178, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('skills')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hiring Momentum
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(8, 145, 178, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#0891b2" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0891b2', margin: '0.2rem 0' }}>
            {targetCareer && selectedCareerMeta ? selectedCareerMeta.growth : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {targetCareer ? 'Open vacancies in industrial cluster' : 'Choose target career to view demand'}
          </div>
        </div>

        {/* Card 3: Bridge Course Length */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            borderTop: '3px solid #d97706',
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('substitution')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Bridge Duration
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#d97706', margin: '0.2rem 0' }}>
            {targetCareer && selectedCareerMeta ? `${selectedCareerMeta.bridgeWeeks} Wks` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: targetCareer ? '#059669' : 'var(--text-muted)', fontWeight: 600 }}>
            {targetCareer ? 'PMKVY 4.0 Subsidized bridge duration' : 'Awaiting target career selection'}
          </div>
        </div>

        {/* Card 4: Projected Wage Uplift */}
        <div
          className="card-white"
          style={{
            padding: '1.5rem',
            borderTop: '3px solid #10b981',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('recommendations')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Potential Wage Uplift
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981', margin: '0.2rem 0' }}>
            {targetCareer && selectedCareerMeta ? selectedCareerMeta.wageUplift : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: targetCareer ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            {targetCareer ? 'Estimated increase over current base wage' : 'Select target career'}
          </div>
        </div>
      </div>

      {/* ── Middle Grid: Current Competencies vs Skill Gaps Breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem' }}>
        {/* Left Column: Your Current Competencies */}
        <div className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Your Preserved Competencies ({currentSkills.length})
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Skills from your background recognized in the labour market
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              Verified
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentSkills.map((skill, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} color="#10b981" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {skill}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  title="Remove skill"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Skill Input */}
          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="text"
              placeholder="Add another skill you possess..."
              className="input-field"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              style={{ fontSize: '0.8rem', height: '36px' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0, height: '36px' }}>
              <Plus size={14} />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Right Column: Skill Gaps to Bridge */}
        <div className="card-white" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Skill Gaps to Bridge for {targetCareer}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Acquire these {skillGaps.length} targeted skills to achieve full career readiness
              </p>
            </div>
            <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
              {skillGaps.length} Skills Needed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {skillGaps.map((gap, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {gap.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Bridge Time: <strong>{gap.duration}</strong> • Level: <strong>{gap.difficulty}</strong>
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedSkillId('sk-01');
                    setActiveTab('skills');
                  }}
                  style={{ fontSize: '0.72rem', padding: '3px 8px', flexShrink: 0 }}
                >
                  <BookOpen size={12} />
                  <span>Learn</span>
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total estimated transition time: <strong>{selectedCareerMeta.bridgeWeeks} weeks</strong>
            </span>
            <button
              className="btn btn-signature btn-sm"
              onClick={() => setActiveTab('substitution')}
            >
              <span>Explore Complete Curriculum</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Learning & Career Recommendations Grid ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Left: Action Roadmap */}
        <div className="card-white" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Recommended Career Action Steps
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                High-priority milestones generated from your profile and current market trends
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveTab('recommendations')}
              style={{ fontSize: '0.75rem', color: '#7c3aed' }}
            >
              View All Actions
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                step: 1,
                title: 'Complete 4-Week EV Powertrain Diagnostics Bridge Module',
                desc: '100% government fee subsidy under PMKVY 4.0. Nearest accredited centers: Government ITI Pune & ITI Bengaluru.',
                badge: 'Immediate Action',
                color: '#7c3aed',
                tab: 'substitution' as const,
              },
              {
                step: 2,
                title: 'Master Battery Management Systems (BMS) & CAN-Bus Telemetry',
                desc: 'Over 88% of open EV technician roles require CAN-bus fault diagnosis. Practice on virtual simulation rigs.',
                badge: 'Skill Focus',
                color: '#0891b2',
                tab: 'skills' as const,
              },
              {
                step: 3,
                title: 'Obtain Level 2 High-Voltage Safety Protocol Certificate',
                desc: 'Essential regulatory clearance for handling >400V DC traction batteries in OEM workshops.',
                badge: 'Certification',
                color: '#d97706',
                tab: 'recommendations' as const,
              },
              {
                step: 4,
                title: 'Explore OEM & Fleet Hiring in Pune Chakan & Bengaluru',
                desc: 'Hiring expansion by Tata Motors, Mahindra Electric, and EV logistics fleets. 1,450 active postings.',
                badge: 'Opportunities',
                color: '#10b981',
                tab: 'districts' as const,
              },
            ].map((rec) => (
              <div
                key={rec.step}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onClick={() => setActiveTab(rec.tab)}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {rec.step}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rec.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: rec.color,
                        background: `${rec.color}15`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {rec.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {rec.desc}
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" style={{ marginTop: '6px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive AI Assistant Widget & Local Hubs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* AI Advisor Prompt Box */}
          <div
            className="card-white"
            style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="#7c3aed" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                AI Career Advisor
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
              Get answers about salary ranges, certificate requirements, or transition pathways from our intelligence engine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                'What skills should I learn for an EV career?',
                'Which career is closest to my mechanical background?',
                'What are the certifications needed for battery management?',
              ].map((promptText, i) => (
                <button
                  key={i}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('ai-analyst')}
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    fontSize: '0.74rem',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '8px',
                    width: '100%',
                  }}
                >
                  <ArrowRight size={11} color="#7c3aed" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Regional Hiring Districts */}
          <div className="card-white" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Hiring Districts for {targetCareer.split(' ')[0]}
              </div>
              <MapPin size={15} color="#0891b2" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              {[
                { district: 'Pune & Pimpri (Maharashtra)', vacancies: '1,850 Vacancies', trend: '+52% YoY' },
                { district: 'Bengaluru Urban (Karnataka)', vacancies: '1,420 Vacancies', trend: '+48% YoY' },
                { district: 'Chennai & Sriperumbudur (Tamil Nadu)', vacancies: '1,100 Vacancies', trend: '+39% YoY' },
              ].map((hub, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.4rem 0.6rem',
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: '6px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hub.district}</span>
                  <span style={{ color: '#0891b2', fontWeight: 700 }}>{hub.vacancies}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Market Trajectory Trend Chart ────────────────────────────── */}
      <TrendLineChart
        data={targetCareerTrend}
        title={`Labour Market Demand Trajectory: ${targetCareer} (Historical + 3-Mo Forecast)`}
      />
    </div>
  );
};
