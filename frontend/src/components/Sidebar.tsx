import React from 'react';
import { useApp, type NavTab } from '../context/AppContext';
import {
  LayoutDashboard,
  BrainCircuit,
  MapPin,
  TrendingUp,
  Grid3X3,
  GitFork,
  Lightbulb,
  BotMessageSquare,
  Database,
  User,
  Key,
  Sparkles,
  HelpCircle,
  Home,
  Compass,
} from 'lucide-react';

interface NavGroup {
  sectionTitle: string;
  items: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }>;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, userRole } = useApp();

  const getNavGroups = (): NavGroup[] => {
    if (userRole === 'job_seeker') {
      return [
        {
          sectionTitle: 'OVERVIEW',
          items: [
            { id: 'dashboard', label: 'My Career Dashboard', icon: <LayoutDashboard size={17} /> },
          ],
        },
        {
          sectionTitle: 'MY CAREER',
          items: [
            { id: 'profile', label: 'My Profile', icon: <User size={17} /> },
            { id: 'skills', label: 'My Skills', icon: <BrainCircuit size={17} />, badge: 'Skills', badgeColor: '#7c3aed' },
            { id: 'gaps', label: 'Skill Gap Analysis', icon: <Grid3X3 size={17} />, badge: 'Readiness', badgeColor: '#ef4444' },
            { id: 'substitution', label: 'Career Pathways', icon: <GitFork size={17} />, badge: 'Bridge', badgeColor: '#10b981' },
            { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={17} />, badge: 'Actions', badgeColor: '#059669' },
          ],
        },
        {
          sectionTitle: 'MARKET INTELLIGENCE',
          items: [
            { id: 'forecasts', label: 'Market Trends', icon: <TrendingUp size={17} />, badge: 'Forecast', badgeColor: '#0891b2' },
            { id: 'districts', label: 'Relevant Districts', icon: <MapPin size={17} />, badge: 'Jobs', badgeColor: '#0284c7' },
          ],
        },
        {
          sectionTitle: 'AI ADVISOR',
          items: [
            { id: 'ai-analyst', label: 'AI Career Advisor', icon: <BotMessageSquare size={17} />, badge: 'Advisor', badgeColor: '#8b5cf6' },
          ],
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { id: 'settings-security', label: 'Security', icon: <Key size={17} /> },
          ],
        },
      ];
    }

    if (userRole === 'training_centre') {
      return [
        {
          sectionTitle: 'OVERVIEW',
          items: [
            { id: 'dashboard', label: 'Training Overview', icon: <LayoutDashboard size={17} /> },
          ],
        },
        {
          sectionTitle: 'TRAINING & SKILLS',
          items: [
            { id: 'skills', label: 'Skill Demand', icon: <BrainCircuit size={17} />, badge: '36 Skills', badgeColor: '#7c3aed' },
            { id: 'districts', label: 'Districts & Capacity', icon: <MapPin size={17} />, badge: 'Capacity', badgeColor: '#0284c7' },
            { id: 'gaps', label: 'Skill Gap Analysis', icon: <Grid3X3 size={17} />, badge: 'Deficits', badgeColor: '#ef4444' },
            { id: 'substitution', label: 'Skill Pathways', icon: <GitFork size={17} /> },
            { id: 'recommendations', label: 'Course Planning', icon: <Lightbulb size={17} />, badge: 'Batches', badgeColor: '#059669' },
          ],
        },
        {
          sectionTitle: 'INTELLIGENCE & AI',
          items: [
            { id: 'forecasts', label: 'Demand Forecasts', icon: <TrendingUp size={17} />, badge: '12-Mo', badgeColor: '#0891b2' },
            { id: 'ai-analyst', label: 'AI Training Advisor', icon: <BotMessageSquare size={17} />, badge: 'Copilot', badgeColor: '#8b5cf6' },
            { id: 'data-sources', label: 'Data Sources', icon: <Database size={17} />, badge: 'Live', badgeColor: '#059669' },
          ],
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { id: 'profile', label: 'Profile', icon: <User size={17} /> },
            { id: 'settings-security', label: 'Security', icon: <Key size={17} /> },
          ],
        },
      ];
    }

    // Default: Policymaker / Admin
    return [
      {
        sectionTitle: 'OVERVIEW',
        items: [
          { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={17} /> },
        ],
      },
      {
        sectionTitle: 'INTELLIGENCE',
        items: [
          { id: 'skills', label: 'Skills', icon: <BrainCircuit size={17} />, badge: '36 Skills', badgeColor: '#7c3aed' },
          { id: 'districts', label: 'Districts', icon: <MapPin size={17} />, badge: '40 Dists', badgeColor: '#0284c7' },
          { id: 'forecasts', label: 'Forecasts', icon: <TrendingUp size={17} />, badge: '12-Mo', badgeColor: '#0891b2' },
          { id: 'gaps', label: 'Gap Map', icon: <Grid3X3 size={17} />, badge: 'Critical', badgeColor: '#ef4444' },
        ],
      },
      {
        sectionTitle: 'ACTION',
        items: [
          { id: 'substitution', label: 'Skill Pathways', icon: <GitFork size={17} /> },
          { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={17} />, badge: 'Directives', badgeColor: '#059669' },
        ],
      },
      {
        sectionTitle: 'AI & DATA',
        items: [
          { id: 'ai-analyst', label: 'AI Policy Analyst', icon: <BotMessageSquare size={17} />, badge: 'Copilot', badgeColor: '#8b5cf6' },
          { id: 'data-sources', label: 'Data Sources', icon: <Database size={17} />, badge: 'Live', badgeColor: '#059669' },
        ],
      },
      {
        sectionTitle: 'ACCOUNT',
        items: [
          { id: 'profile', label: 'Profile', icon: <User size={17} /> },
          { id: 'settings-security', label: 'Security', icon: <Key size={17} /> },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: '240px',
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(12px)',
          flexDirection: 'column',
          gap: '1.2rem',
          padding: '1.25rem 0.75rem',
          minHeight: 'calc(100vh - 68px)',
          position: 'sticky',
          top: '68px',
          zIndex: 30,
          boxSizing: 'border-box',
        }}
      >
        {navGroups.map((group) => (
          <div key={group.sectionTitle} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ padding: '0 0.75rem 0.3rem', fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {group.sectionTitle}
            </div>

            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.52rem 0.75rem',
                    borderRadius: '9px',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(124, 58, 237, 0.22)' : 'transparent',
                    background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                    color: isActive ? '#7c3aed' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '18%',
                        bottom: '18%',
                        width: '3px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.83rem', fontWeight: isActive ? 700 : 500 }}>
                    <span style={{ color: isActive ? '#7c3aed' : 'var(--text-muted)', display: 'flex' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: item.badgeColor ? `${item.badgeColor}15` : 'var(--bg-surface-secondary)',
                        color: item.badgeColor || 'var(--text-secondary)',
                        border: `1px solid ${item.badgeColor ? `${item.badgeColor}30` : 'var(--border-subtle)'}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <div
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-subtle)',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeTab === 'dashboard' ? '#7c3aed' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          <Home size={18} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeTab === 'skills' ? '#7c3aed' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          <Compass size={18} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeTab === 'gaps' ? '#7c3aed' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          <Grid3X3 size={18} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-analyst')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeTab === 'ai-analyst' ? '#7c3aed' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          <BotMessageSquare size={18} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>AI Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: activeTab === 'profile' ? '#7c3aed' : 'var(--text-muted)', cursor: 'pointer' }}
        >
          <User size={18} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Profile</span>
        </button>
      </div>
    </>
  );
};
