import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const skillsRouter = Router();

// List skills with filters
skillsRouter.get('/', asyncHandler(async (req, res) => {
  const { search, skill_type, industry_id, state_id, district_id, sort, limit: lim } = req.query;
  
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(s.name ILIKE $${paramIdx} OR s.normalized_name ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (skill_type) {
    conditions.push(`s.skill_type = $${paramIdx}`);
    params.push(skill_type);
    paramIdx++;
  }
  if (industry_id) {
    conditions.push(`s.industry_id = $${paramIdx}`);
    params.push(industry_id);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY s.demand_momentum DESC';
  if (sort === 'name') orderBy = 'ORDER BY s.name';
  if (sort === 'growth') orderBy = 'ORDER BY avg_growth DESC NULLS LAST';
  if (sort === 'gap') orderBy = 'ORDER BY avg_gap DESC NULLS LAST';

  const limitVal = Math.min(parseInt(lim as string) || 50, 100);

  const result = await query(`
    SELECT s.id, s.name, s.normalized_name, s.skill_type, s.description,
           s.is_emerging, s.is_green, s.half_life_months, s.demand_momentum,
           i.name as industry_name, i.code as industry_code,
           latest_demand.demand_index as current_demand,
           latest_demand.growth_rate as current_growth,
           latest_supply.supply_index as current_supply,
           latest_gap.gap_index as current_gap,
           latest_gap.gap_level,
           latest_gap.severity_score,
           forecast_avg.avg_forecast_growth,
           forecast_avg.avg_confidence
    FROM skills s
    LEFT JOIN industries i ON s.industry_id = i.id
    LEFT JOIN LATERAL (
      SELECT AVG(sd.demand_index) as demand_index, AVG(sd.growth_rate) as growth_rate
      FROM skill_demand sd
      WHERE sd.skill_id = s.id AND sd.month = (SELECT MAX(month) FROM skill_demand)
    ) latest_demand ON true
    LEFT JOIN LATERAL (
      SELECT AVG(ss.supply_index) as supply_index
      FROM skill_supply ss
      WHERE ss.skill_id = s.id AND ss.month = (SELECT MAX(month) FROM skill_supply)
    ) latest_supply ON true
    LEFT JOIN LATERAL (
      SELECT AVG(sg.gap_index) as gap_index, 
             MODE() WITHIN GROUP (ORDER BY sg.gap_level) as gap_level,
             AVG(sg.severity_score) as severity_score
      FROM skill_gaps sg
      WHERE sg.skill_id = s.id AND sg.month = (SELECT MAX(month) FROM skill_gaps)
    ) latest_gap ON true
    LEFT JOIN LATERAL (
      SELECT AVG(sf.growth_rate) as avg_forecast_growth, AVG(sf.confidence_score) as avg_confidence
      FROM skill_forecasts sf
      WHERE sf.skill_id = s.id
    ) forecast_avg ON true
    ${whereClause}
    ${orderBy}
    LIMIT ${limitVal}
  `, params);

  res.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    normalizedName: r.normalized_name,
    skillType: r.skill_type,
    description: r.description,
    isEmerging: r.is_emerging,
    isGreen: r.is_green,
    halfLifeMonths: r.half_life_months ? parseFloat(r.half_life_months) : null,
    demandMomentum: parseFloat(r.demand_momentum),
    industry: r.industry_name,
    industryCode: r.industry_code,
    currentDemand: r.current_demand ? parseFloat(r.current_demand) : 0,
    currentGrowth: r.current_growth ? parseFloat(r.current_growth) : 0,
    currentSupply: r.current_supply ? parseFloat(r.current_supply) : 0,
    currentGap: r.current_gap ? parseFloat(r.current_gap) : 0,
    gapLevel: r.gap_level || 'balanced',
    severity: r.severity_score ? parseFloat(r.severity_score) : 0,
    forecastGrowth: r.avg_forecast_growth ? parseFloat(r.avg_forecast_growth) : 0,
    forecastConfidence: r.avg_confidence ? parseFloat(r.avg_confidence) : 0,
  })));
}));

