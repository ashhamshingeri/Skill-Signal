-- SkillSignal Database Schema
-- AI-Enabled Labour Market Intelligence Platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('policymaker', 'training_centre', 'job_seeker', 'admin');
CREATE TYPE demand_level AS ENUM ('critical_shortage', 'shortage', 'balanced', 'surplus', 'critical_surplus');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE data_source_status AS ENUM ('live', 'prototype', 'unavailable', 'deprecated');
CREATE TYPE forecast_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE skill_type AS ENUM ('technical', 'vocational', 'soft', 'digital', 'green', 'emerging');
CREATE TYPE recommendation_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE notification_type AS ENUM ('shortage_detected', 'forecast_updated', 'coverage_improved', 'demand_spike', 'system');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- States
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    region VARCHAR(50),
    population BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_states_code ON states(code);

-- Districts
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    population BIGINT,
    urban_percentage DECIMAL(5, 2),
    coverage_percentage DECIMAL(5, 2) DEFAULT 0,
    data_quality_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_id, name)
);

CREATE INDEX idx_districts_state ON districts(state_id);
CREATE INDEX idx_districts_code ON districts(code);

-- Industries
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    sector VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    normalized_name VARCHAR(200) NOT NULL,
    skill_type skill_type NOT NULL DEFAULT 'technical',
    industry_id UUID REFERENCES industries(id),
    description TEXT,
    is_emerging BOOLEAN DEFAULT FALSE,
    is_green BOOLEAN DEFAULT FALSE,
    half_life_months DECIMAL(6, 2),
    demand_momentum DECIMAL(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_normalized ON skills(normalized_name);
CREATE INDEX idx_skills_type ON skills(skill_type);
CREATE INDEX idx_skills_industry ON skills(industry_id);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'job_seeker',
    organization VARCHAR(200),
    district_id UUID REFERENCES districts(id),
    state_id UUID REFERENCES states(id),
    is_demo_account BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- JOB MARKET DATA
-- ============================================================

-- Job Postings (demand signals)
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    company VARCHAR(200),
    district_id UUID NOT NULL REFERENCES districts(id),
    industry_id UUID REFERENCES industries(id),
    source VARCHAR(100),
    salary_min INTEGER,
    salary_max INTEGER,
    experience_min INTEGER,
    experience_max INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    posted_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_postings_district ON job_postings(district_id);
CREATE INDEX idx_job_postings_industry ON job_postings(industry_id);
CREATE INDEX idx_job_postings_date ON job_postings(posted_date);

-- Job-Skill mapping
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    proficiency_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_skills_job ON job_skills(job_posting_id);
CREATE INDEX idx_job_skills_skill ON job_skills(skill_id);

-- ============================================================
-- TRAINING / SUPPLY DATA
-- ============================================================

-- Training Centres
CREATE TABLE training_centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    district_id UUID NOT NULL REFERENCES districts(id),
    type VARCHAR(100), -- ITI, PMKVY, Private, University
    affiliation VARCHAR(200),
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_centres_district ON training_centres(district_id);

-- Training Programs
CREATE TABLE training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_centre_id UUID NOT NULL REFERENCES training_centres(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    name VARCHAR(300) NOT NULL,
    duration_weeks INTEGER,
    capacity_per_batch INTEGER,
    batches_per_year INTEGER,
    fee DECIMAL(10, 2),
    certification_body VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_programs_centre ON training_programs(training_centre_id);
CREATE INDEX idx_training_programs_skill ON training_programs(skill_id);

-- Training Enrolments
CREATE TABLE training_enrolments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id),
    month DATE NOT NULL,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    completed_count INTEGER NOT NULL DEFAULT 0,
    placed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_training_enrolments_program ON training_enrolments(training_program_id);
CREATE INDEX idx_training_enrolments_district ON training_enrolments(district_id);
CREATE INDEX idx_training_enrolments_month ON training_enrolments(month);

-- Certifications
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    month DATE NOT NULL,
    certified_count INTEGER NOT NULL DEFAULT 0,
    body VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certifications_skill ON certifications(skill_id);
CREATE INDEX idx_certifications_district ON certifications(district_id);

-- ============================================================
-- ANALYTICS TABLES
-- ============================================================

-- Skill Demand (aggregated monthly)
CREATE TABLE skill_demand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    demand_count INTEGER NOT NULL DEFAULT 0,
    demand_index DECIMAL(8, 4) NOT NULL DEFAULT 0,
    growth_rate DECIMAL(8, 4),
    yoy_growth DECIMAL(8, 4),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, district_id, month)
);

CREATE INDEX idx_skill_demand_skill ON skill_demand(skill_id);
CREATE INDEX idx_skill_demand_district ON skill_demand(district_id);
CREATE INDEX idx_skill_demand_month ON skill_demand(month);

-- Skill Supply (aggregated monthly)
CREATE TABLE skill_supply (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    supply_count INTEGER NOT NULL DEFAULT 0,
    supply_index DECIMAL(8, 4) NOT NULL DEFAULT 0,
    training_capacity INTEGER DEFAULT 0,
    certified_count INTEGER DEFAULT 0,
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, district_id, month)
);

