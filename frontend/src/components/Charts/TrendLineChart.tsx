import React, { useState } from 'react';
import { AreaChart, BarChart3, TrendingUp, Sparkles } from 'lucide-react';

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
  height = 290,
  showConfidenceInterval = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');

  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center p-8 text-center text-slate-400">
        No time-series data available
      </div>
    );
  }

  const width = 640;
  const padding = { top: 25, right: 35, bottom: 45, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max value for Y-axis
  const allValues = data.flatMap((d) => [
    d.demand,
    d.supply,
    d.forecastDemand || 0,
    d.upperConfidence || 0,
  ]);
  const rawMax = Math.max(...allValues, 100);
  const maxValue = Math.ceil((rawMax * 1.15) / 20) * 20;
  const minValue = 0;

  const getX = (index: number) => padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
  const yBottom = padding.top + chartHeight;

  // Smooth Cubic Bézier Curve Path Generator
  const createSmoothCurve = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const demandPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.demand) }));
  const supplyPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.supply) }));

  const demandCurve = createSmoothCurve(demandPoints);
  const supplyCurve = createSmoothCurve(supplyPoints);

  // Closed area paths for gradient backgrounds
  const demandArea = demandPoints.length > 0
    ? `${demandCurve} L ${demandPoints[demandPoints.length - 1].x} ${yBottom} L ${demandPoints[0].x} ${yBottom} Z`
    : '';

  const supplyArea = supplyPoints.length > 0
    ? `${supplyCurve} L ${supplyPoints[supplyPoints.length - 1].x} ${yBottom} L ${supplyPoints[0].x} ${yBottom} Z`
    : '';

  // Confidence Interval Smooth Ribbon
  const forecastStartIndex = data.findIndex((d) => d.forecastDemand !== undefined);
  const forecastPoints = forecastStartIndex >= 0 ? data.slice(forecastStartIndex) : [];
  
  const upperConfidencePoints = forecastPoints.map((d, i) => ({
    x: getX(forecastStartIndex + i),
    y: getY(d.upperConfidence ?? d.demand),
  }));
  const lowerConfidencePoints = forecastPoints.map((d, i) => ({
    x: getX(forecastStartIndex + i),
    y: getY(d.lowerConfidence ?? d.demand),
  }));

  const confidenceRibbon = (() => {
    if (!showConfidenceInterval || upperConfidencePoints.length === 0) return '';
    const upperCurve = createSmoothCurve(upperConfidencePoints);
    const reversedLower = [...lowerConfidencePoints].reverse();
    let lowerStr = '';
    for (let i = 0; i < reversedLower.length; i++) {
      lowerStr += ` L ${reversedLower[i].x} ${reversedLower[i].y}`;
    }
    return `${upperCurve} ${lowerStr} Z`;
  })();

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-time hiring index vs. training supply pipeline
          </span>
        </div>

        {/* View Mode Toggle & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Chart View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-secondary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setChartMode('area')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: chartMode === 'area' ? 'var(--primary-color)' : 'transparent',
                color: chartMode === 'area' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <AreaChart size={13} />
              <span>Smooth Area</span>
            </button>
            <button
              onClick={() => setChartMode('bar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: chartMode === 'bar' ? 'var(--primary-color)' : 'transparent',
                color: chartMode === 'bar' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <BarChart3 size={13} />
              <span>Gap Bars</span>
            </button>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 12, height: 4, background: '#0284c7', borderRadius: 2 }}></span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Demand</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 12, height: 4, background: '#10b981', borderRadius: 2 }}></span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Supply</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: 12, height: 4, background: '#8b5cf6', borderRadius: 2 }}></span>
              <span style={{ color: '#7c3aed', fontWeight: 600 }}>AI Forecast</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Demand Gradient Fill */}
            <linearGradient id="demandAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
              <stop offset="85%" stopColor="#0284c7" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>

            {/* Supply Gradient Fill */}
            <linearGradient id="supplyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Forecast Ribbon Gradient */}
            <linearGradient id="confidenceRibbonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Y-Axis Horizontal Grid Lines & Labels */}
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
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                  strokeOpacity="0.75"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="end"
                  fontFamily="var(--font-sans, system-ui)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Forecast Horizon Vertical Boundary Marker */}
          {forecastStartIndex > 0 && (
            <g>
              <line
                x1={getX(forecastStartIndex)}
                y1={padding.top}
                x2={getX(forecastStartIndex)}
                y2={yBottom}
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.65"
              />
              <rect
                x={getX(forecastStartIndex) + 6}
                y={padding.top + 4}
                width={86}
                height={18}
                rx={4}
                fill="rgba(139, 92, 246, 0.15)"
                stroke="rgba(139, 92, 246, 0.35)"
              />
              <text
                x={getX(forecastStartIndex) + 49}
                y={padding.top + 16}
                fill="#7c3aed"
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
              >
                ✦ AI PROJECTION
              </text>
            </g>
          )}

          {chartMode === 'area' ? (
            <>
              {/* AI Confidence Ribbon */}
              {confidenceRibbon && (
                <path
                  d={confidenceRibbon}
                  fill="url(#confidenceRibbonGrad)"
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Demand Glowing Gradient Area */}
              {demandArea && <path d={demandArea} fill="url(#demandAreaGrad)" />}

              {/* Supply Gradient Area */}
              {supplyArea && <path d={supplyArea} fill="url(#supplyAreaGrad)" />}

              {/* Supply Smooth Spline Stroke */}
              {supplyCurve && (
                <path
                  d={supplyCurve}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Demand Smooth Spline Stroke */}
              {demandCurve && (
                <path
                  d={demandCurve}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
            </>
          ) : (
            /* Bar Chart Mode */
            data.map((d, i) => {
              const xCenter = getX(i);
              const barWidth = Math.min(chartWidth / (data.length * 2.6), 14);
              const isForecast = d.forecastDemand !== undefined;

              const yDemand = getY(d.demand);
              const hDemand = yBottom - yDemand;
              const ySupply = getY(d.supply);
              const hSupply = yBottom - ySupply;

              return (
                <g key={i}>
                  {/* Demand Bar */}
                  <rect
                    x={xCenter - barWidth - 2}
                    y={yDemand}
                    width={barWidth}
                    height={Math.max(hDemand, 0)}
                    rx={3}
                    fill={isForecast ? '#8b5cf6' : '#0284c7'}
                    opacity={isForecast ? 0.85 : 0.9}
                  />

                  {/* Supply Bar */}
                  <rect
                    x={xCenter + 2}
                    y={ySupply}
                    width={barWidth}
                    height={Math.max(hSupply, 0)}
                    rx={3}
                    fill="#10b981"
                    opacity={0.85}
                  />
                </g>
              );
            })
          )}

          {/* Interactive Data Dots & Crosshair cursor */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;
            const isForecast = d.forecastDemand !== undefined;

            return (
              <g key={i}>
                {/* Transparent Hover Trigger Bar */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {/* Vertical Crosshair Line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={yBottom}
                    stroke="var(--primary-color)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {chartMode === 'area' && (
                  <>
                    {/* Demand Node */}
                    <circle
                      cx={x}
                      cy={getY(d.demand)}
                      r={isHovered ? 6 : isForecast ? 4 : 3.5}
                      fill={isForecast ? '#8b5cf6' : '#0284c7'}
                      stroke="var(--bg-surface)"
                      strokeWidth="2"
                    />

                    {/* Supply Node */}
                    <circle
                      cx={x}
                      cy={getY(d.supply)}
                      r={isHovered ? 6 : 3.5}
                      fill="#10b981"
                      stroke="var(--bg-surface)"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* X-axis Month Label */}
                {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1 || isHovered) && (
                  <text
                    x={x}
                    y={yBottom + 20}
                    fill={isHovered ? 'var(--primary-color)' : 'var(--text-muted)'}
                    fontSize={isHovered ? '12' : '11'}
                    textAnchor="middle"
                    fontWeight={isHovered ? '700' : '500'}
                    fontFamily="var(--font-sans, system-ui)"
                  >
                    {d.month}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Sleek Tooltip Popover */}
        {activePoint && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 20,
              pointerEvents: 'none',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Period: {activePoint.month}</span>
              {activePoint.forecastDemand && (
                <span className="badge badge-ai" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                  AI Projection
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: 4 }}>
              <div>
                <span style={{ color: '#0284c7' }}>● Demand Index: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{activePoint.demand}</strong>
              </div>
              <div>
                <span style={{ color: '#10b981' }}>● Supply Index: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{activePoint.supply}</strong>
              </div>
            </div>

            {activePoint.forecastDemand && (
              <div style={{ marginTop: 4, color: '#7c3aed', fontSize: '0.74rem' }}>
                ✦ 95% CI Range: [{activePoint.lowerConfidence} – {activePoint.upperConfidence}]
              </div>
            )}

            <div
              style={{
                marginTop: 4,
                paddingTop: 4,
                borderTop: '1px solid var(--border-subtle)',
                fontWeight: 700,
                color: activePoint.demand - activePoint.supply > 0 ? '#ef4444' : '#10b981',
              }}
            >
              Net Gap: {activePoint.demand - activePoint.supply > 0
                ? `+${(activePoint.demand - activePoint.supply).toFixed(1)} (Shortage Deficit)`
                : `${(activePoint.demand - activePoint.supply).toFixed(1)} (Supply Parity)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

