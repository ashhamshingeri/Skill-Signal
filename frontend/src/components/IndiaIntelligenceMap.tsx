import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3geo from 'd3-geo';
import { INDIA_GEO_JSON } from '../data/indiaGeoJson';

/* ─────────────────────────────────────────────────────────────────
   Geographic data: real lat/lng for major cities
   ───────────────────────────────────────────────────────────────── */
interface GeoLocation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface LabourSignal {
  locationId: string;
  skillName: string;
  demandGrowth: number;
  supplyIndex: number;
  gapIndex: 'High' | 'Medium' | 'Low';
  forecastGrowth: number;
  status: 'growth' | 'shortage' | 'surplus' | 'stable' | 'forecast';
}

interface InsightCard {
  locationId: string;
  title: string;
  region: string;
  metric: string;
  metricLabel: string;
  cardPosition: 'top-left' | 'mid-left' | 'top-right' | 'mid-right';
  status: 'growth' | 'shortage' | 'forecast';
}

const INTELLIGENCE_LOCATIONS: GeoLocation[] = [
  { id: 'delhi',     name: 'Delhi',      state: 'NCR',           latitude: 28.6139,  longitude: 77.2090  },
  { id: 'jaipur',   name: 'Jaipur',     state: 'Rajasthan',     latitude: 26.9124,  longitude: 75.7873  },
  { id: 'ahmedabad',name: 'Ahmedabad',  state: 'Gujarat',       latitude: 23.0225,  longitude: 72.5714  },
  { id: 'mumbai',   name: 'Mumbai',     state: 'Maharashtra',   latitude: 19.0760,  longitude: 72.8777  },
  { id: 'pune',     name: 'Pune',       state: 'Maharashtra',   latitude: 18.5204,  longitude: 73.8567  },
  { id: 'hyderabad',name: 'Hyderabad',  state: 'Telangana',     latitude: 17.3850,  longitude: 78.4867  },
  { id: 'bengaluru',name: 'Bengaluru',  state: 'Karnataka',     latitude: 12.9716,  longitude: 77.5946  },
  { id: 'chennai',  name: 'Chennai',    state: 'Tamil Nadu',    latitude: 13.0827,  longitude: 80.2707  },
  { id: 'kolkata',  name: 'Kolkata',    state: 'West Bengal',   latitude: 22.5726,  longitude: 88.3639  },
  { id: 'lucknow',  name: 'Lucknow',    state: 'Uttar Pradesh', latitude: 26.8467,  longitude: 80.9462 },
];

const LABOUR_SIGNALS: LabourSignal[] = [
  { locationId: 'ahmedabad', skillName: 'EV Technician',       demandGrowth: 32, supplyIndex: 48, gapIndex: 'High',   forecastGrowth: 27, status: 'growth'   },
  { locationId: 'pune',      skillName: 'Industrial Welding',   demandGrowth: 21, supplyIndex: 62, gapIndex: 'Medium', forecastGrowth: 18, status: 'growth'   },
  { locationId: 'jaipur',    skillName: 'Solar Installation',   demandGrowth: 18, supplyIndex: 35, gapIndex: 'High',   forecastGrowth: 22, status: 'shortage' },
  { locationId: 'lucknow',   skillName: 'Construction Worker',  demandGrowth: 26, supplyIndex: 55, gapIndex: 'Medium', forecastGrowth: 26, status: 'forecast'  },
  { locationId: 'bengaluru', skillName: 'AI & Cloud Dev',       demandGrowth: 46, supplyIndex: 72, gapIndex: 'Low',    forecastGrowth: 42, status: 'growth'   },
  { locationId: 'hyderabad', skillName: 'Pharma & Biotech',     demandGrowth: 35, supplyIndex: 58, gapIndex: 'Medium', forecastGrowth: 30, status: 'growth'   },
  { locationId: 'chennai',   skillName: 'Hardware & EV Mfg',   demandGrowth: 31, supplyIndex: 50, gapIndex: 'High',   forecastGrowth: 28, status: 'shortage' },
  { locationId: 'delhi',     skillName: 'AI & Clean Energy',    demandGrowth: 38, supplyIndex: 65, gapIndex: 'Low',    forecastGrowth: 35, status: 'growth'   },
  { locationId: 'mumbai',    skillName: 'Fintech & Logistics',  demandGrowth: 24, supplyIndex: 60, gapIndex: 'Low',    forecastGrowth: 22, status: 'stable'   },
  { locationId: 'kolkata',   skillName: 'IT & Manufacturing',   demandGrowth: 22, supplyIndex: 55, gapIndex: 'Low',    forecastGrowth: 19, status: 'stable'   },
];

