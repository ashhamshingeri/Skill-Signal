import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TrendLineChart } from '../components/Charts/TrendLineChart';
import { ConfidenceGauge } from '../components/Charts/ConfidenceGauge';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ForecastEngineView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [horizon, setHorizon] = useState<'3m' | '6m' | '12m'>('6m');
  const [selectedSkill, setSelectedSkill] = useState<string>('ev');

  const skillOptions = [
    {
      id: 'ev',
      name: 'Electric Vehicle Powertrain Diagnostics',
      industry: 'Automotive & Clean Mobility',
      trendMomentum: '+52.4% YoY',
      seasonalMultiplier: '1.18x (Q3 Surge)',
      halfLife: '20 Months',
      confidenceInterval: '±6.8% (95% CI)',
      confidenceScores: { '3m': 94, '6m': 89, '12m': 82 },
      baseTrajectory: [
        { month: 'Oct 25', demand: 65, supply: 44 },
        { month: 'Nov 25', demand: 70, supply: 46 },
        { month: 'Dec 25', demand: 76, supply: 48 },
        { month: 'Jan 26', demand: 82, supply: 50 },
        { month: 'Feb 26', demand: 88, supply: 51 },
        { month: 'Mar 26', demand: 94, supply: 53 },
        { month: 'Apr 26', demand: 100, supply: 55, forecastDemand: 100, lowerConfidence: 93, upperConfidence: 107 },
        { month: 'May 26', demand: 106, supply: 57, forecastDemand: 106, lowerConfidence: 97, upperConfidence: 115 },
        { month: 'Jun 26', demand: 113, supply: 58, forecastDemand: 113, lowerConfidence: 102, upperConfidence: 124 },
        { month: 'Jul 26', demand: 120, supply: 60, forecastDemand: 120, lowerConfidence: 106, upperConfidence: 134 },
        { month: 'Aug 26', demand: 127, supply: 62, forecastDemand: 127, lowerConfidence: 110, upperConfidence: 144 },
        { month: 'Sep 26', demand: 135, supply: 64, forecastDemand: 135, lowerConfidence: 114, upperConfidence: 156 },
        { month: 'Oct 26', demand: 143, supply: 66, forecastDemand: 143, lowerConfidence: 118, upperConfidence: 168 },
        { month: 'Nov 26', demand: 151, supply: 68, forecastDemand: 151, lowerConfidence: 122, upperConfidence: 180 },
        { month: 'Dec 26', demand: 160, supply: 70, forecastDemand: 160, lowerConfidence: 126, upperConfidence: 194 },
        { month: 'Jan 27', demand: 169, supply: 72, forecastDemand: 169, lowerConfidence: 130, upperConfidence: 208 },
        { month: 'Feb 27', demand: 178, supply: 74, forecastDemand: 178, lowerConfidence: 134, upperConfidence: 222 },
        { month: 'Mar 27', demand: 188, supply: 76, forecastDemand: 188, lowerConfidence: 138, upperConfidence: 238 },
      ],
    },
    {
      id: 'vlsi',
      name: 'Semiconductor VLSI Layout & Verification',
      industry: 'Electronics & Chips',
      trendMomentum: '+68.0% YoY',
      seasonalMultiplier: '1.06x (Tech Cycle)',
      halfLife: '18 Months',
      confidenceInterval: '±8.4% (95% CI)',
      confidenceScores: { '3m': 96, '6m': 91, '12m': 85 },
      baseTrajectory: [
        { month: 'Oct 25', demand: 48, supply: 26 },
        { month: 'Nov 25', demand: 54, supply: 27 },
        { month: 'Dec 25', demand: 61, supply: 29 },
        { month: 'Jan 26', demand: 69, supply: 30 },
        { month: 'Feb 26', demand: 77, supply: 32 },
        { month: 'Mar 26', demand: 86, supply: 33 },
        { month: 'Apr 26', demand: 94, supply: 35, forecastDemand: 94, lowerConfidence: 86, upperConfidence: 102 },
        { month: 'May 26', demand: 103, supply: 37, forecastDemand: 103, lowerConfidence: 93, upperConfidence: 113 },
        { month: 'Jun 26', demand: 112, supply: 39, forecastDemand: 112, lowerConfidence: 100, upperConfidence: 124 },
        { month: 'Jul 26', demand: 121, supply: 41, forecastDemand: 121, lowerConfidence: 106, upperConfidence: 136 },
        { month: 'Aug 26', demand: 130, supply: 43, forecastDemand: 130, lowerConfidence: 112, upperConfidence: 148 },
        { month: 'Sep 26', demand: 140, supply: 45, forecastDemand: 140, lowerConfidence: 118, upperConfidence: 162 },
        { month: 'Oct 26', demand: 150, supply: 47, forecastDemand: 150, lowerConfidence: 124, upperConfidence: 176 },
        { month: 'Nov 26', demand: 161, supply: 49, forecastDemand: 161, lowerConfidence: 130, upperConfidence: 192 },
        { month: 'Dec 26', demand: 172, supply: 51, forecastDemand: 172, lowerConfidence: 136, upperConfidence: 208 },
        { month: 'Jan 27', demand: 184, supply: 53, forecastDemand: 184, lowerConfidence: 142, upperConfidence: 226 },
        { month: 'Feb 27', demand: 196, supply: 55, forecastDemand: 196, lowerConfidence: 148, upperConfidence: 244 },
        { month: 'Mar 27', demand: 209, supply: 57, forecastDemand: 209, lowerConfidence: 154, upperConfidence: 264 },
      ],
    },
    {
      id: 'solar',
      name: 'Solar PV Grid Integration & Inverter Maintenance',
      industry: 'Renewable Energy',
      trendMomentum: '+38.5% YoY',
      seasonalMultiplier: '1.34x (Peak Summer)',
      halfLife: '36 Months',
      confidenceInterval: '±5.2% (95% CI)',
      confidenceScores: { '3m': 95, '6m': 92, '12m': 88 },
      baseTrajectory: [
        { month: 'Oct 25', demand: 52, supply: 40 },
        { month: 'Nov 25', demand: 55, supply: 42 },
        { month: 'Dec 25', demand: 58, supply: 44 },
        { month: 'Jan 26', demand: 64, supply: 47 },
        { month: 'Feb 26', demand: 72, supply: 50 },
        { month: 'Mar 26', demand: 82, supply: 54 },
        { month: 'Apr 26', demand: 92, supply: 58, forecastDemand: 92, lowerConfidence: 87, upperConfidence: 97 },
        { month: 'May 26', demand: 104, supply: 63, forecastDemand: 104, lowerConfidence: 97, upperConfidence: 111 },
        { month: 'Jun 26', demand: 112, supply: 68, forecastDemand: 112, lowerConfidence: 103, upperConfidence: 121 },
        { month: 'Jul 26', demand: 108, supply: 72, forecastDemand: 108, lowerConfidence: 98, upperConfidence: 118 },
        { month: 'Aug 26', demand: 98, supply: 75, forecastDemand: 98, lowerConfidence: 87, upperConfidence: 109 },
        { month: 'Sep 26', demand: 92, supply: 77, forecastDemand: 92, lowerConfidence: 80, upperConfidence: 104 },
        { month: 'Oct 26', demand: 88, supply: 79, forecastDemand: 88, lowerConfidence: 75, upperConfidence: 101 },
        { month: 'Nov 26', demand: 86, supply: 81, forecastDemand: 86, lowerConfidence: 72, upperConfidence: 100 },
        { month: 'Dec 26', demand: 90, supply: 83, forecastDemand: 90, lowerConfidence: 74, upperConfidence: 106 },
        { month: 'Jan 27', demand: 98, supply: 86, forecastDemand: 98, lowerConfidence: 80, upperConfidence: 116 },
        { month: 'Feb 27', demand: 110, supply: 89, forecastDemand: 110, lowerConfidence: 89, upperConfidence: 131 },
        { month: 'Mar 27', demand: 124, supply: 93, forecastDemand: 124, lowerConfidence: 100, upperConfidence: 148 },
      ],
    },
    {
      id: 'genai',
      name: 'Generative AI & LLM Fine-Tuning',
      industry: 'Information Technology',
      trendMomentum: '+94.2% YoY',
      seasonalMultiplier: '1.12x (Enterprise Adoption)',
      halfLife: '12 Months',
      confidenceInterval: '±11.6% (95% CI)',
      confidenceScores: { '3m': 91, '6m': 84, '12m': 76 },
      baseTrajectory: [
        { month: 'Oct 25', demand: 72, supply: 32 },
        { month: 'Nov 25', demand: 82, supply: 34 },
        { month: 'Dec 25', demand: 94, supply: 36 },
        { month: 'Jan 26', demand: 108, supply: 38 },
        { month: 'Feb 26', demand: 122, supply: 40 },
        { month: 'Mar 26', demand: 138, supply: 43 },
        { month: 'Apr 26', demand: 154, supply: 46, forecastDemand: 154, lowerConfidence: 136, upperConfidence: 172 },
        { month: 'May 26', demand: 172, supply: 49, forecastDemand: 172, lowerConfidence: 148, upperConfidence: 196 },
        { month: 'Jun 26', demand: 192, supply: 52, forecastDemand: 192, lowerConfidence: 160, upperConfidence: 224 },
        { month: 'Jul 26', demand: 214, supply: 55, forecastDemand: 214, lowerConfidence: 172, upperConfidence: 256 },
        { month: 'Aug 26', demand: 238, supply: 58, forecastDemand: 238, lowerConfidence: 184, upperConfidence: 292 },
        { month: 'Sep 26', demand: 264, supply: 61, forecastDemand: 264, lowerConfidence: 196, upperConfidence: 332 },
        { month: 'Oct 26', demand: 292, supply: 64, forecastDemand: 292, lowerConfidence: 208, upperConfidence: 376 },
        { month: 'Nov 26', demand: 322, supply: 67, forecastDemand: 322, lowerConfidence: 220, upperConfidence: 424 },
        { month: 'Dec 26', demand: 354, supply: 70, forecastDemand: 354, lowerConfidence: 232, upperConfidence: 476 },
        { month: 'Jan 27', demand: 388, supply: 73, forecastDemand: 388, lowerConfidence: 244, upperConfidence: 532 },
        { month: 'Feb 27', demand: 424, supply: 76, forecastDemand: 424, lowerConfidence: 256, upperConfidence: 592 },
        { month: 'Mar 27', demand: 462, supply: 79, forecastDemand: 462, lowerConfidence: 268, upperConfidence: 656 },
      ],
    },
    {
      id: 'cnc',
      name: 'CNC 5-Axis Precision Machining',
      industry: 'Advanced Manufacturing',
      trendMomentum: '+24.6% YoY',
      seasonalMultiplier: '1.08x (Fiscal Q4 Delivery)',
      halfLife: '48 Months',
      confidenceInterval: '±4.0% (95% CI)',
      confidenceScores: { '3m': 98, '6m': 95, '12m': 92 },
      baseTrajectory: [
        { month: 'Oct 25', demand: 56, supply: 48 },
        { month: 'Nov 25', demand: 59, supply: 50 },
        { month: 'Dec 25', demand: 62, supply: 52 },
        { month: 'Jan 26', demand: 65, supply: 54 },
        { month: 'Feb 26', demand: 68, supply: 56 },
        { month: 'Mar 26', demand: 72, supply: 58 },
        { month: 'Apr 26', demand: 75, supply: 60, forecastDemand: 75, lowerConfidence: 72, upperConfidence: 78 },
        { month: 'May 26', demand: 78, supply: 62, forecastDemand: 78, lowerConfidence: 74, upperConfidence: 82 },
        { month: 'Jun 26', demand: 81, supply: 64, forecastDemand: 81, lowerConfidence: 76, upperConfidence: 86 },
        { month: 'Jul 26', demand: 84, supply: 66, forecastDemand: 84, lowerConfidence: 78, upperConfidence: 90 },
        { month: 'Aug 26', demand: 87, supply: 68, forecastDemand: 87, lowerConfidence: 80, upperConfidence: 94 },
        { month: 'Sep 26', demand: 90, supply: 70, forecastDemand: 90, lowerConfidence: 82, upperConfidence: 98 },
        { month: 'Oct 26', demand: 93, supply: 72, forecastDemand: 93, lowerConfidence: 84, upperConfidence: 102 },
        { month: 'Nov 26', demand: 96, supply: 74, forecastDemand: 96, lowerConfidence: 86, upperConfidence: 106 },
        { month: 'Dec 26', demand: 100, supply: 76, forecastDemand: 100, lowerConfidence: 88, upperConfidence: 112 },
        { month: 'Jan 27', demand: 103, supply: 78, forecastDemand: 103, lowerConfidence: 90, upperConfidence: 116 },
        { month: 'Feb 27', demand: 107, supply: 80, forecastDemand: 107, lowerConfidence: 92, upperConfidence: 122 },
        { month: 'Mar 27', demand: 112, supply: 82, forecastDemand: 112, lowerConfidence: 95, upperConfidence: 129 },
      ],
    },
  ];

  const currentSkillProfile = skillOptions.find((s) => s.id === selectedSkill) || skillOptions[0];

  // Slice dataset based on active horizon (3m: 9 points total, 6m: 12 points total, 12m: 18 points total)
  const getFilteredChartData = () => {
    const length = horizon === '3m' ? 9 : horizon === '6m' ? 12 : 18;
    return currentSkillProfile.baseTrajectory.slice(0, length);
  };

  const chartData = getFilteredChartData();
  const currentConfidence = currentSkillProfile.confidenceScores[horizon];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">Forecasting Engine v1.0</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Statistical Time-Series & Multi-Factor Decomposition</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Skill Demand & Supply Forward Projections
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Predicting multi-quarter labour market requirements with 95% confidence intervals and seasonal adjustments.
          </p>
        </div>

        {/* Horizon Picker */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {(['3m', '6m', '12m'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: horizon === h ? '#0284c7' : 'transparent',
                color: horizon === h ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {h === '3m' ? '3 Months' : h === '6m' ? '6 Months' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Main Grid: Forecast Visualizer (Left) + Model Decomposition (Right) */}
      <div className="forecast-grid-layout">
        {/* Left: Forecast Chart & Skill Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Skill Selector Tab Bar */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {skillOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedSkill(opt.id)}
                style={{
                  padding: '7px 13px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedSkill === opt.id ? 'var(--primary-color)' : 'var(--border-subtle)',
                  background: selectedSkill === opt.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface-secondary)',
                  color: selectedSkill === opt.id ? 'var(--primary-color)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: selectedSkill === opt.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.name.split(' ')[0]} {opt.name.split(' ')[1]}
              </button>
            ))}
          </div>

          <TrendLineChart
            data={chartData}
            title={`${skillOptions.find(s => s.id === selectedSkill)?.name} (${horizon.toUpperCase()})`}
            showConfidenceInterval={true}
            height={300}
          />
        </div>

        {/* Right: Factor Decomposition & Confidence Score */}
        <div className="glass-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Model Factor Decomposition
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Holt-Winters Seasonal Weights & Reliability
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <ConfidenceGauge score={currentConfidence} label="Forecast Confidence" subtext={`${currentSkillProfile.name.split(' ')[0]} ${horizon.toUpperCase()} horizon`} />
          </div>

          {/* 4 Multiplicative Factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={15} color="#0284c7" />
                <span style={{ color: 'var(--text-secondary)' }}>Trend Momentum Weight</span>
              </div>
              <strong style={{ color: '#0284c7' }}>{currentSkillProfile.trendMomentum}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="#d97706" />
                <span style={{ color: 'var(--text-secondary)' }}>Seasonal Peak Multiplier</span>
              </div>
              <strong style={{ color: '#d97706' }}>{currentSkillProfile.seasonalMultiplier}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="#7c3aed" />
                <span style={{ color: 'var(--text-secondary)' }}>Skill Decay Half-Life</span>
              </div>
              <strong style={{ color: '#7c3aed' }}>{currentSkillProfile.halfLife}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={15} color="#059669" />
                <span style={{ color: 'var(--text-secondary)' }}>Confidence Interval</span>
              </div>
              <strong style={{ color: '#059669' }}>{currentSkillProfile.confidenceInterval}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Model Methodology Explanation Box */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Info size={16} color="#38bdf8" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Methodology: SkillSignal Multi-Factor Forecasting Architecture
          </h4>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Projections combine exponential smoothing with Holt-Winters seasonal decomposition and domain-specific half-life adjustments.
          Hiring demand is extracted from NCS and private portals, cross-validated against PMKVY batch completion lead-times (typically 12-16 weeks) to model true time-to-market placement readiness.
        </p>
      </div>
    </div>
  );
};
