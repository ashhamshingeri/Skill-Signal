import React from 'react';

interface ConfidenceGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  subtext?: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  size = 120,
  label = 'Forecast Confidence',
  subtext = 'Statistical reliability',
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#ef4444'; // critical / low
  let level = 'Low Confidence';

  if (score >= 80) {
    color = '#10b981'; // high
    level = 'High Confidence';
  } else if (score >= 60) {
    color = '#38bdf8'; // medium-high
    level = 'Moderate Confidence';
  } else if (score >= 40) {
    color = '#f59e0b'; // warning
    level = 'Fair Confidence';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.65rem', color: color, fontWeight: 600, marginTop: 2 }}>
            {score >= 80 ? 'HIGH' : score >= 60 ? 'MED' : 'LOW'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtext} ({level})</div>
      </div>
    </div>
  );
};