const INSIGHT_CARDS: InsightCard[] = [
  { locationId: 'ahmedabad', title: 'EV Technician',      region: 'Gujarat',        metric: '+32%',   metricLabel: 'Demand Growth',    cardPosition: 'top-left',  status: 'growth'   },
  { locationId: 'pune',      title: 'Industrial Welding', region: 'Maharashtra',    metric: '+21.3%', metricLabel: 'Demand Growth',    cardPosition: 'mid-left',  status: 'growth'   },
  { locationId: 'jaipur',    title: 'Solar Installation', region: 'Rajasthan',      metric: '+18.7%', metricLabel: 'Skill Shortage',   cardPosition: 'top-right', status: 'shortage' },
  { locationId: 'lucknow',   title: 'Construction Worker',region: 'Uttar Pradesh',  metric: '+26.1%', metricLabel: 'Forecast (6M)',    cardPosition: 'mid-right', status: 'forecast' },
];

// Connection routes (signal flows between cities)
const CONNECTIONS: Array<{ from: string; to: string; type: 'current' | 'forecast' }> = [
  { from: 'delhi',     to: 'ahmedabad',  type: 'current'  },
  { from: 'ahmedabad', to: 'mumbai',     type: 'current'  },
  { from: 'mumbai',    to: 'pune',       type: 'current'  },
  { from: 'pune',      to: 'bengaluru',  type: 'current'  },
  { from: 'bengaluru', to: 'hyderabad',  type: 'current'  },
  { from: 'bengaluru', to: 'chennai',    type: 'current'  },
  { from: 'delhi',     to: 'jaipur',     type: 'current'  },
  { from: 'mumbai',    to: 'hyderabad',  type: 'forecast' },
  { from: 'hyderabad', to: 'chennai',    type: 'forecast' },
  { from: 'delhi',     to: 'lucknow',    type: 'current'  },
];

function getSignalColor(status: LabourSignal['status']): string {
  switch (status) {
    case 'growth':   return '#7c3aed';
    case 'shortage': return '#ec4899';
    case 'surplus':  return '#10b981';
    default:         return '#0284c7';
  }
}

function getNodeRadius(signal: LabourSignal | undefined): number {
  if (!signal) return 4;
  const intensity = signal.demandGrowth;
  if (intensity > 40) return 8;
  if (intensity > 30) return 7;
  if (intensity > 20) return 6;
  return 5;
}

