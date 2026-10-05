import React, { useState } from 'react';

export interface HeatmapRow {
  label: string; // e.g., District Name or State Name
  id: string;
  cells: Array<{
    skillId: string;
    skillName: string;
    gapIndex: number;
    demandIndex: number;
    supplyIndex: number;
    gapLevel: string;
  }>;
}

interface HeatmapMatrixProps {
  columns: string[]; // Skill Names
  rows: HeatmapRow[];
  title?: string;
  onCellClick?: (rowId: string, skillId: string) => void;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  columns,
  rows,
  title = 'Labour Market Gap Heatmap (Districts × Skill Clusters)',
  onCellClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    rowLabel: string;
    skillName: string;
    gapIndex: number;
    demandIndex: number;
    supplyIndex: number;
    gapLevel: string;
    x: number;
    y: number;
  } | null>(null);

  const getCellColor = (gapIndex: number) => {
    if (gapIndex >= 40) return '#ef4444'; // Critical shortage (bright crimson)
    if (gapIndex >= 20) return '#f97316'; // High shortage (orange)
    if (gapIndex >= 5) return '#f59e0b'; // Moderate shortage (amber)
    if (gapIndex >= -10) return '#10b981'; // Balanced (emerald)
    if (gapIndex >= -30) return '#3b82f6'; // Surplus (blue)
    return '#6366f1'; // Critical surplus (indigo)
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time demand-supply delta matrix</span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Crit Shortage (&gt;+40)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Shortage (+5..+40)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Balanced (±10)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }}></span>
            <span style={{ color: 'var(--text-secondary)' }}>Surplus (&lt;-10)</span>
          </div>
        </div>
      </div>

      <div style={{ minWidth: '700px', position: 'relative' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, width: '160px' }}>
                District / Region
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    textAlign: 'center',
                    maxWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={col}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                <td
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    background: 'var(--bg-surface-secondary)',
                    borderRadius: '4px',
                  }}
                >
                  {row.label}
                </td>
                {row.cells.map((cell, cIdx) => {
                  const color = getCellColor(cell.gapIndex);
                  return (
                    <td
                      key={cIdx}
                      className="heatmap-cell"
                      style={{
                        background: color,
                        opacity: 0.85,
                        height: '36px',
                        textAlign: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        userSelect: 'none',
                      }}
                      onClick={() => onCellClick?.(row.id, cell.skillId)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          rowLabel: row.label,
                          skillName: cell.skillName,
                          gapIndex: cell.gapIndex,
                          demandIndex: cell.demandIndex,
                          supplyIndex: cell.supplyIndex,
                          gapLevel: cell.gapLevel,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {cell.gapIndex > 0 ? `+${Math.round(cell.gapIndex)}` : Math.round(cell.gapIndex)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Hover Floating Tooltip */}
        {hoveredCell && (
          <div
            style={{
              position: 'fixed',
              top: hoveredCell.y - 95,
              left: hoveredCell.x - 100,
              width: '200px',
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.75rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              pointerEvents: 'none',
              transform: 'translateX(0)',
            }}
          >
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{hoveredCell.rowLabel}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: 4 }}>{hoveredCell.skillName}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Demand: <strong>{hoveredCell.demandIndex}</strong></span>
              <span>Supply: <strong>{hoveredCell.supplyIndex}</strong></span>
            </div>
            <div style={{ marginTop: 2, fontWeight: 700, color: hoveredCell.gapIndex > 0 ? '#f87171' : '#34d399' }}>
              Gap: {hoveredCell.gapIndex > 0 ? `+${hoveredCell.gapIndex.toFixed(1)} (Shortage)` : `${hoveredCell.gapIndex.toFixed(1)} (Surplus)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
