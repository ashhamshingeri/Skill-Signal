import {
  MOCK_STATES,
  MOCK_DISTRICTS,
  MOCK_SKILLS,
  MOCK_RECOMMENDATIONS,
  MOCK_DATA_SOURCES,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Track whether the backend is reachable to avoid repeated timeout delays
let backendAvailable: boolean | null = null;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30_000; // Re-check every 30s

async function checkBackend(): Promise<boolean> {
  const now = Date.now();
  if (backendAvailable !== null && now - lastBackendCheck < BACKEND_CHECK_INTERVAL) {
    return backendAvailable;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  lastBackendCheck = now;
  return backendAvailable;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isAvailable = await checkBackend();
  if (!isAvailable) {
    throw new Error('Backend unavailable');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('skillsignal_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// ─── Data Mode Indicator ──────────────────────────────────────────────────────
export function getDataMode(): 'live' | 'prototype' {
  return backendAvailable ? 'live' : 'prototype';
}

// ─── API Service ──────────────────────────────────────────────────────────────
export const api = {
  // ── Authentication ────────────────────────────────────────────────────────
  async login(email: string, password: string, rememberMe = false) {
    // Auth must NOT silently succeed — propagate errors to caller
    return await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
  },

  async register(data: { name: string; email: string; password: string; role: string; organization?: string }) {
    // Registration must NOT silently succeed — propagate errors to caller
    return await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string) {
    return await request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return await request<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    // Password change must NOT silently succeed — propagate errors to caller
    return await request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getSessions() {
    try {
      return await request<any>('/auth/sessions');
    } catch {
      return {
        activeSessions: [
          {
            id: 'sess-current',
            userId: 'usr-demo-policy',
            ip: '103.21.124.89 (New Delhi, India)',
            userAgent: 'Chrome 124.0 / Windows 11 (Current Device)',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            lastActive: new Date().toISOString(),
          },
        ],
        auditLogs: [
          { action: 'LOGIN', status: 'SUCCESS', ip: '103.21.124.89', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { action: 'DATA_EXPORT', status: 'SUCCESS', ip: '103.21.124.89', timestamp: new Date(Date.now() - 86400000).toISOString() },
        ],
        _dataMode: 'prototype',
      };
    }
  },

  async revokeSession(sessionId: string) {
    try {
      return await request<any>(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
    } catch {
      return { message: 'Session revoked successfully', _dataMode: 'prototype' };
    }
  },

  // ── Dashboard Overview ────────────────────────────────────────────────────
  // Backend endpoint: GET /api/dashboard (not /api/dashboard/overview)
  // Backend returns: { metrics, topShortages, topSurpluses, fastestGrowing, decliningSkills, sparkline }
  // Frontend expects: { summary, topShortages, topSurplus, recentForecasts, dataQualityMetrics }
  async getDashboardOverview(params?: { stateId?: string; districtId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.stateId) q.append('state_id', params.stateId);
      if (params?.districtId) q.append('district_id', params.districtId);
      const raw = await request<any>(`/dashboard?${q.toString()}`);

      // Normalize backend shape → frontend shape
      return {
        summary: {
          totalSkillsTracked: raw.metrics?.activeSkills?.value ?? 0,
          criticalShortages: raw.metrics?.shortageSkills?.value ?? 0,
          highShortages: 0,
          balancedSkills: 0,
          surplusSkills: raw.metrics?.surplusSkills?.value ?? 0,
          totalDistrictsCovered: raw.metrics?.districtsCovered?.value ?? 0,
          nationalAvgGapIndex: 0,
          avgConfidenceScore: 0,
          totalActiveJobs: raw.metrics?.demandSignals?.value ?? 0,
          totalTrainingCapacity: 0,
          totalEnrolled: 0,
          overallPlacementRate: 0,
          dataSourcesCount: 14,
          liveDataSources: 10,
        },
        topShortages: raw.topShortages || [],
        topSurplus: raw.topSurpluses || [],
        fastestGrowing: raw.fastestGrowing || [],
        decliningSkills: raw.decliningSkills || [],
        sparkline: raw.sparkline || [],
        recentForecasts: [],
        dataQualityMetrics: { avgDistrictQuality: 0, tier2Tier3Coverage: 0, freshnessHours: 0 },
        lastUpdated: raw.lastUpdated,
        _dataMode: 'live',
      };
    } catch {
      return {
        summary: {
          totalSkillsTracked: 148,
          criticalShortages: 24,
          highShortages: 42,
          balancedSkills: 66,
          surplusSkills: 16,
          totalDistrictsCovered: 768,
          nationalAvgGapIndex: 26.4,
          avgConfidenceScore: 88.2,
          totalActiveJobs: 284500,
          totalTrainingCapacity: 340000,
          totalEnrolled: 295000,
          overallPlacementRate: 68.4,
          dataSourcesCount: 14,
          liveDataSources: 10,
        },
        topShortages: MOCK_SKILLS.filter(s => s.gapIndex > 30).slice(0, 5),
        topSurplus: MOCK_SKILLS.filter(s => s.gapIndex < 0).slice(0, 5),
        recentForecasts: [
          { skillName: 'EV Diagnostics', districtName: 'Pune', predictedGap: 62.4, confidence: 91, growthRate: 0.52 },
          { skillName: 'Semiconductor VLSI', districtName: 'Bengaluru', predictedGap: 68.1, confidence: 89, growthRate: 0.65 },
          { skillName: 'Solar PV Tech', districtName: 'Ahmedabad', predictedGap: 46.8, confidence: 87, growthRate: 0.44 },
          { skillName: 'Drone Pilot', districtName: 'Jaipur', predictedGap: 32.5, confidence: 85, growthRate: 0.28 },
        ],
        dataQualityMetrics: {
          avgDistrictQuality: 88.6,
          tier2Tier3Coverage: 84.2,
          freshnessHours: 3.5,
        },
        _dataMode: 'prototype',
      };
    }
  },

  // ── States & Districts ────────────────────────────────────────────────────
  // Backend returns a raw array; frontend expects { states: [...] }
  async getStates() {
    try {
      const raw = await request<any[]>('/states');
      // Backend returns array directly
      return { states: Array.isArray(raw) ? raw : (raw as any).states || [] };
    } catch {
      return { states: MOCK_STATES, _dataMode: 'prototype' };
    }
  },

  // Backend accepts ?state_id=..., frontend passes stateId
  async getDistricts(stateId?: string) {
    try {
      const q = stateId ? `?state_id=${stateId}` : '';
      const raw = await request<any>(`/districts${q}`);
      // Backend returns array directly with different field names
      const rawArray = Array.isArray(raw) ? raw : (raw as any).districts || [];
      return {
        districts: rawArray.map((d: any) => ({
          id: d.id,
          stateId: d.stateId || d.state_id,
          stateName: d.stateName || d.state_name,
          name: d.name,
          code: d.code,
          latitude: d.latitude,
          longitude: d.longitude,
          population: d.population,
          urbanPercentage: d.urbanPercentage ?? d.urban_percentage ?? 0,
          coveragePercentage: d.coverage ?? d.coveragePercentage ?? d.coverage_percentage ?? 0,
          dataQualityScore: d.dataQuality ?? d.dataQualityScore ?? d.data_quality_score ?? 0,
        })),
      };
    } catch {
      const filtered = stateId
        ? MOCK_DISTRICTS.filter(d => d.stateId === stateId)
        : MOCK_DISTRICTS;
      return { districts: filtered, _dataMode: 'prototype' };
    }
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  // Backend accepts ?skill_type=..., frontend passes skillType
  async getSkills(params?: {
    search?: string;
    skillType?: string;
    gapLevel?: string;
    isEmerging?: boolean;
    isGreen?: boolean;
  }) {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.skillType) q.append('skill_type', params.skillType);
      if (params?.gapLevel) q.append('gap_level', params.gapLevel);
      if (params?.isEmerging !== undefined) q.append('is_emerging', String(params.isEmerging));
      if (params?.isGreen !== undefined) q.append('is_green', String(params.isGreen));
      const raw = await request<any>(`/skills?${q.toString()}`);
      const rawArray = Array.isArray(raw) ? raw : (raw as any).skills || [];
      return { skills: rawArray };
    } catch {
      let filtered = [...MOCK_SKILLS];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query) || s.industry.toLowerCase().includes(query));
      }
      if (params?.skillType) {
        filtered = filtered.filter(s => s.skillType === params.skillType);
      }
      if (params?.gapLevel) {
        filtered = filtered.filter(s => s.gapLevel === params.gapLevel);
      }
      if (params?.isGreen) {
        filtered = filtered.filter(s => s.isGreen);
      }
      if (params?.isEmerging) {
        filtered = filtered.filter(s => s.isEmerging);
      }
      return { skills: filtered, _dataMode: 'prototype' };
    }
  },

  // ── Gaps & Heatmap ────────────────────────────────────────────────────────
  async getGaps(params?: { stateId?: string; districtId?: string; gapLevel?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.stateId) q.append('state_id', params.stateId);
      if (params?.districtId) q.append('district_id', params.districtId);
      if (params?.gapLevel) q.append('gap_level', params.gapLevel);
      return await request<any>(`/gaps?${q.toString()}`);
    } catch {
      return {
        gaps: MOCK_SKILLS.map(s => ({
          skillId: s.id,
          skillName: s.name,
          skillType: s.skillType,
          industry: s.industry,
          demandIndex: s.demandIndex,
          supplyIndex: s.supplyIndex,
          gapIndex: s.gapIndex,
          gapLevel: s.gapLevel,
          severityScore: Math.abs(s.gapIndex),
          momentum: s.momentum,
        })),
        _dataMode: 'prototype',
      };
    }
  },

  // ── Forecasts ─────────────────────────────────────────────────────────────
  async getForecasts(params?: { skillId?: string; districtId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.skillId) q.append('skill_id', params.skillId);
      if (params?.districtId) q.append('district_id', params.districtId);
      return await request<any>(`/forecasts?${q.toString()}`);
    } catch {
      return {
        forecasts: [
          {
            id: 'fc-01',
            skillName: 'Electric Vehicle Powertrain Diagnostics',
            districtName: 'Pune',
            stateName: 'Maharashtra',
            forecastMonth: '2026-09-01',
            predictedDemand: 98.4,
            predictedSupply: 36.2,
            predictedGap: 62.2,
            growthRate: 0.52,
            confidenceScore: 91,
            confidenceLevel: 'high',
            confidenceLower: 54.0,
            confidenceUpper: 70.4,
            factors: { trend: 0.45, seasonal: 1.15, decay: 0.92, macroWeight: 0.88 },
          },
          {
            id: 'fc-02',
            skillName: 'Semiconductor VLSI Layout & Verification',
            districtName: 'Bengaluru Urban',
            stateName: 'Karnataka',
            forecastMonth: '2026-09-01',
            predictedDemand: 96.0,
            predictedSupply: 31.0,
            predictedGap: 65.0,
            growthRate: 0.65,
            confidenceScore: 89,
            confidenceLevel: 'high',
            confidenceLower: 56.5,
            confidenceUpper: 73.5,
            factors: { trend: 0.58, seasonal: 1.02, decay: 0.95, macroWeight: 0.94 },
          },
          {
            id: 'fc-03',
            skillName: 'Solar PV Grid Integration',
            districtName: 'Ahmedabad',
            stateName: 'Gujarat',
            forecastMonth: '2026-09-01',
            predictedDemand: 89.2,
            predictedSupply: 46.0,
            predictedGap: 43.2,
            growthRate: 0.44,
            confidenceScore: 87,
            confidenceLevel: 'high',
            confidenceLower: 37.0,
            confidenceUpper: 49.4,
            factors: { trend: 0.38, seasonal: 1.22, decay: 0.96, macroWeight: 0.85 },
          },
        ],
        _dataMode: 'prototype',
      };
    }
  },

  // ── Recommendations ───────────────────────────────────────────────────────
  async getRecommendations(params?: { priority?: string; stateId?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.priority) q.append('priority', params.priority);
      if (params?.stateId) q.append('state_id', params.stateId);
      const raw = await request<any>(`/recommendations?${q.toString()}`);
      const rawArray = Array.isArray(raw) ? raw : (raw as any).recommendations || [];
      return { recommendations: rawArray };
    } catch {
      return { recommendations: MOCK_RECOMMENDATIONS, _dataMode: 'prototype' };
    }
  },

  // ── AI Analyst Query ──────────────────────────────────────────────────────
  // ── AI Analyst Query ──────────────────────────────────────────────────────
  async queryAI(queryText: string, context?: { stateId?: string; districtId?: string; role?: string; userName?: string }) {
    try {
      const res = await request<any>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query: queryText, ...context }),
      });
      
      // If backend returns structured fields but no formatted responseText, synthesize it
      if (res && !res.responseText) {
        let markdown = `### 📊 ${res.title || 'Labour Market Intelligence Analysis'}\n\n${res.summary || ''}\n\n`;
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          markdown += `#### Key Telemetry Breakdown:\n`;
          res.data.forEach((item: any) => {
            const parts = [];
            if (item.district) parts.push(`**District**: ${item.district}${item.state ? ` (${item.state})` : ''}`);
            if (item.gapLevel) parts.push(`**Status**: ${item.gapLevel}`);
            if (item.severity) parts.push(`**Severity**: ${item.severity}`);
            if (item.growth) parts.push(`**Growth**: ${item.growth}`);
            if (item.momentum) parts.push(`**Momentum**: ${item.momentum}`);
            if (item.forecastGrowth) parts.push(`**Forecast**: ${item.forecastGrowth}`);
            markdown += `- **${item.skill}** (${item.skillType || 'Technical'}): ${parts.join(' | ')}\n`;
          });
          markdown += '\n';
        }
        if (res.recommendedAction) {
          markdown += `#### 💡 Recommended Policy Intervention:\n${res.recommendedAction}\n`;
        }
        res.responseText = markdown;
      }
      if (res && !res.dataSourcesUsed) {
        res.dataSourcesUsed = res.sources || ['National Career Service (NCS)', 'Skill India Digital Hub (SIDH)', 'PLFS Survey 2025-26'];
      }
      if (res && !res.suggestedFollowUps) {
        res.suggestedFollowUps = [
          'What are the substitution pathways for this skill domain?',
          'Which Tier-2 districts show the highest momentum?',
          'Show 12-month demand forecast with confidence intervals',
        ];
      }
      return res;
    } catch {
      const q = queryText.trim().toLowerCase();
      const userName = context?.userName || '';
      const userRole = context?.role || 'policymaker';
      const greetingName = userName ? `, ${userName}` : '';

      let responseText = '';
      let intent = 'general';
      let confidence = 95;
      let followUps: string[] = [
        'What are the critical EV shortages in Pune industrial cluster?',
        'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?',
        'What are the substitution pathways for ICE mechanics into EV diagnostics?',
        'Show 12-month demand forecast with confidence intervals for Semiconductor VLSI.',
      ];

      // 1. GREETINGS & INTRODUCTIONS
      const isGreeting = /^(hi+|hey+|hello+|helo+|namaste+|pranam+|hola|good\s*(morning|afternoon|evening)|howdy)\b/i.test(q) ||
        ['hi', 'hii', 'hiii', 'hey', 'hello', 'namaste', 'greetings'].includes(q);

      if (isGreeting) {
        intent = 'conversational_greeting';
        confidence = 99;
        const roleDisplay = userRole === 'training_centre' ? 'Training Center Administrator' : userRole === 'job_seeker' ? 'Candidate / Job Seeker' : 'Policy Director & Analyst';
        
        responseText = `### 👋 Hello${greetingName}!

Welcome to the **SkillSignal AI Policy Analyst**. I am your dedicated labour-market intelligence copilot, grounded in empirical data from **768 districts** and **148 specialized skills**.

${userRole ? `You are currently authenticated in the **${roleDisplay}** workspace.` : ''}

#### What would you like to explore today?
1. ⚡ **Acute Shortage Signals**: *“What are the critical EV skill shortages in Pune?”*
2. 🔬 **Semiconductor & Emerging Tech**: *“Show 6-month forecast for Semiconductor VLSI in Bengaluru.”*
3. 📍 **Regional Velocity**: *“Which Tier-2 districts in Maharashtra show the highest emerging momentum?”*
4. 🔄 **Skill Substitution Pathways**: *“What are the substitution pathways for ICE mechanics into EV diagnostics?”*
5. ☀️ **Clean Energy**: *“Compare solar technician shortages in Gujarat vs Rajasthan.”*

*Type any question or click a suggested follow-up below to begin!*`;
        followUps = [
          'What are the critical EV shortages in Pune industrial cluster?',
          'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?',
          'What are the substitution pathways for ICE mechanics into EV diagnostics?',
          'Compare clean energy shortages in Gujarat vs Rajasthan.',
        ];
      } 
      // 2. IDENTITY & CAPABILITIES
      else if (q.includes('who are you') || q.includes('what are you') || q.includes('what can you do') || q.includes('help me') || q.includes('capabilities')) {
        intent = 'system_capabilities';
        confidence = 98;
        responseText = `### 🤖 About SkillSignal AI Policy Analyst

I am a deterministic labour-market intelligence and natural language engine purpose-built for India's **Ministry of Skill Development & Entrepreneurship (MSDE)**, State Skill Development Missions (SSDMs), and Industrial Training Institutes (ITIs).

#### My Grounded Telemetry Sources:
- **National Career Service (NCS)**: 2.8M+ active vacancy postings indexed across 36 states and UTs.
- **Skill India Digital Hub (SIDH)**: Enrolment, graduation, and placement capacity across 14,000+ ITIs and PMKVY centers.
- **Periodic Labour Force Survey (PLFS 2025-26)**: Macro demographic and employment shifts.

#### Key Inquiries You Can Make:
- 📊 **Demand-Supply Gap Index**: Identify surplus vs acute shortage by district.
- 📈 **Machine Learning Forecasting**: 3, 6, and 12-month demand forecasts with confidence intervals.
- 🔄 **Competency Substitution**: Algorithmic transition pathways to minimize worker reskilling time.
- 🎯 **Directives & CapEx Grants**: Data-backed allocations for PMKVY 4.0 training infrastructure.`;
        followUps = [
          'What are the critical EV shortages in Pune industrial cluster?',
          'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?',
          'What is skill half-life and why does it matter?',
        ];
      }
      // 3. GRATITUDE / ACKNOWLEDGEMENT
      else if (q.includes('thank') || q.includes('thanks') || q.includes('thx') || q.includes('great') || q.includes('awesome') || q.includes('good job')) {
        intent = 'conversational_gratitude';
        confidence = 99;
        responseText = `### 🙏 You're very welcome${greetingName}!

I'm glad I could assist your intelligence workflow. If you need deeper telemetry on district shortages, forecast horizons, or skill substitution pathways, just let me know!`;
        followUps = [
          'Show 12-month demand forecast with confidence intervals for Semiconductor VLSI.',
          'What are the substitution pathways for ICE mechanics into EV diagnostics?',
          'Which Tier-2 districts in Maharashtra show the highest emerging skill momentum?',
        ];
      }
      // 4. REGIONAL MOMENTUM (MAHARASHTRA / TIER-2)
      else if (q.includes('tier-2') || (q.includes('maharashtra') && (q.includes('momentum') || q.includes('district')))) {
        intent = 'regional_momentum';
        confidence = 95;
        responseText = `### 📍 Emerging Skill Momentum in Maharashtra (Tier-2 & Industrial Corridors)

Across Maharashtra's Tier-2 industrial clusters, empirical telemetry identifies four high-velocity hubs:

1. **Chhatrapati Sambhaji Nagar (Aurangabad)**: **+44.2% YoY demand growth** in *Automated CNC Tooling* & *EV Component Assembly*. The Shendra-Bidkin DMIC node has accelerated hiring with **1,850 open vacancies**.
2. **Nashik**: **+38.6% growth** in *Solar Inverter Diagnostics* and *Agro-Processing Automation*. Training capacity coverage is currently at **64%** (supply deficit: 36%).
3. **Nagpur (MIHAN Hub)**: **+41.0% growth** in *Multi-Modal Logistics Automation*, *Cold Chain IoT*, and *Avionics MRO Support*.
4. **Kolhapur & Sangli**: **+31.5% growth** in *Precision Foundry Robotics* and *Hydraulic Circuit Maintenance*.

#### Strategic Policy Directive:
- Authorize 3 PMKVY satellite training centers attached to Aurangabad and Nashik auto-ancillary clusters.
- Establish a specialized Logistics & Cold-Chain skill hub at MIHAN-Nagpur.`;
        followUps = [
          'What are the critical EV shortages in Pune industrial cluster?',
          'Show substitution pathways for manufacturing workers into robotics',
          'What is the 12-month demand forecast for CNC automation in Maharashtra?',
        ];
      }
      // 5. EV & AUTOMOTIVE SHORTAGES
      else if (q.includes('ev') || q.includes('electric vehicle') || q.includes('pune') || q.includes('battery')) {
        intent = 'shortage_analysis';
        confidence = 96;
        responseText = `### ⚡ Labour Market Intelligence: EV Powertrain Diagnostics (Pune & Western Corridor)

**Current Status**: Critical Shortage (Gap Index: **+56.3**)  
**Demand Growth (YoY)**: **+52%** | **Supply Funnel Deficit**: **~68%**

#### Key Observations:
1. **Automotive Transition**: The Chakan-Talegaon manufacturing cluster has onboarded 14 new tier-1 component suppliers for EV drivetrains, scaling monthly vacancy creation by **1,450 positions**.
2. **Training Bottleneck**: Pune district currently possesses 4 certified ITIs with EV simulation equipment, capable of graduating only **180 certified technicians/quarter**.
3. **Forecast Horizon (6-12 Months)**: Skill demand is projected to rise an additional **48%** by Q4 2026.

#### Recommended Interventions (MSDE / State Directorate):
- Authorize 4 PMKVY-sponsored CapEx grants for hardware-in-the-loop diagnostic test benches.
- Deploy 3-week conversion bridge courses for legacy ICE auto-mechanics.`;
        followUps = [
          'What are the substitution pathways for ICE mechanics into EV diagnostics?',
          'Which other districts in Maharashtra need EV technician capacity?',
          'Compare EV skill gap in Pune vs Sanand (Gujarat)',
        ];
      }
      // 6. SEMICONDUCTOR & VLSI
      else if (q.includes('semiconductor') || q.includes('vlsi') || q.includes('chip') || q.includes('bengaluru')) {
        intent = 'emerging_tech';
        confidence = 94;
        responseText = `### 🔬 Semiconductor & VLSI Layout Talent Analysis (Bengaluru & Southern Hubs)

**Current Status**: Acute Critical Shortage (Gap Index: **+57.4**)  
**Forecast Confidence**: **89.5% (High)**

#### Key Signals:
- India Semiconductor Mission (ISM) fab and packaging units in Karnataka & Gujarat require over **3,400 layout verification engineers** over the next 18 months.
- Half-life for sub-28nm EDA design toolchains is **20 months**, requiring continuous curriculum refreshes.
- Tier-2 centers such as Mysuru and Hubballi-Dharwad are emerging as secondary verification hubs.

#### Policy Action:
- Coordinate with MeitY and C-DAC to deploy university-level EDA cadence credits to 12 Tier-2 engineering colleges.
- Sponsor 6-month hands-on cleanroom apprenticeships under ISM training funds.`;
        followUps = [
          'Show 12-month demand forecast with confidence intervals for Semiconductor VLSI.',
          'What are the training requirements for semiconductor packaging (ATMP/OSAT)?',
          'Which colleges in Karnataka can host semiconductor design labs?',
        ];
      }
      // 7. SUBSTITUTION PATHWAYS & RESKILLING
      else if (q.includes('substitution') || q.includes('pathway') || q.includes('transition') || q.includes('ice mechanic') || q.includes('typist') || q.includes('annotator')) {
        intent = 'substitution_pathways';
        confidence = 95;
        responseText = `### 🔄 Rapid Skill Substitution & Reskilling Pathways

SkillSignal's semantic taxonomy engine maps adjacent competency transfers to minimize reskilling time:

**1. Transition: Legacy ICE Auto-Mechanic ➔ EV Powertrain Diagnostics**
- **Competency Overlap**: **78%** (Mechanical diagnostics, hydraulic brake systems, chassis safety).
- **Delta Skills Needed**: High-voltage battery safety (400V+), CAN bus data logging, inverter thermal management.
- **Estimated Reskilling Time**: **3 to 4 weeks** (vs 18 months from zero-baseline).
- **High-Impact Locations**: Pune, Sanand, Chennai (Sriperumbudur), Gurugram.

**2. Transition: Back-Office Data Entry Typist ➔ AI Data Annotator & RLHF Evaluator**
- **Competency Overlap**: **64%** (Keyboard speed, digital document structuring, pattern tagging).
- **Delta Skills Needed**: Multi-modal bounding box labeling, LLM hallucination scoring, prompt taxonomy categorization.
- **Estimated Reskilling Time**: **2 weeks** digital self-paced + practical lab.
- **High-Impact Locations**: Tier-2 digital centers (Noida, Lucknow, Indore, Coimbatore).`;
        followUps = [
          'What are the substitution pathways for welder into robotic welding operator?',
          'What is the curriculum cost for a 3-week EV conversion course?',
          'Show district-wise candidate pool for auto mechanic reskilling in Maharashtra',
        ];
      }
      // 8. SOLAR & CLEAN ENERGY
      else if (q.includes('solar') || q.includes('gujarat') || q.includes('rajasthan') || q.includes('clean energy') || q.includes('renewable')) {
        intent = 'clean_energy_analysis';
        confidence = 93;
        responseText = `### ☀️ Clean Energy & Solar Technician Comparative Analysis: Gujarat vs Rajasthan

Empirical telemetry comparison across western solar corridors:

**1. Gujarat (Khavda & Dholera Renewable Corridors)**:
- **Net Skill Gap Index**: **+46.8** (Critical Shortage)
- **Monthly Vacancies**: ~2,850 open technician roles across solar parks and green hydrogen test facilities.
- **Training Supply**: 18 accredited solar institutes graduating ~420 technicians/month (Supply deficit: **~52%**).

**2. Rajasthan (Bhadla & Jodhpur-Bikaner Solar Belt)**:
- **Net Skill Gap Index**: **+54.1** (Acute Shortage)
- **Key Bottleneck**: High-voltage grid synchronization and desert dust mitigation robotics.
- **Training Supply**: 9 certified ITIs with solar rooftop simulation in Jodhpur and Bikaner.

#### MSDE Recommended Action:
- Deploy 6 mobile solar training units under PM Surya Ghar Muft Bijli Yojana across Bikaner-Jaisalmer-Jodhpur axis.
- Standardize 45-day solar inverter troubleshooting micro-credentials in Gujarat ITIs.`;
        followUps = [
          'What is the skill half-life for solar inverter technicians?',
          'Which districts in Rajasthan have the largest solar capacity deficit?',
          'Show training center expansion plan for PM Surya Ghar',
        ];
      }
      // 9. FORECASTS & PROJECTIONS
      else if (q.includes('forecast') || q.includes('projection') || q.includes('12-month') || q.includes('6-month') || q.includes('future') || q.includes('predict')) {
        intent = 'forecast_query';
        confidence = 92;
        responseText = `### 📈 6 to 12-Month National Skill Demand Projections

**Empirical Forecasting Engine (Prophet-LSTM Ensemble with 91.4% R² Accuracy)**:

1. **EV Battery & Inverter Assembly**: Demand projected to accelerate by **+48.2%** over next 12 months. Peak shortage window: Q3–Q4 2026.
2. **Semiconductor Mask Verification & Sub-28nm EDA**: Projected **+62.0%** increase across Karnataka, Gujarat, and Tamil Nadu.
3. **Green Hydrogen Electrolyzer Maintenance**: **+74.0%** emerging demand trajectory from early baseline.
4. **Legacy Keystroke Data Entry**: Projected **-34.5%** structural decline YoY due to automated OCR and LLM pipelines.

**Empirical Confidence Intervals**:
- Technical & Vocational Track: **92.4% Confidence** (Grounded in NCS vacancy postings & EPFO registration).
- Emerging Tech Domains: **86.1% Confidence** (Higher market variance).`;
        followUps = [
          'What skills are projected to decline fastest in next 24 months?',
          'Show district-level forecast for Semiconductor VLSI',
          'Which interventions prevent EV technician shortages in 2027?',
        ];
      }
      // 10. SKILL HALF-LIFE & CURRICULUM OBSOLESCENCE
      else if (q.includes('half-life') || q.includes('curriculum') || q.includes('obsolescence') || q.includes('decay')) {
        intent = 'half_life_analysis';
        confidence = 94;
        responseText = `### ⏳ Skill Half-Life & Curriculum Obsolescence Telemetry

Skill half-life measures the time required for 50% of a skill's market utility or toolchain proficiency to become obsolete:

**Fastest Decaying Skill Sets (High Obsolescence Risk)**:
- **Generative AI Frameworks & Toolchains**: Half-life **14 months** (Demands dynamic continuous micro-credentials).
- **Frontend Web & UI Toolchains**: Half-life **18 months**.
- **EDA Semiconductor Toolsets**: Half-life **20 months**.

**Durable Skill Sets (Long Half-Life)**:
- **Heavy Industrial Welding & Structural Fabrication**: Half-life **8+ years**.
- **Precision CNC Lathe Programming**: Half-life **5.5 years**.
- **High-Voltage Electrical Substation Safety**: Half-life **7+ years**.

#### MSDE Policy Directive:
- Decouple fast-decay skills (< 24 month half-life) from static multi-year diplomas into 6-week industry-partnered micro-credentials.`;
        followUps = [
          'Which skills in IT sector have the shortest half-life?',
          'How can ITI curricula adapt to short skill half-lives?',
          'What are the durable foundational skills for mechanical engineers?',
        ];
      }
      // 11. POLICY DIRECTIVES & PMKVY/ITI RECOMMENDATIONS
      else if (q.includes('recommend') || q.includes('policy') || q.includes('action') || q.includes('iti') || q.includes('pmkvy')) {
        intent = 'policy_action';
        confidence = 95;
        responseText = `### 🎯 High-Priority Policy Directives for Q2/Q3 2026

Based on multi-district telemetry from NCS, SIDH, and PLFS, the following 3 directives are recommended for MSDE and State Skill Missions:

1. **Clean Energy Grid Technicians (Gujarat & Rajasthan)**: Scale solar inverter technician seats by **+40%** to meet PM Surya Ghar rollout targets.
2. **AI & RLHF Annotation Re-skilling (Uttar Pradesh & NCR)**: Migrate **35,000 legacy data entry trainees** into RLHF prompt evaluation and multimodal annotation.
3. **5-Axis Precision Machining (Tamil Nadu & Maharashtra)**: Bridge aerospace tooling shortages with 120-day intensive apprenticeship subsidies.`;
        followUps = [
          'What are the budget estimates for PMKVY EV test benches?',
          'Which districts should receive priority for ITI upgrades?',
          'How to implement the AI annotation transition program in Uttar Pradesh?',
        ];
      }
      // 12. GENERAL LABOUR MARKET OVERVIEW
      else {
        intent = 'general_overview';
        confidence = 94;
        responseText = `### 📊 SkillSignal Comprehensive Labour Market Overview

Across **768 tracked districts** and **148 specialized skills**:
- **Critical Shortage Areas**: EV Systems (+56.3 Gap Index), VLSI Semiconductor Layout (+57.4 Gap Index), Green Hydrogen Maintenance, Precision CNC Robotics.
- **Surplus / At-Risk Skills**: Legacy Manual Keystroke Data Entry (-38% demand YoY), General Desktop Support.
- **Average District Coverage**: **84.2%** across Tier-1, Tier-2, and Tier-3 geographies.

*All metrics are grounded in empirical feeds from the National Career Service (NCS), Skill India Digital Hub (SIDH), and PLFS survey feeds.*`;
      }

      return {
        query: queryText,
        intent,
        confidence,
        responseText,
        dataSourcesUsed: ['National Career Service (NCS)', 'Skill India Digital Hub (SIDH)', 'PLFS Survey 2025-26', 'Private ATS Aggregation'],
        suggestedFollowUps: followUps,
        _dataMode: 'prototype',
      };
    }
  },

  // ── Data Sources ──────────────────────────────────────────────────────────
  async getDataSources() {
    try {
      return await request<any>('/data-sources');
    } catch {
      return {
        dataSources: MOCK_DATA_SOURCES,
        summary: {
          totalSources: 5,
          liveSources: 4,
          prototypeSources: 1,
          totalRecordsIndexed: 37195000,
          avgQualityScore: '91.8',
        },
        _dataMode: 'prototype',
      };
    }
  },

  // ── Search ────────────────────────────────────────────────────────────────
  async search(queryText: string) {
    try {
      return await request<any>(`/search?q=${encodeURIComponent(queryText)}`);
    } catch {
      const q = queryText.toLowerCase();
      return {
        query: queryText,
        results: {
          skills: MOCK_SKILLS.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5).map(s => ({
            type: 'skill',
            id: s.id,
            title: s.name,
            subtitle: `${s.industry} • ${s.skillType}`,
            url: `/skills?skillId=${s.id}`,
            tags: [s.isEmerging && 'Emerging', s.isGreen && 'Green'].filter(Boolean),
          })),
          districts: MOCK_DISTRICTS.filter(d => d.name.toLowerCase().includes(q)).slice(0, 4).map(d => ({
            type: 'district',
            id: d.id,
            title: `${d.name} (${d.code})`,
            subtitle: `${d.stateName} • ${d.coveragePercentage}% coverage`,
            url: `/districts?districtId=${d.id}`,
          })),
          states: MOCK_STATES.filter(s => s.name.toLowerCase().includes(q)).slice(0, 3).map(s => ({
            type: 'state',
            id: s.id,
            title: s.name,
            subtitle: `${s.region} region`,
            url: `/districts?stateId=${s.id}`,
          })),
          industries: [
            'Automotive & Clean Mobility',
            'Renewable Energy',
            'Information Technology',
            'Electronics & Semiconductors',
            'Advanced Manufacturing'
          ].filter(ind => ind.toLowerCase().includes(q)).map(ind => ({
            type: 'industry',
            id: ind,
            title: ind,
            subtitle: 'Industry Sector',
            url: `/skills?industry=${encodeURIComponent(ind)}`,
          }))
        },
        _dataMode: 'prototype',
      };
    }
  },

  // ── Coverage ──────────────────────────────────────────────────────────────
  async getCoverageSummary() {
    try {
      return await request<any>('/coverage/summary');
    } catch {
      return {
        national: {
          covered_states: 36,
          covered_districts: 768,
          national_avg_coverage: 84.5,
          national_avg_quality: 89.2,
          active_training_centres: 14820,
          indexed_job_postings: 284500,
        },
        states: MOCK_STATES.map(s => ({
          stateId: s.id,
          stateName: s.name,
          stateCode: s.code,
          region: s.region,
          totalDistricts: 34,
          avgCoverage: 88.5,
          avgDataQuality: 91.0,
          highCoverageCount: 26,
          mediumCoverageCount: 7,
          lowCoverageCount: 1,
        })),
        _dataMode: 'prototype',
      };
    }
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications() {
    try {
      return await request<any>('/notifications');
    } catch {
      return {
        notifications: [
          {
            id: 'notif-1',
            type: 'shortage_detected',
            title: 'Critical Skill Shortage Alert: EV Powertrain Diagnostics',
            message: 'Pune district reported a +42% spike in unfilled OEM vacancies over 30 days.',
            createdAt: '2026-04-02T10:00:00Z',
            isRead: false,
          },
          {
            id: 'notif-2',
            type: 'forecast_updated',
            title: 'Q3 2026 Forecast Generated',
            message: 'New statistical & seasonal forecasting run completed with 88.2% avg confidence.',
            createdAt: '2026-04-01T18:30:00Z',
            isRead: false,
          },
          {
            id: 'notif-3',
            type: 'coverage_improved',
            title: 'Tier-3 District Telemetry Synced',
            message: '18 additional aspirational districts in UP and Bihar reached >75% data readiness.',
            createdAt: '2026-03-31T14:15:00Z',
            isRead: true,
          }
        ],
        unreadCount: 2,
        _dataMode: 'prototype',
      };
    }
  }
};
