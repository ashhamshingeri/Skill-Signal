import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const districtsRouter = Router();

// List districts with optional state filter
districtsRouter.get('/', asyncHandler(async (req, res) => {
  const { state_id, state_code } = req.query;
  
  let whereClause = '';
  const params: unknown[] = [];
  
  if (state_id) {
    whereClause = 'WHERE d.state_id = $1';
    params.push(state_id);
  } else if (state_code) {
    whereClause = 'WHERE s.code = $1';
    params.push(state_code);
  }

  const result = await query(`
    SELECT d.id, d.name, d.code, d.latitude, d.longitude, d.population,
           d.urban_percentage, d.coverage_percentage, d.data_quality_score,
           s.name as state_name, s.code as state_code, s.id as state_id,
           (SELECT COUNT(*) FROM skill_gaps sg 
            WHERE sg.district_id = d.id AND sg.gap_level IN ('critical_shortage', 'shortage')
            AND sg.month = (SELECT MAX(month) FROM skill_gaps)) as shortage_count,
           (SELECT AVG(sg.gap_index) FROM skill_gaps sg 
            WHERE sg.district_id = d.id 
            AND sg.month = (SELECT MAX(month) FROM skill_gaps)) as avg_gap
    FROM districts d
    JOIN states s ON d.state_id = s.id
    ${whereClause}
    ORDER BY s.name, d.name
  `, params);

  res.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    population: parseInt(r.population),
    urbanPercentage: parseFloat(r.urban_percentage),
    coverage: parseFloat(r.coverage_percentage),
    dataQuality: parseFloat(r.data_quality_score),
    stateName: r.state_name,
    stateCode: r.state_code,
    stateId: r.state_id,
    shortageCount: parseInt(r.shortage_count),
    avgGap: parseFloat(r.avg_gap) || 0,
  })));
}));

