// SkillSignal Shared Types & Interfaces

export type UserRole = 'policymaker' | 'training_centre' | 'job_seeker' | 'admin';

export type DemandLevel =
  | 'critical_shortage'
  | 'shortage'
  | 'balanced'
  | 'surplus'
  | 'critical_surplus';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type SkillType =
  | 'technical'
  | 'vocational'
  | 'soft'
  | 'digital'
  | 'green'
  | 'emerging';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export type DataSourceStatus = 'live' | 'prototype' | 'unavailable' | 'deprecated';

export interface State {
  id: string;
  name: string;
  code: string;
  region: string;
  population?: number;
}

export interface District {
  id: string;
  stateId: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  population?: number;
  urbanPercentage?: number;
  coveragePercentage: number;
  dataQualityScore: number;
  stateName?: string;
}

export interface Industry {
  id: string;
  name: string;
  code: string;
  sector?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  normalizedName: string;
  skillType: SkillType;
  industryId?: string;
  industryName?: string;
  description?: string;
  isEmerging: boolean;
  isGreen: boolean;
  halfLifeMonths?: number;
  demandMomentum?: number;
}

export interface SkillDemandPoint {
  month: string;
  demandCount: number;
  demandIndex: number;
  growthRate?: number;
}

export interface SkillSupplyPoint {
  month: string;
  supplyCount: number;
  supplyIndex: number;
  trainingCapacity?: number;
  certifiedCount?: number;
}

export interface SkillGapPoint {
  month: string;
  demandIndex: number;
  supplyIndex: number;
  gapIndex: number;
  gapLevel: DemandLevel;
  severityScore: number;
}

export interface SkillForecast {
  id: string;
  skillId: string;
  skillName: string;
  districtId: string;
  districtName: string;
  stateName: string;
  forecastMonth: string;
  baseMonth: string;
  predictedDemand: number;
  predictedSupply: number;
  predictedGap: number;
  growthRate: number;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  confidenceLower: number;
  confidenceUpper: number;
  modelVersion: string;
  factors?: {
    trendFactor?: number;
    seasonalFactor?: number;
    decayFactor?: number;
    dataQualityWeight?: number;
  };
}

export interface SkillRelationship {
  id: string;
  skillId: string;
  skillName?: string;
  relatedSkillId: string;
  relatedSkillName: string;
  relationshipType: 'substitute' | 'prerequisite' | 'related' | 'upgrade';
  similarityScore: number;
  transitionWeeks: number;
  sharedCompetencies: string[];
  sharedTools: string[];
  industryOverlap: number;
  learningGapDescription: string;
}

export interface Recommendation {
  id: string;
  skillId?: string;
  skillName?: string;
  skillType?: SkillType;
  districtId?: string;
  districtName?: string;
  stateId?: string;
  stateName?: string;
  priority: RecommendationPriority;
  title: string;
  description: string;
  reasoning: string;
  suggestedAction?: string;
  demandGrowth?: number;
  supplyGrowth?: number;
  gapSeverity?: number;
  forecastConfidence?: number;
  isActive: boolean;
  generatedAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  category: string;
  url?: string;
  status: DataSourceStatus;
  lastUpdated?: string;
  recordCount: number;
  coverageStates: number;
  coverageDistricts: number;
  dataQualityScore: number;
  description?: string;
  apiAvailable: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  isDemoAccount?: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalSkillsTracked: number;
  criticalShortageSkills: number;
  totalDistrictsCovered: number;
  nationalAvgGapIndex: number;
  nationalAvgConfidence: number;
  activeJobPostings: number;
  totalTrainedCandidates: number;
  dataFreshnessScore: number;
}
