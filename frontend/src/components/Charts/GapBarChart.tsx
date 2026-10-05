import React from 'react';

interface SkillGapItem {
  name: string;
  demandIndex: number;
  supplyIndex: number;
  gapIndex: number;
  industry?: string;
}

interface GapBarChartProps {
  items: SkillGapItem[];
  maxItems?: number;
  title?: string;
}

export const GapBarChart: React.FC<GapBarChartProps> = ({
  items,
  maxItems = 6,
  title = 'Top Labour Market Skill Gaps',
}) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demand (Blue) vs. Training Output (Green) vs. Gap Deficit</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayItems.map((item, idx) => {
          const isShortage = item.gapIndex > 0;
          const gapPercent = Math.min(Math.abs(item.gapIndex), 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: isShortage ? '#f87171' : '#60a5fa',
                  }}
                >
                  {isShortage ? `+${item.gapIndex.toFixed(1)} Shortage` : `${item.gapIndex.toFixed(1)} Surplus`}
                </span>
              </div>

              {/* Multi-bar progress stack */}
              <div
                style={{
                  height: '8px',
                  background: 'var(--bg-surface-secondary)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                }}
              >
                {/* Demand Bar */}
                <div
                  style={{
                    width: `${Math.min(item.demandIndex, 100)}%`,
                    background: '#38bdf8',
                    height: '100%',
                    opacity: 0.85,
                  }}
                  title={`Demand Index: ${item.demandIndex}`}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Demand: <strong style={{ color: 'var(--text-secondary)' }}>{item.demandIndex}</strong></span>
                <span>Supply: <strong style={{ color: 'var(--text-secondary)' }}>{item.supplyIndex}</strong></span>
                <span>Gap Severity: <strong style={{ color: isShortage ? '#fb923c' : '#34d399' }}>{gapPercent.toFixed(0)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