// Skill detail
skillsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [skillInfo, demandTrend, supplyVsDemand, forecasts, seasonality, relatedSkills, districtGaps] = await Promise.all([
    query(`
      SELECT s.*, i.name as industry_name, i.code as industry_code
      FROM skills s
      LEFT JOIN industries i ON s.industry_id = i.id
      WHERE s.id = $1
    `, [id]),
    // Demand trend (24 months)
    query(`
      SELECT sd.month, AVG(sd.demand_index) as demand, AVG(sd.growth_rate) as growth
      FROM skill_demand sd
      WHERE sd.skill_id = $1
      GROUP BY sd.month
      ORDER BY sd.month
    `, [id]),
    // Supply vs demand comparison
    query(`
      SELECT sd.month, AVG(sd.demand_index) as demand, AVG(ss.supply_index) as supply
      FROM skill_demand sd
      LEFT JOIN skill_supply ss ON sd.skill_id = ss.skill_id AND sd.district_id = ss.district_id AND sd.month = ss.month
      WHERE sd.skill_id = $1
      GROUP BY sd.month
      ORDER BY sd.month
    `, [id]),
    // Forecasts
    query(`
      SELECT sf.forecast_month, AVG(sf.predicted_demand) as demand, 
             AVG(sf.predicted_supply) as supply,
             AVG(sf.predicted_gap) as gap, AVG(sf.growth_rate) as growth,
             AVG(sf.confidence_score) as confidence,
             AVG(sf.confidence_lower) as conf_lower,
             AVG(sf.confidence_upper) as conf_upper,
             MODE() WITHIN GROUP (ORDER BY sf.confidence_level) as confidence_level
      FROM skill_forecasts sf
      WHERE sf.skill_id = $1
      GROUP BY sf.forecast_month
      ORDER BY sf.forecast_month
    `, [id]),
    // Seasonality
    query(`
      SELECT month_number, seasonal_index, description
      FROM seasonality_patterns
      WHERE skill_id = $1
      ORDER BY month_number
    `, [id]),
    // Related/substitute skills
    query(`
      SELECT sr.relationship_type, sr.similarity_score, sr.transition_weeks,
             sr.shared_competencies, sr.shared_tools, sr.industry_overlap,
             sr.learning_gap_description,
             s.id as related_id, s.name as related_name, s.skill_type as related_type,
             s.demand_momentum as related_momentum
      FROM skill_relationships sr
      JOIN skills s ON sr.related_skill_id = s.id
      WHERE sr.skill_id = $1
      ORDER BY sr.similarity_score DESC
    `, [id]),
    // District gaps for this skill
    query(`
      SELECT d.id, d.name, d.code, st.name as state_name,
             sg.gap_index, sg.gap_level, sg.severity_score,
             sd.demand_index, ss.supply_index
      FROM skill_gaps sg
      JOIN districts d ON sg.district_id = d.id
      JOIN states st ON d.state_id = st.id
      LEFT JOIN skill_demand sd ON sg.skill_id = sd.skill_id AND sg.district_id = sd.district_id AND sg.month = sd.month
      LEFT JOIN skill_supply ss ON sg.skill_id = ss.skill_id AND sg.district_id = ss.district_id AND sg.month = ss.month
      WHERE sg.skill_id = $1
        AND sg.month = (SELECT MAX(month) FROM skill_gaps WHERE skill_id = $1)
      ORDER BY sg.severity_score DESC
      LIMIT 20
    `, [id]),
  ]);

  if (skillInfo.rows.length === 0) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }

  const s = skillInfo.rows[0];

  res.json({
    id: s.id,
    name: s.name,
    normalizedName: s.normalized_name,
    skillType: s.skill_type,
    description: s.description,
    isEmerging: s.is_emerging,
    isGreen: s.is_green,
    halfLifeMonths: s.half_life_months ? parseFloat(s.half_life_months) : null,
    demandMomentum: parseFloat(s.demand_momentum),
    industry: s.industry_name,
    industryCode: s.industry_code,
    demandTrend: demandTrend.rows.map(r => ({
      month: r.month,
      demand: parseFloat(r.demand),
      growth: parseFloat(r.growth),
    })),
    supplyVsDemand: supplyVsDemand.rows.map(r => ({
      month: r.month,
      demand: parseFloat(r.demand),
      supply: parseFloat(r.supply),
    })),
    forecasts: forecasts.rows.map(r => ({
      month: r.forecast_month,
      demand: parseFloat(r.demand),
      supply: parseFloat(r.supply),
      gap: parseFloat(r.gap),
      growth: parseFloat(r.growth),
      confidence: parseFloat(r.confidence),
      confidenceLower: parseFloat(r.conf_lower),
      confidenceUpper: parseFloat(r.conf_upper),
      confidenceLevel: r.confidence_level,
    })),
    seasonality: seasonality.rows.map(r => ({
      month: parseInt(r.month_number),
      index: parseFloat(r.seasonal_index),
      description: r.description,
    })),
    relatedSkills: relatedSkills.rows.map(r => ({
      id: r.related_id,
      name: r.related_name,
      type: r.related_type,
      momentum: parseFloat(r.related_momentum),
      relationshipType: r.relationship_type,
      similarity: parseFloat(r.similarity_score),
      transitionWeeks: r.transition_weeks,
      sharedCompetencies: r.shared_competencies,
      sharedTools: r.shared_tools,
      industryOverlap: parseFloat(r.industry_overlap),
      learningGap: r.learning_gap_description,
    })),
    districtGaps: districtGaps.rows.map(r => ({
      districtId: r.id, districtName: r.name, districtCode: r.code,
      stateName: r.state_name,
      gap: parseFloat(r.gap_index), gapLevel: r.gap_level,
      severity: parseFloat(r.severity_score),
      demand: r.demand_index ? parseFloat(r.demand_index) : 0,
      supply: r.supply_index ? parseFloat(r.supply_index) : 0,
    })),
    dataStatus: 'prototype',
    lastUpdated: s.updated_at,
  });
}));
