import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { HeatmapMatrix, type HeatmapRow } from '../components/Charts/HeatmapMatrix';

export const GapHeatmapView: React.FC = () => {
  const { setSelectedSkillId, setSelectedDistrictId, setActiveTab } = useApp();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');

  const skillsList = [
    'EV Diagnostics',
    'Solar PV Grid',
    'VLSI Layout',
    '5-Axis CNC',
    'Generative AI',
    'Drone Surveying',
    'Cold Chain IoT',
    'Data Entry',
  ];

  const rawHeatmapData: HeatmapRow[] = [
    {
      label: 'Pune (MH)',
      id: 'dst-pune',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 56.3, demandIndex: 88, supplyIndex: 32, gapLevel: 'critical_shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 38.0, demandIndex: 78, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 42.1, demandIndex: 72, supplyIndex: 30, gapLevel: 'critical_shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 45.4, demandIndex: 85, supplyIndex: 40, gapLevel: 'critical_shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 52.0, demandIndex: 90, supplyIndex: 38, gapLevel: 'critical_shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 22.0, demandIndex: 68, supplyIndex: 46, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 14.5, demandIndex: 62, supplyIndex: 48, gapLevel: 'shortage' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -58.0, demandIndex: 24, supplyIndex: 82, gapLevel: 'critical_surplus' },
      ],
    },
    {
      label: 'Bengaluru (KA)',
      id: 'dst-blr-u',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 44.0, demandIndex: 82, supplyIndex: 38, gapLevel: 'critical_shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 28.0, demandIndex: 70, supplyIndex: 42, gapLevel: 'shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 58.5, demandIndex: 96, supplyIndex: 38, gapLevel: 'critical_shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 32.0, demandIndex: 74, supplyIndex: 42, gapLevel: 'shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 64.0, demandIndex: 98, supplyIndex: 34, gapLevel: 'critical_shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 35.0, demandIndex: 75, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 12.0, demandIndex: 60, supplyIndex: 48, gapLevel: 'balanced' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -68.0, demandIndex: 18, supplyIndex: 86, gapLevel: 'critical_surplus' },
      ],
    },
    {
      label: 'Ahmedabad (GJ)',
      id: 'dst-ahd',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 48.0, demandIndex: 84, supplyIndex: 36, gapLevel: 'critical_shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 42.0, demandIndex: 86, supplyIndex: 44, gapLevel: 'critical_shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 36.0, demandIndex: 68, supplyIndex: 32, gapLevel: 'shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 40.0, demandIndex: 82, supplyIndex: 42, gapLevel: 'critical_shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 38.0, demandIndex: 74, supplyIndex: 36, gapLevel: 'shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 26.0, demandIndex: 66, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 24.0, demandIndex: 70, supplyIndex: 46, gapLevel: 'shortage' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -52.0, demandIndex: 28, supplyIndex: 80, gapLevel: 'critical_surplus' },
      ],
    },
    {
      label: 'Chennai (TN)',
      id: 'dst-che',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 52.0, demandIndex: 86, supplyIndex: 34, gapLevel: 'critical_shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 34.0, demandIndex: 76, supplyIndex: 42, gapLevel: 'shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 48.0, demandIndex: 84, supplyIndex: 36, gapLevel: 'critical_shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 46.0, demandIndex: 88, supplyIndex: 42, gapLevel: 'critical_shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 45.0, demandIndex: 82, supplyIndex: 37, gapLevel: 'critical_shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 20.0, demandIndex: 65, supplyIndex: 45, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 18.0, demandIndex: 64, supplyIndex: 46, gapLevel: 'shortage' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -60.0, demandIndex: 22, supplyIndex: 82, gapLevel: 'critical_surplus' },
      ],
    },
    {
      label: 'Lucknow (UP)',
      id: 'dst-lko',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 34.0, demandIndex: 72, supplyIndex: 38, gapLevel: 'shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 40.0, demandIndex: 80, supplyIndex: 40, gapLevel: 'critical_shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 22.0, demandIndex: 55, supplyIndex: 33, gapLevel: 'shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 28.0, demandIndex: 68, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 36.0, demandIndex: 70, supplyIndex: 34, gapLevel: 'shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 32.0, demandIndex: 72, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 26.0, demandIndex: 68, supplyIndex: 42, gapLevel: 'shortage' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -45.0, demandIndex: 35, supplyIndex: 80, gapLevel: 'critical_surplus' },
      ],
    },
    {
      label: 'Jaipur (RJ)',
      id: 'dst-jpr',
      cells: [
        { skillId: 'sk-01', skillName: 'EV Diagnostics', gapIndex: 30.0, demandIndex: 68, supplyIndex: 38, gapLevel: 'shortage' },
        { skillId: 'sk-02', skillName: 'Solar PV Grid', gapIndex: 50.0, demandIndex: 92, supplyIndex: 42, gapLevel: 'critical_shortage' },
        { skillId: 'sk-05', skillName: 'VLSI Layout', gapIndex: 18.0, demandIndex: 50, supplyIndex: 32, gapLevel: 'shortage' },
        { skillId: 'sk-04', skillName: '5-Axis CNC', gapIndex: 25.0, demandIndex: 65, supplyIndex: 40, gapLevel: 'shortage' },
        { skillId: 'sk-03', skillName: 'Generative AI', gapIndex: 30.0, demandIndex: 66, supplyIndex: 36, gapLevel: 'shortage' },
        { skillId: 'sk-06', skillName: 'Drone Surveying', gapIndex: 38.0, demandIndex: 76, supplyIndex: 38, gapLevel: 'shortage' },
        { skillId: 'sk-07', skillName: 'Cold Chain IoT', gapIndex: 15.0, demandIndex: 60, supplyIndex: 45, gapLevel: 'shortage' },
        { skillId: 'sk-10', skillName: 'Data Entry', gapIndex: -48.0, demandIndex: 32, supplyIndex: 80, gapLevel: 'critical_surplus' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">Dynamic Heatmap Engine</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-Time Cross-District Disparity Analysis</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>
            Regional Skill Gap & Shortage Heatmap Matrix
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Multi-dimensional grid mapping industrial district demand deficits against local training centre capacity.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="input-field select-field"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ width: '180px', height: '38px', fontSize: '0.8rem' }}
          >
            <option value="all">All Sectors</option>
            <option value="auto">Automotive & EV</option>
            <option value="clean">Clean Energy & Solar</option>
            <option value="it">IT & Emerging AI</option>
            <option value="mfg">Advanced Manufacturing</option>
          </select>

          <select
            className="input-field select-field"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ width: '180px', height: '38px', fontSize: '0.8rem' }}
          >
            <option value="all">All States</option>
            <option value="mh">Maharashtra</option>
            <option value="ka">Karnataka</option>
            <option value="gj">Gujarat</option>
            <option value="tn">Tamil Nadu</option>
            <option value="up">Uttar Pradesh</option>
            <option value="rj">Rajasthan</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Badges */}
      <div className="grid-4">
        <div className="stat-card stat-critical glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Critical Shortage Cells (&gt;+40)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', margin: '0.25rem 0' }}>18</div>
          <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Immediate CapEx intervention required</div>
        </div>

        <div className="stat-card stat-warning glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Moderate Shortages (+20..+40)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>22</div>
          <div style={{ fontSize: '0.7rem', color: '#fde68a' }}>Bridge training sufficient</div>
        </div>

        <div className="stat-card stat-success glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Balanced Competencies (±10)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>34</div>
          <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>Healthy demand-supply parity</div>
        </div>

        <div className="stat-card glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Critical Surplus Cells (&lt;-40)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', margin: '0.25rem 0' }}>6</div>
          <div style={{ fontSize: '0.7rem', color: '#bfdbfe' }}>Automation transition candidates</div>
        </div>
      </div>

      {/* Heatmap Matrix Visual Component */}
      <HeatmapMatrix
        columns={skillsList}
        rows={rawHeatmapData}
        onCellClick={(rowId, skillId) => {
          setSelectedDistrictId(rowId);
          setSelectedSkillId(skillId);
          setActiveTab('skills');
        }}
      />
    </div>
  );
};
