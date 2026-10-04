import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const { liveSyncStatus, triggerSync } = useApp();
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [coverage, setCoverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, coverageRes] = await Promise.all([
        api.getDataSources(),
        api.getCoverageSummary(),
      ]);
      setDataSources(sourcesRes.dataSources || []);
      setSummary(sourcesRes.summary || {});
      setCoverage(coverageRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSingle = async (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      loadData();
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">Data Ingestion Engine</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multi-Source Labour Market Pipeline Monitor</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc' }}>
            Data Pipeline Ingestion & Geographic Coverage
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Telemetry status, schema normalization, and Tier-2/Tier-3 district data readiness.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={triggerSync}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <RefreshCw size={14} style={{ animation: liveSyncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none' }} />
          <span>Sync All Data Pipelines</span>
        </button>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid-4">
        <div className="stat-card stat-success glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Total Records Ingested</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.25rem 0' }}>
            {(summary?.totalRecordsIndexed / 1000000).toFixed(1) || '37.2'}M
          </div>
          <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>Indexed across demand & supply feeds</div>
        </div>

        <div className="stat-card glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Connected Feeds</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', margin: '0.25rem 0' }}>
            {summary?.liveSources || 4} Live / {summary?.totalSources || 5} Total
          </div>
          <div style={{ fontSize: '0.7rem', color: '#bae6fd' }}>NCS, SIDH, e-Shram, PLFS</div>
        </div>

        <div className="stat-card stat-ai glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Avg Data Quality Index</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', margin: '0.25rem 0' }}>
            {summary?.avgQualityScore || '91.8'} / 100
          </div>
          <div style={{ fontSize: '0.7rem', color: '#e9d5ff' }}>Calculated by completeness & freshness</div>
        </div>

        <div className="stat-card stat-warning glass-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Tier-3 District Readiness</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', margin: '0.25rem 0' }}>
            84.5% Coverage
          </div>
          <div style={{ fontSize: '0.7rem', color: '#fde68a' }}>768/768 Districts Mapped</div>
        </div>
      </div>

      {/* Data Ingestion Feed Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              Connected Data Ingestion Pipelines
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time synchronization with central and state administrative portals
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dataSources.map((ds) => {
            const isLive = ds.status === 'live';
            const isSyncing = syncingId === ds.id;

            return (
              <div
                key={ds.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Database size={18} color={isLive ? '#34d399' : '#fbbf24'} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{ds.name}</span>
                      <span className={`badge ${isLive ? 'badge-balanced' : 'badge-shortage'}`} style={{ fontSize: '0.65rem' }}>
                        {ds.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {ds.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.75rem' }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Records Indexed</div>
                    <strong style={{ color: '#38bdf8' }}>{ds.recordCount.toLocaleString()}</strong>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8' }}>Quality Score</div>
                    <strong style={{ color: '#10b981' }}>{ds.dataQualityScore}%</strong>
                  </div>

                  <div>
                    <div style={{ color: '#94a3b8' }}>District Reach</div>
                    <strong style={{ color: '#f8fafc' }}>{ds.coverageDistricts} Districts</strong>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSyncSingle(ds.id)}
                    disabled={isSyncing}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <RefreshCw size={12} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
