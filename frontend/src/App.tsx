import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';

// Views
import { LandingPageView } from './views/LandingPageView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ProfileView } from './views/ProfileView';
import { SecuritySettingsView } from './views/SecuritySettingsView';
import { DashboardView } from './views/DashboardView';
import { SkillIntelligenceView } from './views/SkillIntelligenceView';
import { DistrictIntelligenceView } from './views/DistrictIntelligenceView';
import { ForecastEngineView } from './views/ForecastEngineView';
import { GapHeatmapView } from './views/GapHeatmapView';
import { SubstitutionView } from './views/SubstitutionView';
import { RecommendationsView } from './views/RecommendationsView';
import { AIAnalystView } from './views/AIAnalystView';
import { DataSourcesView } from './views/DataSourcesView';
import { CheckCircle2, AlertCircle, Info, X, RefreshCw } from 'lucide-react';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-canvas, #f8f9fd)',
          padding: '2rem',
          gap: '1rem',
          textAlign: 'center',
        }}>
          <AlertCircle size={48} color="#7c3aed" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            SkillSignal hit an unexpected error.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
            Your data is safe. Try reloading the workspace.
          </p>
          <button
            className="btn btn-primary btn-md"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            <RefreshCw size={14} />
            <span>Reload workspace</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ToastContainer: React.FC = () => {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '380px',
      }}
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        return (
          <div
            key={t.id}
            className="card-white"
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              boxShadow: 'var(--shadow-lg)',
              borderLeft: `4px solid ${isSuccess ? '#10b981' : isError ? '#ef4444' : '#7c3aed'}`,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {isSuccess ? (
              <CheckCircle2 size={18} color="#059669" />
            ) : isError ? (
              <AlertCircle size={18} color="#ef4444" />
            ) : (
              <Info size={18} color="#7c3aed" />
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  // Full-screen experiences (no dashboard layout shell)
  if (activeTab === 'landing') {
    return (
      <>
        <LandingPageView />
        <ToastContainer />
      </>
    );
  }

  if (activeTab === 'login') {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  if (activeTab === 'register') {
    return (
      <>
        <RegisterView />
        <ToastContainer />
      </>
    );
  }

  if (activeTab === 'forgot-password') {
    return (
      <>
        <ForgotPasswordView />
        <ToastContainer />
      </>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'skills':
        return <SkillIntelligenceView />;
      case 'districts':
        return <DistrictIntelligenceView />;
      case 'forecasts':
        return <ForecastEngineView />;
      case 'gaps':
        return <GapHeatmapView />;
      case 'substitution':
        return <SubstitutionView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'ai-analyst':
        return <AIAnalystView />;
      case 'data-sources':
        return <DataSourcesView />;
      case 'profile':
        return <ProfileView />;
      case 'settings-security':
        return <SecuritySettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* Background Decor */}
      <div className="bg-decorations">
        <div className="orb-purple" />
        <div className="orb-cyan" />
      </div>

      {/* Top Enterprise Navbar */}
      <Navbar />

      {/* Main Workspace Body with Sidebar & Dynamic View */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 10 }}>
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            maxWidth: '1600px',
            margin: '0 auto',
            width: '100%',
            paddingBottom: '5rem', // Space for mobile nav
          }}
        >
          {renderView()}
        </main>
      </div>

      {/* Global Modals, Drawers & Toasts */}
      <GlobalSearchModal />
      <NotificationsDrawer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
