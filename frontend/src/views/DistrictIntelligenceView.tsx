import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { GapBarChart } from '../components/Charts/GapBarChart';
import {
  MapPin,
  Building,
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const DistrictIntelligenceView: React.FC = () => {
  const { selectedDistrictId, setSelectedDistrictId, selectedStateId, setSelectedStateId, setActiveTab } = useApp();
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [activeDistrict, setActiveDistrict] = useState<any>(null);
  const [searchDistrict, setSearchDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedStateId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statesRes, distsRes] = await Promise.all([
        api.getStates(),
        api.getDistricts(selectedStateId || undefined),
      ]);
      setStates(statesRes.states || []);
      const dList = distsRes.districts || [];
      setDistricts(dList);

      if (selectedDistrictId) {
        const found = dList.find((d: any) => d.id === selectedDistrictId);
        if (found) setActiveDistrict(found);
        else if (dList.length > 0) setActiveDistrict(dList[0]);
      } else if (dList.length > 0 && !activeDistrict) {
        setActiveDistrict(dList[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistricts = districts.filter((d) => {
    if (!searchDistrict) return true;
    const q = searchDistrict.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.stateName?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">Geospatial Intelligence</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tier-1, Tier-2 & Tier-3 District Granularity</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>
            District-Level Labour Market & Training Readiness
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Local training capacity, data readiness index, and industrial cluster skill deficits.
          </p>
        </div>

        {/* State Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="input-field select-field"
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(e.target.value)}
            style={{ width: '220px', height: '38px', fontSize: '0.85rem' }}
          >
            <option value="">All States (National)</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Left District Explorer + Right District Drilldown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
        {/* Left Column: District List */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '820px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search districts (e.g. Pune, Mysuru, Surat)..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {filteredDistricts.map((district) => {
              const isSelected = activeDistrict?.id === district.id;
              return (
                <div
                  key={district.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    setActiveDistrict(district);
                    setSelectedDistrictId(district.id);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelected ? '#34d399' : '#f8fafc' }}>
                      {district.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>
                      {district.code}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    {district.stateName || 'State'} • Pop: {(district.population / 1000000).toFixed(1)}M
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: '#38bdf8' }}>
                      Coverage: <strong>{district.coveragePercentage}%</strong>
                    </span>
                    <span style={{ color: '#10b981' }}>
                      Quality Score: <strong>{district.dataQualityScore}/100</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected District Profile */}
        {activeDistrict ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* District Header Card */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="badge badge-primary">{activeDistrict.stateName}</span>
                    <span className="badge badge-balanced">District Code: {activeDistrict.code}</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>
                    {activeDistrict.name} District Intelligence
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Data Readiness Score</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                    {activeDistrict.dataQualityScore} / 100
                  </div>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid-4">
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Population</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {(activeDistrict.population / 1000000).toFixed(2)} Million
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Urban / Industrial %</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                    {activeDistrict.urbanPercentage}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Training ITIs</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                    {Math.round(activeDistrict.population / 450000) || 12} Centres
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Monthly Enrolment</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
                    ~{Math.round(activeDistrict.population / 1800) || 3200} / mo
                  </div>
                </div>
              </div>
            </div>

            {/* Local District Gaps Bar Chart */}
            <GapBarChart
              items={[
                { name: 'Electric Vehicle Powertrain Diagnostics', demandIndex: 88, supplyIndex: 32, gapIndex: 56 },
                { name: 'Solar PV Grid Integration', demandIndex: 82, supplyIndex: 41, gapIndex: 41 },
                { name: 'CNC 5-Axis Precision Machining', demandIndex: 79, supplyIndex: 45, gapIndex: 34 },
                { name: 'Industrial Drone Surveying', demandIndex: 75, supplyIndex: 48, gapIndex: 27 },
              ]}
              title={`Key Labour Deficits in ${activeDistrict.name}`}
            />

            {/* Local Training Centre Directory */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                    Active Training Facilities in {activeDistrict.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PMKVY, Government ITI, and Polytechnic Hubs</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  {
                    name: `Government ITI ${activeDistrict.name} Central`,
                    type: 'Government ITI',
                    capacity: 850,
                    placementRate: 74,
                    keyTrades: 'EV Diagnostics, CNC Machining, Mechatronics',
                  },
                  {
                    name: `PMKVY Multi-Skill Development Centre (${activeDistrict.name})`,
                    type: 'PMKVY 4.0 Hub',
                    capacity: 480,
                    placementRate: 69,
                    keyTrades: 'Solar PV Tech, Drone Piloting, IoT Sensors',
                  },
                  {
                    name: `District Polytechnic Institute (${activeDistrict.name})`,
                    type: 'State Polytechnic',
                    capacity: 620,
                    placementRate: 81,
                    keyTrades: 'VLSI CAD, Industrial Automation, Cyber Security',
                  },
                ].map((tc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>{tc.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Type: <span style={{ color: '#38bdf8' }}>{tc.type}</span> • Focus: {tc.keyTrades}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Annual Capacity</div>
                        <strong style={{ color: '#f8fafc' }}>{tc.capacity} Seats</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Placement Rate</div>
                        <strong style={{ color: '#10b981' }}>{tc.placementRate}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card flex items-center justify-center p-12 text-slate-400">
            Select a district to view local intelligence
          </div>
        )}
      </div>
    </div>
  );
};
