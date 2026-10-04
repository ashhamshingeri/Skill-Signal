import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GitFork,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  DollarSign,
  GraduationCap,
} from 'lucide-react';

interface Pathway {
  id: string;
  sourceSkill: string;
  sourceCategory: string;
  targetSkill: string;
  targetCategory: string;
  similarityScore: number;
  transitionWeeks: number;
  wageUplift: string;
  sharedCompetencies: string[];
  gapCurriculum: string[];
  rationale: string;
}

export const SubstitutionView: React.FC = () => {
  const { setActiveTab, setSelectedSkillId } = useApp();

  const pathways: Pathway[] = [
    {
      id: 'pw-01',
      sourceSkill: 'Internal Combustion Engine (ICE) Mechanic',
      sourceCategory: 'Legacy Automotive (Declining)',
      targetSkill: 'Electric Vehicle Powertrain Diagnostics',
      targetCategory: 'Green Tech (Critical Shortage)',
      similarityScore: 78,
      transitionWeeks: 4,
      wageUplift: '+42%',
      sharedCompetencies: [
        'Mechanical chassis assembly & suspension',
        'Braking & regenerative hydraulics',
        'OBD-II diagnostic tools & fault code reading',
        'Workshop safety & high-current protocols',
      ],
      gapCurriculum: [
        'High-voltage safety & battery disconnect protocols',
        'BMS (Battery Management System) CAN-bus telemetry',
        'PMSM electric traction motor diagnostics',
        'Thermal cooling loop failure simulation',
      ],
      rationale:
        'Mechanical aptitude translates seamlessly. Fast 4-week PMKVY bridge module eliminates 80% of standard 6-month training costs.',
    },
    {
      id: 'pw-02',
      sourceSkill: 'Traditional Electrical Wireman / Electrician',
      sourceCategory: 'Construction & Utilities',
      targetSkill: 'Solar PV Grid Integration & Inverter Tech',
      targetCategory: 'Renewable Energy (Surging Demand)',
      similarityScore: 84,
      transitionWeeks: 3,
      wageUplift: '+38%',
      sharedCompetencies: [
        'AC/DC circuit wiring and conduit routing',
        'Circuit breaker & isolator switch installation',
        'Earthing, grounding, and surge protection',
        'Multimeter and insulation resistance testing',
      ],
      gapCurriculum: [
        'Rooftop MPPT charge controller configuration',
        'Grid-tied micro-inverter synchronization & telemetry',
        'Net-metering DISCOM compliance standards',
        'Solar irradiance & shading optimization calculation',
      ],
      rationale:
        'Essential for rapid deployment under PM Surya Ghar Muft Bijli Yojana. 3-week intensive bridge certified by SCGJ.',
    },
    {
      id: 'pw-03',
      sourceSkill: 'Manual Keystroke Typist & Document Digitizer',
      sourceCategory: 'Back-Office BPO (At High Risk of Automation)',
      targetSkill: 'Multilingual AI Data Annotator & Prompt Evaluator',
      targetCategory: 'Information Technology (Emerging)',
      similarityScore: 72,
      transitionWeeks: 2,
      wageUplift: '+55%',
      sharedCompetencies: [
        'High typing speed & linguistic literacy in regional languages',
        'Computer workstation operation and text categorization',
        'Attention to detail and quality checklist verification',
      ],
      gapCurriculum: [
        'RLHF (Reinforcement Learning from Human Feedback) grading frameworks',
        'Hallucination and toxicity tagging guidelines',
        'Multimodal bounding box & segmentation labeling tools',
        'LLM prompt engineering verification protocols',
      ],
      rationale:
        'Prevents mass unemployment among entry-level BPO workers displaced by OCR/LLMs by pivoting them directly into LLM training pipelines.',
    },
    {
      id: 'pw-04',
      sourceSkill: 'General Electronics PCB Assembly Technician',
      sourceCategory: 'Consumer Electronics',
      targetSkill: 'Semiconductor VLSI Layout & Verification Associate',
      targetCategory: 'High-Tech Semiconductors (National Priority)',
      similarityScore: 68,
      transitionWeeks: 8,
      wageUplift: '+85%',
      sharedCompetencies: [
        'Schematic diagram interpretation & digital logic basics',
        'Microcontroller interfacing and bus standards',
        'Cleanroom ESD safety procedures and quality assurance',
      ],
      gapCurriculum: [
        'Cadence/Synopsys EDA toolchain basics',
        'DRC (Design Rule Checking) & LVS (Layout vs Schematic) verification',
        'CMOS transistor level layout design',
        'Static timing analysis constraints',
      ],
      rationale:
        'Addresses the acute talent deficit for India Semiconductor Mission (ISM) packaging and design facilities.',
    },
  ];

  const [activePathway, setActivePathway] = useState<Pathway>(pathways[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div className="card-white" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Skill Pathways
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-purple)', margin: '0.2rem 0 0.25rem 0' }}>
            Bridge critical shortages by retraining workers from adjacent surplus trades.
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Competency graph adjacency · 75%+ curriculum overlap · Accelerated bridge modules
          </div>
        </div>

        <button
          className="btn btn-ai btn-sm"
          onClick={() => setActiveTab('recommendations')}
        >
          <Sparkles size={14} />
          <span>Generate Transition Action Brief</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid: Left Pathway Cards + Right Curriculum Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }}>
        {/* Left Column: Pathway Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            High-Impact Pathways ({pathways.length})
          </div>

          {pathways.map((pw) => {
            const isSelected = activePathway.id === pw.id;
            return (
              <div
                key={pw.id}
                className="card-white"
                style={{
                  padding: '1.1rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'rgba(124, 58, 237, 0.4)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface)',
                  position: 'relative',
                }}
                onClick={() => setActivePathway(pw)}
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                    {pw.similarityScore}% Overlap
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    ⚡ {pw.transitionWeeks} Wks Bridge
                  </span>
                </div>

                {/* Flow indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>From (Surplus / Legacy)</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#ef4444' }}>
                      {pw.sourceSkill}
                    </div>
                  </div>
                  <ArrowRight size={16} color="#7c3aed" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>To (Critical Shortage)</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#7c3aed' }}>
                      {pw.targetSkill}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
                  <span>Wage Uplift: <strong style={{ color: '#10b981' }}>{pw.wageUplift}</strong></span>
                  <span>Cost Savings: <strong style={{ color: 'var(--text-primary)' }}>~75% vs New Batch</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Bridge Curriculum & Rationale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Card */}
          <div className="card-white" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                  Validated Career Transition Architecture
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activePathway.sourceSkill} ➔ {activePathway.targetSkill}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Expected Wage Uplift</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {activePathway.wageUplift}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.1rem' }}>
              {activePathway.rationale}
            </p>

            {/* Metrics */}
            <div className="grid-3">
              <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Similarity Score</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>
                  {activePathway.similarityScore}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bridge Course Length</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>
                  {activePathway.transitionWeeks} Weeks
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Deployment Readiness</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  Immediate
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side: Shared Competencies vs Gap Curriculum to Bridge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Shared Competencies */}
            <div className="card-white" style={{ padding: '1.1rem', borderLeft: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Preserved Competencies ({activePathway.similarityScore}%)
                </h4>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {activePathway.sharedCompetencies.map((comp, idx) => (
                  <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gap Curriculum to Bridge */}
            <div className="card-white" style={{ padding: '1.1rem', borderLeft: '3px solid #7c3aed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <BookOpen size={16} color="#7c3aed" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Bridge Curriculum ({activePathway.transitionWeeks} Wks)
                </h4>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {activePathway.gapCurriculum.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem' }}>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>➔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