// District detail with full analytics
districtsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [districtInfo, topShortages, topSurpluses, fastestGrowing, declining, seasonalDemand, recommendations] = await Promise.all([
    // Basic info
    query(`
      SELECT d.*, s.name as state_name, s.code as state_code
      FROM districts d
      JOIN states s ON d.state_id = s.id
      WHERE d.id = $1
    `, [id]),
    // Top shortage skills in this district
    query(`
      SELECT s.id, s.name, s.skill_type, s.is_emerging,
             sg.gap_index, sg.severity_score, sg.gap_level,
             sf.growth_rate as forecast_growth,
             sf.confidence_level
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      LEFT JOIN skill_forecasts sf ON sg.skill_id = sf.skill_id AND sg.district_id = sf.district_id
        AND sf.forecast_month = (SELECT MIN(forecast_month) FROM skill_forecasts WHERE district_id = $1)
      WHERE sg.district_id = $1
        AND sg.month = (SELECT MAX(month) FROM skill_gaps WHERE district_id = $1)
        AND sg.gap_level IN ('critical_shortage', 'shortage')
      ORDER BY sg.severity_score DESC
      LIMIT 10
    `, [id]),
    // Top surplus skills
    query(`
      SELECT s.id, s.name, s.skill_type,
             sg.gap_index, sg.severity_score, sg.gap_level
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      WHERE sg.district_id = $1
        AND sg.month = (SELECT MAX(month) FROM skill_gaps WHERE district_id = $1)
        AND sg.gap_level IN ('critical_surplus', 'surplus')
      ORDER BY sg.severity_score DESC
      LIMIT 10
    `, [id]),
    // Fastest growing
    query(`
      SELECT s.id, s.name, s.skill_type, s.demand_momentum,
             AVG(sd.growth_rate) as avg_growth
      FROM skill_demand sd
      JOIN skills s ON sd.skill_id = s.id
      WHERE sd.district_id = $1
        AND sd.month >= (SELECT MAX(month) - interval '3 months' FROM skill_demand WHERE district_id = $1)
      GROUP BY s.id, s.name, s.skill_type, s.demand_momentum
      HAVING AVG(sd.growth_rate) > 0
      ORDER BY avg_growth DESC
      LIMIT 5
    `, [id]),
    // Declining
    query(`
      SELECT s.id, s.name, s.skill_type,
             AVG(sd.growth_rate) as avg_growth
      FROM skill_demand sd
      JOIN skills s ON sd.skill_id = s.id
      WHERE sd.district_id = $1
        AND sd.month >= (SELECT MAX(month) - interval '3 months' FROM skill_demand WHERE district_id = $1)
      GROUP BY s.id, s.name, s.skill_type
      HAVING AVG(sd.growth_rate) < 0
      ORDER BY avg_growth ASC
      LIMIT 5
    `, [id]),
    // Monthly demand pattern (last 12 months)
    query(`
      SELECT sd.month, SUM(sd.demand_count) as total_demand, SUM(ss.supply_count) as total_supply
      FROM skill_demand sd
      LEFT JOIN skill_supply ss ON sd.skill_id = ss.skill_id AND sd.district_id = ss.district_id AND sd.month = ss.month
      WHERE sd.district_id = $1
        AND sd.month >= (SELECT MAX(month) - interval '11 months' FROM skill_demand WHERE district_id = $1)
      GROUP BY sd.month
      ORDER BY sd.month
    `, [id]),
    // Recommendations for this district
    query(`
      SELECT r.*, s.name as skill_name
      FROM recommendations r
      LEFT JOIN skills s ON r.skill_id = s.id
      WHERE r.district_id = $1 AND r.is_active = true
      ORDER BY CASE r.priority 
        WHEN 'critical' THEN 1 WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 ELSE 4 END
      LIMIT 5
    `, [id]),
  ]);

  if (districtInfo.rows.length === 0) {
    res.status(404).json({ error: 'District not found' });
    return;
  }

  const d = districtInfo.rows[0];

  res.json({
    id: d.id,
    name: d.name,
    code: d.code,
    stateName: d.state_name,
    stateCode: d.state_code,
    latitude: parseFloat(d.latitude),
    longitude: parseFloat(d.longitude),
    population: parseInt(d.population),
    urbanPercentage: parseFloat(d.urban_percentage),
    coverage: parseFloat(d.coverage_percentage),
    dataQuality: parseFloat(d.data_quality_score),
    topShortages: topShortages.rows.map(r => ({
      id: r.id, name: r.name, skillType: r.skill_type, isEmerging: r.is_emerging,
      gap: parseFloat(r.gap_index), severity: parseFloat(r.severity_score),
      gapLevel: r.gap_level,
      forecastGrowth: r.forecast_growth ? parseFloat(r.forecast_growth) : null,
      confidence: r.confidence_level,
    })),
    topSurpluses: topSurpluses.rows.map(r => ({
      id: r.id, name: r.name, skillType: r.skill_type,
      gap: parseFloat(r.gap_index), severity: parseFloat(r.severity_score),
      gapLevel: r.gap_level,
    })),
    fastestGrowing: fastestGrowing.rows.map(r => ({
      id: r.id, name: r.name, skillType: r.skill_type,
      momentum: parseFloat(r.demand_momentum), avgGrowth: parseFloat(r.avg_growth),
    })),
    declining: declining.rows.map(r => ({
      id: r.id, name: r.name, skillType: r.skill_type,
      avgGrowth: parseFloat(r.avg_growth),
    })),
    seasonalDemand: seasonalDemand.rows.map(r => ({
      month: r.month, demand: parseInt(r.total_demand), supply: parseInt(r.total_supply),
    })),
    recommendations: recommendations.rows.map(r => ({
      id: r.id, skillName: r.skill_name, priority: r.priority,
      title: r.title, description: r.description,
      reasoning: r.reasoning, suggestedAction: r.suggested_action,
      demandGrowth: parseFloat(r.demand_growth),
      forecastConfidence: parseFloat(r.forecast_confidence),
    })),
    dataStatus: 'prototype',
    lastUpdated: d.updated_at,
  });
}));
