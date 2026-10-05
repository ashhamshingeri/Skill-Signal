import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Database,
  RefreshCw,
  Zap,
  TrendingUp,
  RotateCcw,
  Cpu,
  Sun,
  Compass,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: string;
  confidence?: number;
  dataSources?: string[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

// ── Markdown Content Renderer ────────────────────────────────────────────────
const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: '1.65' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '0.35rem' }} />;
        }

        // H3: ### Header
        if (trimmed.startsWith('### ')) {
          const title = trimmed.replace(/^###\s+/, '');
          return (
            <h3
              key={idx}
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: idx > 0 ? '0.5rem' : '0',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {renderFormattedText(title)}
            </h3>
          );
        }

        // H4: #### Subheader
        if (trimmed.startsWith('#### ')) {
          const subtitle = trimmed.replace(/^####\s+/, '');
          return (
            <h4
              key={idx}
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--accent-purple)',
                marginTop: '0.4rem',
                marginBottom: '0.15rem',
              }}
            >
              {renderFormattedText(subtitle)}
            </h4>
          );
        }

        // Ordered List: 1. Item
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginLeft: '0.25rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.12)',
                  color: 'var(--accent-purple)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {numberedMatch[1]}
              </span>
              <div style={{ flex: 1 }}>{renderFormattedText(numberedMatch[2])}</div>
            </div>
          );
        }

        // Bullet List: - Item or * Item
        if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
          const itemText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginLeft: '0.25rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-purple)',
                  flexShrink: 0,
                  marginTop: '8px',
                }}
              />
              <div style={{ flex: 1 }}>{renderFormattedText(itemText)}</div>
            </div>
          );
        }

        // Italic Note: *Note*
        if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
          return (
            <div
              key={idx}
              style={{
                fontSize: '0.78rem',
                fontStyle: 'italic',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
                padding: '0.35rem 0.6rem',
                background: 'var(--bg-surface-secondary)',
                borderRadius: '6px',
                borderLeft: '2px solid var(--accent-violet)',
              }}
            >
              {renderFormattedText(trimmed.slice(1, -1))}
            </div>
          );
        }

        // Normal paragraph line
        return <div key={idx}>{renderFormattedText(line)}</div>;
      })}
    </div>
  );
};

// Helper: parse **bold** and *italic* inside strings
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

// ── Quick Prompt Pills ───────────────────────────────────────────────────────
const POLICY_QUICK_PROMPTS = [
  { icon: Zap, label: 'EV Shortages in Pune', query: 'What are the critical EV shortages in Pune industrial cluster?' },
  { icon: Cpu, label: 'Semiconductor VLSI Hubs', query: 'Show 6-month forecast for Semiconductor VLSI in Bengaluru.' },
  { icon: Compass, label: 'Maharashtra Tier-2 Momentum', query: 'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?' },
  { icon: RotateCcw, label: 'Reskilling Pathways', query: 'What are the substitution pathways for ICE mechanics into EV diagnostics?' },
  { icon: Sun, label: 'Solar: Gujarat vs Rajasthan', query: 'Compare clean energy and solar technician shortages in Gujarat vs Rajasthan' },
  { icon: TrendingUp, label: 'Skill Half-Life Telemetry', query: 'Which skills have the shortest half-life and require urgent curriculum refresh?' },
];

const JOB_SEEKER_QUICK_PROMPTS = [
  { icon: Zap, label: 'Skills for EV Career', query: 'What skills should I learn for an EV career?' },
  { icon: RotateCcw, label: 'My Missing Skills for EV', query: 'What skills am I missing for EV Powertrain Diagnostics?' },
  { icon: Compass, label: 'Closest Career to Me', query: 'Which career is closest to my current mechanical skills?' },
  { icon: TrendingUp, label: 'What Should I Learn Next?', query: 'What should I learn next to increase my earning potential?' },
  { icon: Sun, label: 'Fastest Growing Skills', query: 'Which skills are growing fastest in market demand right now?' },
  { icon: BookOpen, label: 'ICE to EV Bridge Pathway', query: 'What career pathways fit an ICE mechanic background?' },
];