CREATE INDEX idx_skill_supply_skill ON skill_supply(skill_id);
CREATE INDEX idx_skill_supply_district ON skill_supply(district_id);
CREATE INDEX idx_skill_supply_month ON skill_supply(month);

-- Skill Gaps
CREATE TABLE skill_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    demand_index DECIMAL(8, 4) NOT NULL DEFAULT 0,
    supply_index DECIMAL(8, 4) NOT NULL DEFAULT 0,
    gap_index DECIMAL(8, 4) NOT NULL DEFAULT 0, -- positive = shortage, negative = surplus
    gap_level demand_level NOT NULL DEFAULT 'balanced',
    severity_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, district_id, month)
);

CREATE INDEX idx_skill_gaps_skill ON skill_gaps(skill_id);
CREATE INDEX idx_skill_gaps_district ON skill_gaps(district_id);
CREATE INDEX idx_skill_gaps_month ON skill_gaps(month);
CREATE INDEX idx_skill_gaps_level ON skill_gaps(gap_level);

-- Skill Forecasts
CREATE TABLE skill_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    forecast_month DATE NOT NULL,
    base_month DATE NOT NULL,
    predicted_demand DECIMAL(10, 4),
    predicted_supply DECIMAL(10, 4),
    predicted_gap DECIMAL(10, 4),
    growth_rate DECIMAL(8, 4),
    confidence_score DECIMAL(5, 2) NOT NULL DEFAULT 50,
    confidence_level confidence_level NOT NULL DEFAULT 'medium',
    confidence_lower DECIMAL(10, 4),
    confidence_upper DECIMAL(10, 4),
    model_version VARCHAR(50) DEFAULT 'v1.0-statistical',
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, district_id, forecast_month, base_month)
);

CREATE INDEX idx_skill_forecasts_skill ON skill_forecasts(skill_id);
CREATE INDEX idx_skill_forecasts_district ON skill_forecasts(district_id);
CREATE INDEX idx_skill_forecasts_month ON skill_forecasts(forecast_month);

-- Skill Relationships (for substitution/similarity)
CREATE TABLE skill_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    related_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'substitute', 'prerequisite', 'related', 'upgrade'
    similarity_score DECIMAL(5, 4) NOT NULL DEFAULT 0,
    transition_weeks INTEGER,
    shared_competencies TEXT[],
    shared_tools TEXT[],
    industry_overlap DECIMAL(5, 4),
    learning_gap_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, related_skill_id, relationship_type),
    CHECK (skill_id != related_skill_id)
);

CREATE INDEX idx_skill_relationships_skill ON skill_relationships(skill_id);
CREATE INDEX idx_skill_relationships_related ON skill_relationships(related_skill_id);

-- ============================================================
-- RECOMMENDATIONS & AI
-- ============================================================

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id),
    district_id UUID REFERENCES districts(id),
    state_id UUID REFERENCES states(id),
    priority recommendation_priority NOT NULL DEFAULT 'medium',
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    suggested_action TEXT,
    demand_growth DECIMAL(8, 4),
    supply_growth DECIMAL(8, 4),
    gap_severity DECIMAL(5, 2),
    forecast_confidence DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recommendations_skill ON recommendations(skill_id);
CREATE INDEX idx_recommendations_district ON recommendations(district_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);

-- AI Queries
CREATE TABLE ai_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    query_text TEXT NOT NULL,
    intent VARCHAR(100),
    extracted_params JSONB,
    response_text TEXT,
    response_data JSONB,
    data_sources_used TEXT[],
    confidence_score DECIMAL(5, 2),
    response_time_ms INTEGER,
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_queries_user ON ai_queries(user_id);
CREATE INDEX idx_ai_queries_intent ON ai_queries(intent);

-- ============================================================
-- DATA MANAGEMENT
-- ============================================================

-- Data Sources
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'demand', 'supply', 'context'
    category VARCHAR(100),
    url VARCHAR(500),
    status data_source_status NOT NULL DEFAULT 'prototype',
    last_updated TIMESTAMP WITH TIME ZONE,
    record_count BIGINT DEFAULT 0,
    coverage_states INTEGER DEFAULT 0,
    coverage_districts INTEGER DEFAULT 0,
    data_quality_score DECIMAL(5, 2),
    description TEXT,
    api_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forecast Runs
CREATE TABLE forecast_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status forecast_status NOT NULL DEFAULT 'pending',
    model_version VARCHAR(50),
    skills_processed INTEGER DEFAULT 0,
    districts_processed INTEGER DEFAULT 0,
    total_forecasts INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Seasonality Patterns
CREATE TABLE seasonality_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    district_id UUID REFERENCES districts(id),
    month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
    seasonal_index DECIMAL(6, 4) NOT NULL DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skill_id, district_id, month_number)
);

CREATE INDEX idx_seasonality_skill ON seasonality_patterns(skill_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_centres_updated_at BEFORE UPDATE ON training_centres FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
