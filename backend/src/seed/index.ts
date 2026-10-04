// ================================================================
// SkillSignal Seed Data Generator
// Deterministic generation of realistic labour market time-series data
// ================================================================

import { query, getClient } from '../database/connection.js';
import { migrate } from '../database/migrate.js';
import bcrypt from 'bcryptjs';
import {
  STATES, DISTRICTS, INDUSTRIES, SKILLS, SKILL_RELATIONSHIPS,
  DATA_SOURCES, SEASONALITY_TEMPLATES, DEFAULT_SEASONALITY,
  type StateData, type DistrictData, type SkillData,
} from './reference-data.js';

// Deterministic pseudo-random number generator (mulberry32)
function createRNG(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRNG(42);

function randomBetween(min: number, max: number): number {
  return min + rng() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ================================================================
// MAIN SEED FUNCTION
// ================================================================

export async function seed() {
  console.log('🌱 Starting SkillSignal database seeding...\n');

  const client = await getClient();

  try {
    // Run migration first
    await migrate();

    await client.query('BEGIN');

    // 1. Seed States
    console.log('📍 Seeding states...');
    const stateIds = new Map<string, string>();
    for (const state of STATES) {
      const res = await client.query(
        `INSERT INTO states (name, code, region, population) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (code) DO UPDATE SET name = $1
         RETURNING id`,
        [state.name, state.code, state.region, state.population]
      );
      stateIds.set(state.code, res.rows[0].id);
    }
    console.log(`  ✅ ${STATES.length} states seeded`);

    // 2. Seed Districts
    console.log('📍 Seeding districts...');
    const districtIds = new Map<string, string>();
    for (const district of DISTRICTS) {
      const stateId = stateIds.get(district.stateCode);
      const coverage = Math.min(100, district.urbanPercentage * 0.8 + randomBetween(10, 30));
      const dataQuality = Math.min(100, coverage * 0.7 + randomBetween(5, 20));
      const res = await client.query(
        `INSERT INTO districts (state_id, name, code, latitude, longitude, population, urban_percentage, coverage_percentage, data_quality_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (code) DO UPDATE SET name = $2
         RETURNING id`,
        [stateId, district.name, district.code, district.latitude, district.longitude,
         district.population, district.urbanPercentage, Math.round(coverage * 100) / 100, Math.round(dataQuality * 100) / 100]
      );
      districtIds.set(district.code, res.rows[0].id);
    }
    console.log(`  ✅ ${DISTRICTS.length} districts seeded`);

    // 3. Seed Industries
    console.log('🏭 Seeding industries...');
    const industryIds = new Map<string, string>();
    for (const industry of INDUSTRIES) {
      const res = await client.query(
        `INSERT INTO industries (name, code, sector, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET name = $1
         RETURNING id`,
        [industry.name, industry.code, industry.sector, industry.description]
      );
      industryIds.set(industry.code, res.rows[0].id);
    }
    console.log(`  ✅ ${INDUSTRIES.length} industries seeded`);

    // 4. Seed Skills
    console.log('🛠️ Seeding skills...');
    const skillIds = new Map<string, string>();
    for (const skill of SKILLS) {
      const industryId = industryIds.get(skill.industryCode);
      const res = await client.query(
        `INSERT INTO skills (name, normalized_name, skill_type, industry_id, description, is_emerging, is_green, half_life_months, demand_momentum)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (name) DO UPDATE SET normalized_name = $2
         RETURNING id`,
        [skill.name, skill.normalizedName, skill.skillType, industryId, skill.description,
         skill.isEmerging, skill.isGreen, skill.halfLifeMonths, skill.demandMomentum]
      );
      skillIds.set(skill.name, res.rows[0].id);
    }
    console.log(`  ✅ ${SKILLS.length} skills seeded`);

    // 5. Seed Skill Relationships
    console.log('🔗 Seeding skill relationships...');
    let relCount = 0;
    for (const rel of SKILL_RELATIONSHIPS) {
      const skillId = skillIds.get(rel.skillName);
      const relatedId = skillIds.get(rel.relatedSkillName);
      if (skillId && relatedId) {
        await client.query(
          `INSERT INTO skill_relationships (skill_id, related_skill_id, relationship_type, similarity_score, transition_weeks, shared_competencies, shared_tools, industry_overlap, learning_gap_description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (skill_id, related_skill_id, relationship_type) DO NOTHING`,
          [skillId, relatedId, rel.type, rel.similarity, rel.transitionWeeks,
           rel.sharedCompetencies, rel.sharedTools, rel.industryOverlap, rel.learningGap]
        );
        relCount++;
      }
    }
    console.log(`  ✅ ${relCount} skill relationships seeded`);

    // 6. Seed Users (demo accounts)
    console.log('👤 Seeding demo users...');
    const passwordHash = await bcrypt.hash('demo123', 10);
    const demoUsers = [
      { email: 'policymaker@skillsignal.demo', name: 'Dr. Priya Sharma', role: 'policymaker', org: 'Ministry of Skill Development' },
      { email: 'training@skillsignal.demo', name: 'Rajesh Kumar', role: 'training_centre', org: 'Gujarat Skill Development Centre' },
      { email: 'jobseeker@skillsignal.demo', name: 'Anita Patel', role: 'job_seeker', org: null },
      { email: 'admin@skillsignal.demo', name: 'System Admin', role: 'admin', org: 'SkillSignal' },
    ];
    const userIds = new Map<string, string>();
    for (const user of demoUsers) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, name, role, organization, is_demo_account)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (email) DO UPDATE SET name = $3
         RETURNING id`,
        [user.email, passwordHash, user.name, user.role, user.org]
      );
      userIds.set(user.role, res.rows[0].id);
    }
    console.log(`  ✅ ${demoUsers.length} demo users seeded`);

    // 7. Generate Time-Series Data (24 months)
    console.log('\n📊 Generating time-series data (24 months)...');
    const baseDate = new Date('2025-01-01');
    const months: Date[] = [];
    for (let i = 0; i < 24; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + i);
      months.push(d);
    }

    // Skill demand/supply profiles per skill (base values + growth rates)
    const skillProfiles = generateSkillProfiles(SKILLS);

    let demandRecords = 0;
    let supplyRecords = 0;
    let gapRecords = 0;
    let forecastRecords = 0;
    let jobPostingRecords = 0;
    let trainingCentreRecords = 0;

    // Process each district
    for (const district of DISTRICTS) {
      const districtId = districtIds.get(district.code)!;
      const urbanFactor = district.urbanPercentage / 100;

      // District-level modifiers
      const districtMod = getDistrictModifiers(district);

      for (const skill of SKILLS) {
        const skillId = skillIds.get(skill.name)!;
        const profile = skillProfiles.get(skill.name)!;

        // Check if this skill is relevant to this district
        const relevance = getSkillDistrictRelevance(skill, district, districtMod);
        if (relevance < 0.15) continue; // Skip very low relevance combos

        const seasonalIndices = getSeasonalIndices(skill.name);

        for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
          const month = months[monthIdx];
          const monthNum = month.getMonth() + 1;
          const seasonalFactor = seasonalIndices[monthNum - 1];

          // Calculate demand
          const trendFactor = 1 + (profile.demandGrowthRate * monthIdx / 12);
          const baseDemand = profile.baseDemand * relevance * urbanFactor;
          const noise = 1 + (rng() - 0.5) * 0.15;
          const demandIndex = Math.max(0, baseDemand * trendFactor * seasonalFactor * noise);
          const demandCount = Math.round(demandIndex * 100);

          // Calculate growth rate
          const prevDemand = monthIdx > 0 ?
            profile.baseDemand * relevance * urbanFactor * (1 + (profile.demandGrowthRate * (monthIdx - 1) / 12)) : demandIndex;
          const growthRate = prevDemand > 0 ? ((demandIndex - prevDemand) / prevDemand) * 100 : 0;

          // YoY growth
          const yoyGrowth = monthIdx >= 12 ?
            ((demandIndex / (profile.baseDemand * relevance * urbanFactor * (1 + (profile.demandGrowthRate * (monthIdx - 12) / 12)))) - 1) * 100 : null;

          // Insert demand
          await client.query(
            `INSERT INTO skill_demand (skill_id, district_id, month, demand_count, demand_index, growth_rate, yoy_growth, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'prototype_dataset')
             ON CONFLICT (skill_id, district_id, month) DO NOTHING`,
            [skillId, districtId, month.toISOString().split('T')[0], demandCount,
             Math.round(demandIndex * 10000) / 10000,
             Math.round(growthRate * 10000) / 10000,
             yoyGrowth ? Math.round(yoyGrowth * 10000) / 10000 : null]
          );
          demandRecords++;

          // Calculate supply (usually lags behind demand)
          const supplyTrend = 1 + (profile.supplyGrowthRate * monthIdx / 12);
          const baseSupply = profile.baseSupply * relevance * urbanFactor;
          const supplyNoise = 1 + (rng() - 0.5) * 0.10;
          const supplyIndex = Math.max(0, baseSupply * supplyTrend * supplyNoise);
          const supplyCount = Math.round(supplyIndex * 100);
          const trainingCapacity = Math.round(supplyCount * 1.2);

          await client.query(
            `INSERT INTO skill_supply (skill_id, district_id, month, supply_count, supply_index, training_capacity, source)
             VALUES ($1, $2, $3, $4, $5, $6, 'prototype_dataset')
             ON CONFLICT (skill_id, district_id, month) DO NOTHING`,
            [skillId, districtId, month.toISOString().split('T')[0], supplyCount,
             Math.round(supplyIndex * 10000) / 10000, trainingCapacity]
          );
          supplyRecords++;

          // Calculate gap
          const gapIndex = demandIndex - supplyIndex;
          const normalizedGap = supplyIndex > 0 ? gapIndex / Math.max(demandIndex, supplyIndex) : (demandIndex > 0 ? 1 : 0);
          let gapLevel: string;
          if (normalizedGap > 0.4) gapLevel = 'critical_shortage';
          else if (normalizedGap > 0.15) gapLevel = 'shortage';
          else if (normalizedGap > -0.15) gapLevel = 'balanced';
          else if (normalizedGap > -0.4) gapLevel = 'surplus';
          else gapLevel = 'critical_surplus';

          const severity = Math.abs(normalizedGap) * 100;

          await client.query(
            `INSERT INTO skill_gaps (skill_id, district_id, month, demand_index, supply_index, gap_index, gap_level, severity_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (skill_id, district_id, month) DO NOTHING`,
            [skillId, districtId, month.toISOString().split('T')[0],
             Math.round(demandIndex * 10000) / 10000,
             Math.round(supplyIndex * 10000) / 10000,
             Math.round(gapIndex * 10000) / 10000,
             gapLevel, Math.round(severity * 100) / 100]
          );
          gapRecords++;
        }

        // Generate forecasts (6 months from last data point)
        const lastMonth = months[months.length - 1];
        for (let fMonthOffset = 1; fMonthOffset <= 6; fMonthOffset++) {
          const forecastDate = new Date(lastMonth);
          forecastDate.setMonth(forecastDate.getMonth() + fMonthOffset);
          const fMonthNum = forecastDate.getMonth() + 1;
          const fSeasonalFactor = seasonalIndices[fMonthNum - 1];

          const fTrendFactor = 1 + (profile.demandGrowthRate * (24 + fMonthOffset) / 12);
          const fBaseDemand = profile.baseDemand * relevance * urbanFactor;
          const fDemand = fBaseDemand * fTrendFactor * fSeasonalFactor;

          const fSupplyTrend = 1 + (profile.supplyGrowthRate * (24 + fMonthOffset) / 12);
          const fSupply = profile.baseSupply * relevance * urbanFactor * fSupplyTrend;
          const fGap = fDemand - fSupply;
          const fGrowth = profile.demandGrowthRate * 100;

          // Confidence based on data volume, consistency
          const dataVolumeFactor = Math.min(1, relevance * urbanFactor * 2);
          const horizonPenalty = 1 - (fMonthOffset * 0.05);
          const baseConfidence = 65 + dataVolumeFactor * 25;
          const confidence = Math.max(30, Math.min(95, baseConfidence * horizonPenalty));
          const confLevel = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';

          const confWidth = fDemand * (1 - confidence / 100) * 0.5;

          await client.query(
            `INSERT INTO skill_forecasts (skill_id, district_id, forecast_month, base_month, predicted_demand, predicted_supply, predicted_gap, growth_rate, confidence_score, confidence_level, confidence_lower, confidence_upper, model_version, factors)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'v1.0-statistical', $13)
             ON CONFLICT (skill_id, district_id, forecast_month, base_month) DO NOTHING`,
            [skillId, districtId,
             forecastDate.toISOString().split('T')[0],
             lastMonth.toISOString().split('T')[0],
             Math.round(fDemand * 10000) / 10000,
             Math.round(fSupply * 10000) / 10000,
             Math.round(fGap * 10000) / 10000,
             Math.round(fGrowth * 10000) / 10000,
             Math.round(confidence * 100) / 100,
             confLevel,
             Math.round((fDemand - confWidth) * 10000) / 10000,
             Math.round((fDemand + confWidth) * 10000) / 10000,
             JSON.stringify({
               trend_weight: 0.4,
               seasonal_weight: 0.25,
               supply_weight: 0.2,
               coverage_weight: 0.15,
             })]
          );
          forecastRecords++;
        }
      }

      // Generate some training centres and programs per district
      const numCentres = Math.max(1, Math.round(urbanFactor * 3 + rng() * 2));
      for (let c = 0; c < numCentres; c++) {
        const centreType = pickRandom(['ITI', 'PMKVY', 'Private', 'Government', 'University']);
        const res = await client.query(
          `INSERT INTO training_centres (name, district_id, type, affiliation, capacity, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [`${centreType} Training Centre ${district.name} - ${c + 1}`,
           districtId, centreType,
           centreType === 'PMKVY' ? 'NSDC' : centreType === 'ITI' ? 'NCVT' : 'State Skill Board',
           randomInt(50, 500)]
        );
        trainingCentreRecords++;

        // Each centre offers 2-5 programs
        const relevantSkills = SKILLS.filter(s => getSkillDistrictRelevance(s, district, districtMod) > 0.2);
        const numPrograms = Math.min(relevantSkills.length, randomInt(2, 5));
        for (let p = 0; p < numPrograms; p++) {
          const progSkill = relevantSkills[p % relevantSkills.length];
          const progSkillId = skillIds.get(progSkill.name);
          if (!progSkillId) continue;

          await client.query(
            `INSERT INTO training_programs (training_centre_id, skill_id, name, duration_weeks, capacity_per_batch, batches_per_year, fee, certification_body, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
            [res.rows[0].id, progSkillId,
             `${progSkill.name} Training Program`,
             randomInt(4, 24),
             randomInt(15, 40),
             randomInt(2, 8),
             randomInt(0, 25000),
             centreType === 'ITI' ? 'NCVT' : 'NSDC']
          );
        }
      }

      // Generate some sample job postings
      const numJobPostings = Math.round(urbanFactor * 50 + rng() * 30);
      const companies = ['Tata', 'Wipro', 'Infosys', 'L&T', 'Mahindra', 'Reliance', 'Adani', 'Bajaj', 'Hero', 'TVS', 'HCL', 'Tech Mahindra', 'JSW', 'Bharat Forge', 'KPIT'];

      for (let j = 0; j < numJobPostings; j++) {
        const postSkill = pickRandom(SKILLS.filter(s => getSkillDistrictRelevance(s, district, districtMod) > 0.15));
        const postSkillId = skillIds.get(postSkill.name);
        const industryId = industryIds.get(postSkill.industryCode);
        if (!postSkillId || !industryId) continue;

        const postedDate = new Date(months[randomInt(12, 23)]);
        postedDate.setDate(randomInt(1, 28));

        const res = await client.query(
          `INSERT INTO job_postings (title, company, district_id, industry_id, source, salary_min, salary_max, experience_min, experience_max, posted_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [`${postSkill.name} - ${pickRandom(['Junior', 'Senior', 'Lead', 'Associate', 'Specialist'])}`,
           pickRandom(companies) + pickRandom([' Ltd', ' Technologies', ' Solutions', ' Industries', ' Group']),
           districtId, industryId,
           pickRandom(['NCS', 'Naukri', 'Indeed', 'LinkedIn', 'Local Board']),
           randomInt(15000, 50000), randomInt(30000, 120000),
           randomInt(0, 3), randomInt(2, 10),
           postedDate.toISOString().split('T')[0]]
        );

        await client.query(
          `INSERT INTO job_skills (job_posting_id, skill_id, is_primary, proficiency_level)
           VALUES ($1, $2, true, $3)`,
          [res.rows[0].id, postSkillId, pickRandom(['beginner', 'intermediate', 'advanced'])]
        );
        jobPostingRecords++;
      }

      // Progress log
      const dIdx = DISTRICTS.indexOf(district) + 1;
      if (dIdx % 5 === 0 || dIdx === DISTRICTS.length) {
        console.log(`  📊 District ${dIdx}/${DISTRICTS.length}: ${district.name} (${district.stateCode}) - processed`);
      }
    }

    // 8. Seed Seasonality Patterns
    console.log('\n🌊 Seeding seasonality patterns...');
    let seasonalRecords = 0;
    for (const template of SEASONALITY_TEMPLATES) {
      for (const skillName of template.skillNames) {
        const skillId = skillIds.get(skillName);
        if (!skillId) continue;
        for (let m = 1; m <= 12; m++) {
          await client.query(
            `INSERT INTO seasonality_patterns (skill_id, month_number, seasonal_index, description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (skill_id, district_id, month_number) DO NOTHING`,
            [skillId, m, template.monthlyIndices[m - 1], template.description]
          );
          seasonalRecords++;
        }
      }
    }
    // Default seasonality for remaining skills
    for (const skill of SKILLS) {
      const hasTemplate = SEASONALITY_TEMPLATES.some(t => t.skillNames.includes(skill.name));
      if (hasTemplate) continue;
      const skillId = skillIds.get(skill.name);
      if (!skillId) continue;
      for (let m = 1; m <= 12; m++) {
        await client.query(
          `INSERT INTO seasonality_patterns (skill_id, month_number, seasonal_index, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (skill_id, district_id, month_number) DO NOTHING`,
          [skillId, m, DEFAULT_SEASONALITY[m - 1], 'Default: relatively stable demand']
        );
        seasonalRecords++;
      }
    }
    console.log(`  ✅ ${seasonalRecords} seasonality records seeded`);

    // 9. Seed Data Sources
    console.log('📡 Seeding data sources...');
    for (const ds of DATA_SOURCES) {
      await client.query(
        `INSERT INTO data_sources (name, type, category, url, status, record_count, coverage_states, coverage_districts, data_quality_score, description, api_available, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT DO NOTHING`,
        [ds.name, ds.type, ds.category, ds.url, ds.status, ds.recordCount,
         ds.coverageStates, ds.coverageDistricts, ds.dataQuality, ds.description, ds.apiAvailable]
      );
    }
    console.log(`  ✅ ${DATA_SOURCES.length} data sources seeded`);

    // 10. Generate Recommendations
    console.log('💡 Generating recommendations...');
    let recCount = 0;
    // Find top shortage skill/district combos from gaps
    const topGaps = await client.query(`
      SELECT sg.skill_id, sg.district_id, s.name as skill_name, d.name as district_name, 
             st.name as state_name, d.state_id,
             AVG(sg.gap_index) as avg_gap, AVG(sg.severity_score) as avg_severity,
             sg.gap_level
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      JOIN districts d ON sg.district_id = d.id
      JOIN states st ON d.state_id = st.id
      WHERE sg.month >= '2026-06-01' AND sg.gap_level IN ('critical_shortage', 'shortage')
      GROUP BY sg.skill_id, sg.district_id, s.name, d.name, st.name, d.state_id, sg.gap_level
      ORDER BY avg_severity DESC
      LIMIT 50
    `);

    for (const gap of topGaps.rows) {
      // Get forecast for this combo
      const forecast = await client.query(`
        SELECT AVG(growth_rate) as avg_growth, AVG(confidence_score) as avg_conf
        FROM skill_forecasts
        WHERE skill_id = $1 AND district_id = $2
      `, [gap.skill_id, gap.district_id]);

      const fGrowth = forecast.rows[0]?.avg_growth || 0;
      const fConf = forecast.rows[0]?.avg_conf || 50;

      const priority = gap.avg_severity > 60 ? 'critical' : gap.avg_severity > 40 ? 'high' : gap.avg_severity > 20 ? 'medium' : 'low';

      const capacityIncrease = Math.round(gap.avg_gap * 100 * 0.6);

      await client.query(
        `INSERT INTO recommendations (skill_id, district_id, state_id, priority, title, description, reasoning, suggested_action, demand_growth, supply_growth, gap_severity, forecast_confidence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          gap.skill_id, gap.district_id, gap.state_id,
          priority,
          `Increase training capacity for ${gap.skill_name} in ${gap.district_name}`,
          `${gap.skill_name} shows a significant demand-supply gap in ${gap.district_name}, ${gap.state_name}. Current gap severity is ${Math.round(gap.avg_severity)}% with ${gap.gap_level.replace('_', ' ')} conditions.`,
          `Demand growth: +${Math.round(fGrowth)}%\nSupply gap severity: ${Math.round(gap.avg_severity)}%\nForecast confidence: ${Math.round(fConf)}%\nGap level: ${gap.gap_level.replace('_', ' ')}`,
          `Consider adding ${Math.max(1, Math.round(capacityIncrease / 30))}-${Math.max(2, Math.round(capacityIncrease / 20))} additional training batches for ${gap.skill_name}. Prioritize short-cycle certification programs aligned with industry requirements.`,
          Math.round(fGrowth * 100) / 100,
          Math.round((fGrowth * 0.3) * 100) / 100,
          Math.round(gap.avg_severity * 100) / 100,
          Math.round(fConf * 100) / 100,
        ]
      );
      recCount++;
    }
    console.log(`  ✅ ${recCount} recommendations generated`);

    // 11. Seed Notifications
    console.log('🔔 Seeding notifications...');
    const policyUserId = userIds.get('policymaker');
    const sampleNotifications = [
      { type: 'shortage_detected', title: 'New Critical Shortage Detected', message: 'EV Technician demand has reached critical shortage levels in Ahmedabad district. Gap severity: 68%.' },
      { type: 'forecast_updated', title: 'Forecast Model Updated', message: 'Skill demand forecasts have been regenerated with the latest dataset. 1,284 forecasts updated across 38 districts.' },
      { type: 'coverage_improved', title: 'Coverage Improved', message: 'Data coverage for Karnataka has improved to 86% with the addition of 12 new training centre data feeds.' },
      { type: 'demand_spike', title: 'Demand Spike Detected', message: 'Solar Installation Technician demand has spiked +42% in Maharashtra over the last 30 days.' },
      { type: 'system', title: 'Dataset Refreshed', message: 'Prototype labour market dataset has been refreshed. All analytics and forecasts have been recalculated.' },
    ];
    for (const notif of sampleNotifications) {
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)`,
        [policyUserId, notif.type, notif.title, notif.message]
      );
    }
    console.log(`  ✅ ${sampleNotifications.length} notifications seeded`);

    // 12. Seed Forecast Runs
    console.log('🔮 Seeding forecast run history...');
    await client.query(
      `INSERT INTO forecast_runs (status, model_version, skills_processed, districts_processed, total_forecasts, started_at, completed_at)
       VALUES ('completed', 'v1.0-statistical', $1, $2, $3, NOW() - interval '2 hours', NOW())`,
      [SKILLS.length, DISTRICTS.length, forecastRecords]
    );

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`   States:           ${STATES.length}`);
    console.log(`   Districts:        ${DISTRICTS.length}`);
    console.log(`   Industries:       ${INDUSTRIES.length}`);
    console.log(`   Skills:           ${SKILLS.length}`);
    console.log(`   Relationships:    ${relCount}`);
    console.log(`   Demand records:   ${demandRecords.toLocaleString()}`);
    console.log(`   Supply records:   ${supplyRecords.toLocaleString()}`);
    console.log(`   Gap records:      ${gapRecords.toLocaleString()}`);
    console.log(`   Forecast records: ${forecastRecords.toLocaleString()}`);
    console.log(`   Job postings:     ${jobPostingRecords.toLocaleString()}`);
    console.log(`   Training centres: ${trainingCentreRecords}`);
    console.log(`   Recommendations:  ${recCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

interface SkillProfile {
  baseDemand: number;
  baseSupply: number;
  demandGrowthRate: number; // annual growth rate (fraction)
  supplyGrowthRate: number;
}

function generateSkillProfiles(skills: SkillData[]): Map<string, SkillProfile> {
  const profiles = new Map<string, SkillProfile>();

  for (const skill of skills) {
    const momentum = skill.demandMomentum;

    // Base demand scales with momentum
    const baseDemand = 2 + momentum * 0.8 + rng() * 2;

    // Supply typically lower than demand for high-momentum skills, higher for declining
    const supplyRatio = momentum > 7 ? 0.55 + rng() * 0.15 :
                        momentum > 5 ? 0.7 + rng() * 0.15 :
                        momentum > 3 ? 0.85 + rng() * 0.15 :
                        1.1 + rng() * 0.2; // surplus for declining skills

    const baseSupply = baseDemand * supplyRatio;

    // Growth rates
    const demandGrowth = momentum > 7 ? 0.2 + rng() * 0.15 :
                         momentum > 5 ? 0.08 + rng() * 0.1 :
                         momentum > 3 ? -0.02 + rng() * 0.06 :
                         -0.15 + rng() * 0.05;

    const supplyGrowth = demandGrowth * (0.3 + rng() * 0.3); // Supply grows slower

    profiles.set(skill.name, {
      baseDemand,
      baseSupply,
      demandGrowthRate: demandGrowth,
      supplyGrowthRate: supplyGrowth,
    });
  }

  return profiles;
}

interface DistrictModifiers {
  itBoost: number;
  mfgBoost: number;
  greenBoost: number;
  constructionBoost: number;
  healthcareBoost: number;
  textileBoost: number;
  tourismBoost: number;
  agriBoost: number;
}

function getDistrictModifiers(district: DistrictData): DistrictModifiers {
  const stateCode = district.stateCode;
  const urban = district.urbanPercentage / 100;

  return {
    itBoost: (stateCode === 'KA' || stateCode === 'TN' || stateCode === 'TS' || stateCode === 'MH' || stateCode === 'DL') ? 1.5 + urban * 0.5 : 0.5,
    mfgBoost: (stateCode === 'GJ' || stateCode === 'MH' || stateCode === 'TN' || stateCode === 'UP') ? 1.3 + urban * 0.3 : 0.7,
    greenBoost: (stateCode === 'GJ' || stateCode === 'RJ' || stateCode === 'MH' || stateCode === 'KA') ? 1.4 : 0.6,
    constructionBoost: 0.8 + urban * 0.6,
    healthcareBoost: 0.7 + urban * 0.6,
    textileBoost: (stateCode === 'GJ' || stateCode === 'TN' || stateCode === 'MH') ? 1.5 : 0.4,
    tourismBoost: (stateCode === 'KL' || stateCode === 'RJ' || stateCode === 'GJ') ? 1.4 : 0.6,
    agriBoost: 1.2 - urban * 0.5,
  };
}

function getSkillDistrictRelevance(skill: SkillData, district: DistrictData, mods: DistrictModifiers): number {
  const baseRelevance = 0.3 + (district.urbanPercentage / 100) * 0.3;
  let modifier = 1.0;

  switch (skill.industryCode) {
    case 'IT': modifier = mods.itBoost; break;
    case 'MFG': modifier = mods.mfgBoost; break;
    case 'AUTO': modifier = mods.mfgBoost * 0.9; break;
    case 'RE': modifier = mods.greenBoost; break;
    case 'CONST': modifier = mods.constructionBoost; break;
    case 'HC': modifier = mods.healthcareBoost; break;
    case 'TEX': modifier = mods.textileBoost; break;
    case 'TOUR': modifier = mods.tourismBoost; break;
    case 'AGRI': modifier = mods.agriBoost; break;
    case 'ELEC': modifier = mods.mfgBoost * 0.8; break;
    case 'LOG': modifier = 0.7 + (district.urbanPercentage / 100) * 0.5; break;
    case 'FIN': modifier = mods.itBoost * 0.7; break;
    case 'EDU': modifier = 0.8 + (district.urbanPercentage / 100) * 0.3; break;
    case 'RET': modifier = 0.8 + (district.urbanPercentage / 100) * 0.4; break;
  }

  return Math.min(1.0, baseRelevance * modifier);
}

function getSeasonalIndices(skillName: string): number[] {
  for (const template of SEASONALITY_TEMPLATES) {
    if (template.skillNames.includes(skillName)) {
      return template.monthlyIndices;
    }
  }
  return DEFAULT_SEASONALITY;
}

// ================================================================
// RUN
// ================================================================

seed()
  .then(() => {
    console.log('\n✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  });
