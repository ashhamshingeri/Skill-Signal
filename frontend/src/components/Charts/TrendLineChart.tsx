import React, { useState } from 'react';

interface DataPoint {
  month: string;
  demand: number;
  supply: number;
  forecastDemand?: number;
  forecastSupply?: number;
  lowerConfidence?: number;
  upperConfidence?: number;
}

interface TrendLineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showConfidenceInterval?: boolean;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title = 'Demand vs. Supply Trend & Forecast',
  height = 240,
  showConfidenceInterval = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center p-8 text-center text-slate-400">
        No time-series data available
      </div>
    );
  }

  const width = 600;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max value for Y-axis
  const allValues = data.flatMap(d => [
    d.demand,
    d.supply,
    d.forecastDemand || 0,
    d.upperConfidence || 0,
  ]);
  const maxValue = Math.max(...allValues, 100) * 1.15;
  const minValue = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;

  // Generate SVG path for series
  const createPath = (key: 'demand' | 'supply' | 'forecastDemand') => {
    return data.reduce((acc, curr, i) => {
      const val = curr[key];
      if (val === undefined) return acc;
      const x = getX(i);
      const y = getY(val);
      return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Generate Confidence Interval Polygon Area
  const confidenceArea = () => {
    if (!showConfidenceInterval) return '';
    const pointsUpper: string[] = [];
    const pointsLower: string[] = [];

    data.forEach((d, i) => {
      if (d.upperConfidence !== undefined && d.lowerConfidence !== undefined) {
        pointsUpper.push(`${getX(i)},${getY(d.upperConfidence)}`);
        pointsLower.unshift(`${getX(i)},${getY(d.lowerConfidence)}`);
      }
    });

    if (pointsUpper.length === 0) return '';
    return `M ${pointsUpper.join(' L ')} L ${pointsLower.join(' L ')} Z`;
  };

  const demandPath = createPath('demand');
  const supplyPath = createPath('supply');
  const forecastPath = createPath('forecastDemand');
  const confArea = confidenceArea();

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h4>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monthly Index (0-100 Base)</span>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 10, height: 3, background: '#38bdf8', borderRadius: 2 }}></span>
            <span style={{ color: '#cbd5e1' }}>Market Demand</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 10, height: 3, background: '#10b981', borderRadius: 2 }}></span>
            <span style={{ color: '#cbd5e1' }}>Training Supply</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 10, height: 3, borderTop: '2px dashed #a855f7' }}></span>
            <span style={{ color: '#c084fc' }}>AI Forecast</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + chartHeight * pct;
            const val = Math.round(maxValue * (1 - pct));
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Confidence Area */}
          {confArea && (
            <path
              d={confArea}
              fill="rgba(168, 85, 247, 0.12)"
              stroke="rgba(168, 85, 247, 0.25)"
              strokeDasharray="2 2"
            />
          )}

          {/* Supply Line */}
          {supplyPath && (
            <path
              d={supplyPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Demand Line */}
          {demandPath && (
            <path
              d={demandPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Forecast Line */}
          {forecastPath && (
            <path
              d={forecastPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* Data interactive dots & vertical cursor */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;
            return (
              <g key={i}>
                {/* Transparent hover capture zone */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Demand Dot */}
                <circle
                  cx={x}
                  cy={getY(d.demand)}
                  r={isHovered ? 5 : 3}
                  fill="#38bdf8"
                  stroke="#090d16"
                  strokeWidth="2"
                />

                {/* Supply Dot */}
                <circle
                  cx={x}
                  cy={getY(d.supply)}
                  r={isHovered ? 5 : 3}
                  fill="#10b981"
                  stroke="#090d16"
                  strokeWidth="2"
                />

                {/* X-axis Label */}
                {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1 || isHovered) && (
                  <text
                    x={x}
                    y={height - padding.bottom + 18}
                    fill={isHovered ? '#38bdf8' : '#64748b'}
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight={isHovered ? '600' : 'normal'}
                  >
                    {d.month}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '0.625rem 0.875rem',
              fontSize: '0.75rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
              Period: {activePoint.month}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <span style={{ color: '#38bdf8' }}>● Demand: </span>
                <strong style={{ color: '#fff' }}>{activePoint.demand}</strong>
              </div>
              <div>
                <span style={{ color: '#10b981' }}>● Supply: </span>
                <strong style={{ color: '#fff' }}>{activePoint.supply}</strong>
              </div>
            </div>
            {activePoint.forecastDemand && (
              <div style={{ marginTop: 3, color: '#c084fc' }}>
                ✦ AI Forecast: <strong>{activePoint.forecastDemand}</strong> (±{Math.round((activePoint.upperConfidence! - activePoint.lowerConfidence!) / 2)})
              </div>
            )}
            <div style={{ marginTop: 3, color: activePoint.demand - activePoint.supply > 0 ? '#f87171' : '#34d399' }}>
              Gap: <strong>{activePoint.demand - activePoint.supply > 0 ? `+${(activePoint.demand - activePoint.supply).toFixed(1)} (Shortage)` : `${(activePoint.demand - activePoint.supply).toFixed(1)} (Surplus)`}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