function getCardStatusColor(status: InsightCard['status']): { fg: string; bg: string; border: string } {
  switch (status) {
    case 'shortage': return { fg: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' };
    case 'forecast': return { fg: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.25)'  };
    default:         return { fg: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' };
  }
}

interface Props {
  width?: number;
  height?: number;
}

export const IndiaIntelligenceMap: React.FC<Props> = ({ width = 850, height = 700 }) => {
  const geoData = INDIA_GEO_JSON as unknown as GeoJSON.FeatureCollection;
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('ahmedabad');
  const [animFrame, setAnimFrame] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimFrame(f => (f + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Rotate highlighted location
  useEffect(() => {
    const locations = INTELLIGENCE_LOCATIONS.map(l => l.id);
    const interval = setInterval(() => {
      setSelectedLocation(prev => {
        const idx = locations.indexOf(prev);
        return locations[(idx + 1) % locations.length];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Mercator Projection centered on India (larger scale for full-screen hero layout)
  const projection = useMemo(() => {
    const scale = Math.min(width, height) * 1.62;
    return d3geo.geoMercator()
      .center([82.5, 21.5])
      .scale(scale)
      .translate([width * 0.48, height * 0.48]);
  }, [width, height]);

  // Project city coordinates
  const projectedPoints = useMemo(() => {
    const pts = new Map<string, [number, number]>();
    for (const loc of INTELLIGENCE_LOCATIONS) {
      const pt = projection([loc.longitude, loc.latitude]);
      if (pt) pts.set(loc.id, pt as [number, number]);
    }
    return pts;
  }, [projection]);

  const pathGenerator = useMemo(() => {
    return d3geo.geoPath().projection(projection);
  }, [projection]);

  const getSignalForLocation = useCallback((locationId: string) => {
    return LABOUR_SIGNALS.find(s => s.locationId === locationId);
  }, []);

  // Build curved arc between two points
  function buildArc(from: [number, number], to: [number, number]): string {
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    // Perpendicular offset for curvature
    const curve = len * 0.2;
    const nx = -dy / len;
    const ny = dx / len;
    const cx = mx + nx * curve;
    const cy = my + ny * curve;
    return `M ${from[0]},${from[1]} Q ${cx},${cy} ${to[0]},${to[1]}`;
  }

  // Particle position along a path at time t (0-1)
  function getParticlePos(from: [number, number], to: [number, number], t: number): [number, number] {
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const curve = len * 0.2;
    const nx = -dy / len;
    const ny = dx / len;
    const cx = mx + nx * curve;
    const cy = my + ny * curve;
    // Quadratic bezier
    const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * cx + t * t * to[0];
    const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * cy + t * t * to[1];
    return [x, y];
  }

  const selectedSignal = getSignalForLocation(selectedLocation);
  const selectedLocationData = INTELLIGENCE_LOCATIONS.find(l => l.id === selectedLocation);

  return (
    <div style={{ position: 'relative', width, height, userSelect: 'none' }}>
      {/* Atmospheric Glow Blobs */}
      <div style={{
        position: 'absolute', top: '5%', left: '15%',
        width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
        filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: '280px', height: '280px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '30%',
        width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        filter: 'blur(30px)', borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* SVG Map */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <defs>
          {/* State highlight gradient */}
          <linearGradient id="stateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f5f3ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="stateGradHover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.6" />
          </linearGradient>

          {/* India map shadow */}
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7c3aed" floodOpacity="0.18" />
          </filter>

          {/* Node glow */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Clip path for dot matrix */}
          <clipPath id="indiaClip">
            {geoData && geoData.features.map((f, i) => (
              <path key={i} d={pathGenerator(f as GeoJSON.Feature) || ''} />
            ))}
          </clipPath>
        </defs>

        {/* ─── Map States ─── */}
        <g filter="url(#mapShadow)">
          {geoData && geoData.features.map((feature, i) => {
            const stateName = (feature.properties as { NAME_1?: string })?.NAME_1 || '';
            const isHovered = hoveredState === stateName;
            return (
              <path
                key={i}
                d={pathGenerator(feature as GeoJSON.Feature) || ''}
                fill={isHovered ? 'url(#stateGradHover)' : 'url(#stateGrad)'}
                stroke={isHovered ? '#8b5cf6' : '#c4b5fd'}
                strokeWidth={isHovered ? 1.5 : 0.85}
                strokeOpacity={isHovered ? 0.95 : 0.5}
                style={{
                  cursor: 'pointer',
                  transition: 'fill 0.25s ease, stroke 0.25s ease',
                }}
                onMouseEnter={() => setHoveredState(stateName)}
                onMouseLeave={() => setHoveredState(null)}
              />
            );
          })}
        </g>

        {/* ─── Dot texture grid inside India ─── */}
        {(() => {
          const dots = [];
          for (let row = 0; row < 22; row++) {
            for (let col = 0; col < 18; col++) {
              const cx = width * 0.12 + col * (width * 0.52 / 17);
              const cy = height * 0.04 + row * (height * 0.9 / 21);
              dots.push(
                <circle
                  key={`dot-${row}-${col}`}
                  cx={cx}
                  cy={cy}
                  r="1.1"
                  fill="rgba(139,92,246,0.2)"
                  clipPath="url(#indiaClip)"
                />
              );
            }
          }
          return <g>{dots}</g>;
        })()}

        {/* ─── Connection Arcs ─── */}
        {CONNECTIONS.map((conn, i) => {
          const fromPt = projectedPoints.get(conn.from);
          const toPt = projectedPoints.get(conn.to);
          if (!fromPt || !toPt) return null;
          return (
            <path
              key={`arc-${i}`}
              d={buildArc(fromPt, toPt)}
              fill="none"
              stroke={conn.type === 'forecast' ? '#06b6d4' : '#a855f7'}
              strokeWidth={conn.type === 'forecast' ? 1.2 : 1.6}
              strokeOpacity={conn.type === 'forecast' ? 0.5 : 0.65}
              strokeDasharray={conn.type === 'forecast' ? '5,4' : 'none'}
            />
          );
        })}

        {/* ─── Animated Particles on Connections ─── */}
        {CONNECTIONS.slice(0, 5).map((conn, i) => {
          const fromPt = projectedPoints.get(conn.from);
          const toPt = projectedPoints.get(conn.to);
          if (!fromPt || !toPt) return null;
          const t = ((animFrame / 100) + i * 0.2) % 1;
          const pos = getParticlePos(fromPt, toPt, t);
          return (
            <circle
              key={`particle-${i}`}
              cx={pos[0]}
              cy={pos[1]}
              r="3"
              fill={i % 2 === 0 ? '#a855f7' : '#06b6d4'}
              opacity={0.85}
              style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
            />
          );
        })}

        {/* ─── City Signal Nodes ─── */}
        {INTELLIGENCE_LOCATIONS.map((loc) => {
          const pt = projectedPoints.get(loc.id);
          if (!pt) return null;
          const signal = getSignalForLocation(loc.id);
          const isSelected = selectedLocation === loc.id;
          const color = signal ? getSignalColor(signal.status) : '#7c3aed';
          const radius = getNodeRadius(signal);

          return (
            <g
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer radar pulse (selected) */}
              {isSelected && (
                <>
                  <circle cx={pt[0]} cy={pt[1]} r={radius + 14} fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" className="animate-radar" />
                  <circle cx={pt[0]} cy={pt[1]} r={radius + 8}  fill="none" stroke={color} strokeWidth="1.8" opacity="0.5" className="animate-radar-delayed" />
                </>
              )}

              {/* Glow halo */}
              <circle cx={pt[0]} cy={pt[1]} r={radius + 5} fill={color} opacity="0.15" />

              {/* Core dot */}
              <circle
                cx={pt[0]}
                cy={pt[1]}
                r={isSelected ? radius + 1.5 : radius}
                fill={color}
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#nodeGlow)"
              />

              {/* City name label */}
              <text
                x={pt[0] + radius + 5}
                y={pt[1] + 4}
                fill="#1e293b"
                fontSize="10.5"
                fontWeight={isSelected ? '700' : '600'}
                fontFamily="Inter, sans-serif"
                style={{
                  paintOrder: 'stroke',
                  stroke: 'rgba(255,255,255,0.92)',
                  strokeWidth: '2.5px',
                  strokeLinejoin: 'round',
                }}
              >
                {loc.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ─── Floating Intelligence Cards ─── */}
      {INSIGHT_CARDS.map((card) => {
        const colors = getCardStatusColor(card.status);
        let posStyle: React.CSSProperties = {};

        if (card.cardPosition === 'top-left') {
          posStyle = { top: '4%', left: '1%' };
        } else if (card.cardPosition === 'mid-left') {
          posStyle = { top: '50%', left: '1%' };
        } else if (card.cardPosition === 'top-right') {
          posStyle = { top: '8%', right: '2%' };
        } else {
          posStyle = { top: '44%', right: '2%' };
        }

        return (
          <div
            key={card.locationId}
            className={card.cardPosition === 'top-left' || card.cardPosition === 'mid-right' ? 'animate-float-gentle' : 'animate-float-gentle-alt'}
            style={{
              position: 'absolute',
              ...posStyle,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '0.75rem 0.95rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 10px 25px -5px rgba(0,0,0,0.06), 0 0 0 1px ${colors.border}`,
              zIndex: 30,
              minWidth: '170px',
              maxWidth: '195px',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
              {card.title}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600, marginBottom: '0.45rem' }}>
              {card.region}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.fg, lineHeight: 1 }}>
                  {card.metric}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                  {card.metricLabel}
                </div>
              </div>
              {/* Mini sparkline bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '18px' }}>
                {[0.35, 0.55, 0.7, 0.85, 1].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: `${h * 18}px`,
                      background: colors.fg,
                      borderRadius: '2px',
                      opacity: 0.3 + h * 0.7,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* ─── Selected Location Intelligence Tooltip ─── */}
      {selectedLocation && selectedSignal && selectedLocationData && (() => {
        const colors = getCardStatusColor(
          selectedSignal.status === 'shortage' ? 'shortage' :
          selectedSignal.status === 'surplus' ? 'growth' :
          selectedSignal.status === 'growth' ? 'growth' : 'forecast'
        );
        return (
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '0.75rem 1.4rem',
              border: '1px solid rgba(196, 181, 253, 0.5)',
              boxShadow: '0 12px 30px -6px rgba(124,58,237,0.14)',
              zIndex: 35,
              display: 'flex',
              alignItems: 'center',
              gap: '1.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '2px' }}>
                ACTIVE SIGNAL
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedLocationData.name}, {selectedLocationData.state}
              </div>
            </div>
            <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{selectedSignal.skillName}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.fg }}>
                +{selectedSignal.demandGrowth}% demand
              </div>
            </div>
            <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Skill Gap</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.fg }}>{selectedSignal.gapIndex}</div>
            </div>
          </div>
        );
      })()}

      {/* ─── Legend ─── */}
      <div style={{
        position: 'absolute',
        bottom: '2%',
        left: '2%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.65rem',
        color: '#64748b',
        fontWeight: 600,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid rgba(226,232,240,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }} />
          <span>Demand growth</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
          <span>Skill shortage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: '22px', height: '2px', background: 'repeating-linear-gradient(to right, #06b6d4 0px, #06b6d4 5px, transparent 5px, transparent 9px)' }} />
          <span>Forecast</span>
        </div>
      </div>
    </div>
  );
};

export default IndiaIntelligenceMap;

