import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Search, X, ArrowRight, BrainCircuit, MapPin, Building, Globe } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, setActiveTab, setSelectedSkillId, setSelectedDistrictId } = useApp();
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<{
    skills: any[];
    districts: any[];
    states: any[];
    industries: any[];
  }>({ skills: [], districts: [], states: [], industries: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!queryText.trim()) {
      setResults({ skills: [], districts: [], states: [], industries: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(queryText);
        setResults(res.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [queryText]);

  if (!searchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="card-white"
        style={{
          width: '100%',
          maxWidth: '620px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Search size={18} color="#7c3aed" />
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder="Search skills, districts, forecasts, sectors..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              fontSize: '0.95rem',
              boxShadow: 'none',
              color: 'var(--text-primary)',
            }}
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.68rem',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Searching nationwide labour database...
            </div>
          )}

          {!loading && !queryText && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quick Suggestions:</div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Electric Vehicle', 'Semiconductor VLSI', 'Pune', 'Bengaluru Urban', 'Solar PV'].map((tag) => (
                  <button
                    key={tag}
                    className="badge badge-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setQueryText(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && queryText && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Skills Results */}
              {results.skills?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed', padding: '0 0.5rem 0.25rem', letterSpacing: '0.04em' }}>
                    SKILLS ({results.skills.length})
                  </div>
                  {results.skills.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124, 58, 237, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        setActiveTab('skills');
                        setSearchOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BrainCircuit size={16} color="#7c3aed" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Districts Results */}
              {results.districts?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', padding: '0 0.5rem 0.25rem', letterSpacing: '0.04em' }}>
                    DISTRICTS ({results.districts.length})
                  </div>
                  {results.districts.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(2, 132, 199, 0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        setSelectedDistrictId(d.id);
                        setActiveTab('districts');
                        setSearchOpen(false);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MapPin size={16} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty Search */}
              {results.skills?.length === 0 && results.districts?.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching skill or district records found for &quot;{queryText}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