export const AIAnalystView: React.FC = () => {
  const { user, userRole, selectedStateId, selectedDistrictId } = useApp();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isJobSeeker = userRole === 'job_seeker';
  const isTrainingMgr = userRole === 'training_centre';

  const initialMessage: ChatMessage = isJobSeeker
    ? {
        id: 'msg-init',
        sender: 'ai',
        text: `### ⚡ Welcome${user?.name ? `, ${user.name}` : ''} to SkillSignal AI Career Advisor

I am your personalized career transition copilot, powered by real-time labour market telemetry from **2.8M+ job postings**, **148 specialized skills**, and national training registries.

#### How I can help your career today:
- 🎯 **Skill Gap Analysis**: Pinpoint exactly what competencies you need for **${user?.targetCareer || 'EV Powertrain Diagnostics'}**.
- 🔄 **Career Transition Pathways**: Find fast **2 to 8-week bridge courses** that build directly on your **${user?.currentOccupation || 'ICE mechanical'}** background.
- 📈 **Market Demand & Salary Insights**: Discover where employers in your region are hiring with wage premiums.
- 📚 **Personalized Learning Steps**: Guidance on certifications (ASDC, SCGJ), simulators, and hands-on projects.

*Type any question below or click a recommended prompt to get started!*`,
        confidence: 98,
        dataSources: ['National Career Service (NCS)', 'Skill India Digital Hub (SIDH)', 'Automotive Skills Registry'],
        suggestedFollowUps: [
          'What skills should I learn for an EV career?',
          'What skills am I missing for EV Powertrain Diagnostics?',
          'Which career is closest to my current mechanical skills?',
          'What career pathways fit an ICE mechanic background?',
        ],
        timestamp: 'Live Session',
      }
    : {
        id: 'msg-init',
        sender: 'ai',
        text: `### 🇮🇳 Welcome${user?.name ? `, ${user.name}` : ''} to SkillSignal AI Policy Analyst

I am grounded in empirical labour-market telemetry from **768 districts**, **148 specialized skills**, and national data streams including the **National Career Service (NCS)**, **Skill India Digital Hub (SIDH)**, and the **Periodic Labour Force Survey (PLFS)**.

#### What you can query:
- **Acute Shortages & Surplus Signals**: District-level vacancy volume vs certified training throughput.
- **Dynamic Skill Substitution**: Competency overlaps, bridge course duration, and reskilling pathways.
- **6 to 12-Month Demand Projections**: Machine learning forecasts with confidence intervals.
- **PMKVY 4.0 / ITI Interventions**: High-impact training batch allocations and CapEx recommendations.`,
        confidence: 96,
        dataSources: ['National Career Service (NCS)', 'Skill India Digital Hub (SIDH)', 'PLFS Survey 2025-26'],
        suggestedFollowUps: [
          'What are the critical EV shortages in Pune industrial cluster?',
          'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?',
          'What are the substitution pathways for ICE mechanics into EV diagnostics?',
          'Show 12-month demand forecast with confidence intervals for Semiconductor VLSI.',
        ],
        timestamp: 'Live Session',
      };

  const quickPrompts = isJobSeeker ? JOB_SEEKER_QUICK_PROMPTS : POLICY_QUICK_PROMPTS;

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.queryAI(textToSend, {
        stateId: selectedStateId || undefined,
        districtId: selectedDistrictId || undefined,
        role: userRole,
        userName: user?.name || undefined,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.responseText || 'Analysis generated from national telemetry.',
        intent: response.intent,
        confidence: response.confidence || 92,
        dataSources: response.dataSourcesUsed || ['National Career Service (NCS)', 'Skill India Digital Hub (SIDH)'],
        suggestedFollowUps: response.suggestedFollowUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: '### ⚠️ Telemetry Stream Notice\nUnable to reach national AI cluster at this moment. Please verify your connection or retry.',
        confidence: 0,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 125px)', minHeight: '520px' }}>
      {/* ── Top Header Panel ────────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          padding: '0.9rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              flexShrink: 0,
            }}
          >
            <BotMessageSquare size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {isJobSeeker ? 'AI Career Advisor & Skills Copilot' : isTrainingMgr ? 'AI Training & Course Planning Advisor' : 'AI Policy Analyst & Natural Language Engine'}
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{isJobSeeker ? 'Personalized Career Guidance' : 'Deterministic Intent Engine'}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={11} /> {isJobSeeker ? 'Live Hiring & Transition Telemetry' : 'Grounded in Empirical Labour Telemetry'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-emerging" style={{ fontSize: '0.72rem' }}>
            <Sparkles size={11} /> {isJobSeeker ? 'Candidate View' : `Role: ${userRole.toUpperCase()}`}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResetChat}
            title="Reset Conversation"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Quick Prompts Strip ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}
      >
        {quickPrompts.map((qp, idx) => {
          const IconComponent = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.query)}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.8rem',
                fontSize: '0.74rem',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              <IconComponent size={12} style={{ color: 'var(--accent-purple)' }} />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Messages Scroll Area ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: isUser
                    ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                    : 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isUser ? '0 2px 8px rgba(2, 132, 199, 0.25)' : '0 2px 8px rgba(124, 58, 237, 0.25)',
                }}
              >
                {isUser ? <User size={16} color="#fff" /> : <BotMessageSquare size={16} color="#fff" />}
              </div>

              {/* Message Content Box */}
              <div
                style={{
                  maxWidth: isUser ? '75%' : '85%',
                  background: isUser ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isUser ? 'rgba(124, 58, 237, 0.25)' : 'var(--border-subtle)',
                  borderLeft: !isUser ? '3px solid var(--accent-purple)' : undefined,
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  padding: '1.1rem 1.35rem',
                  boxShadow: isUser ? 'var(--shadow-xs)' : 'var(--shadow-sm)',
                }}
              >
                {/* Header row for timestamp/intent */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: isUser ? 'var(--accent-purple)' : 'var(--text-secondary)' }}>
                    {isUser ? 'You' : 'SkillSignal AI Analyst'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content */}
                <FormattedMarkdown content={msg.text} />

                {/* AI Meta Badges: Sources & Confidence */}
                {!isUser && msg.dataSources && msg.dataSources.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.74rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Database size={13} style={{ color: 'var(--accent-cyan)' }} />
                        <span>
                          Sources Verified: <strong style={{ color: 'var(--text-primary)' }}>{msg.dataSources.join(', ')}</strong>
                        </span>
                      </div>
                      {msg.confidence !== undefined && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                          <ShieldCheck size={12} /> {msg.confidence}% Confidence
                        </span>
                      )}
                    </div>

                    {/* Follow-up suggestions */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                          Recommended Follow-ups:
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {msg.suggestedFollowUps.map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              className="btn btn-secondary btn-sm"
                              style={{
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '0.74rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              onClick={() => handleSend(prompt)}
                            >
                              <span>{prompt}</span>
                              <ArrowRight size={11} style={{ opacity: 0.7 }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'center',
              padding: '0.85rem 1.25rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '480px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Analyzing multi-district telemetry...
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Querying NCS vacancy feeds, SIDH throughput & PLFS projections
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Box ──────────────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          padding: '0.65rem 0.85rem',
          display: 'flex',
          gap: '0.65rem',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <input
          type="text"
          className="input-field"
          placeholder={
            isJobSeeker
              ? "Ask a career question (e.g. 'What skills should I learn for an EV career?', 'What is my fastest transition pathway?')..."
              : "Ask a policy question (e.g. 'Compare solar technician shortages in Gujarat vs Rajasthan', 'What is the EV half-life?')..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{
            height: '42px',
            fontSize: '0.88rem',
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
            padding: '0 0.5rem',
          }}
        />
        <button
          className="btn btn-ai"
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          style={{
            height: '40px',
            padding: '0 1.25rem',
            fontSize: '0.85rem',
            flexShrink: 0,
            opacity: inputText.trim() ? 1 : 0.6,
          }}
        >
          <Send size={15} />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
};

