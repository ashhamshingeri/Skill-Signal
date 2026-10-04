import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const gapsRouter = Router();

// Get gaps with filters
gapsRouter.get('/', asyncHandler(async (req, res) => {
  const { skill_id, district_id, state_id, gap_level, month } = req.query;
  
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (skill_id) { conditions.push(`sg.skill_id = $${idx++}`); params.push(skill_id); }
  if (district_id) { conditions.push(`sg.district_id = $${idx++}`); params.push(district_id); }
  if (state_id) { conditions.push(`d.state_id = $${idx++}`); params.push(state_id); }
  if (gap_level) { conditions.push(`sg.gap_level = $${idx++}`); params.push(gap_level); }
  
  // Default to latest month
  if (!month) {
    conditions.push(`sg.month = (SELECT MAX(month) FROM skill_gaps)`);
  } else {
    conditions.push(`sg.month = $${idx++}`); params.push(month);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(`
    SELECT sg.id, sg.skill_id, sg.district_id, sg.month,
           sg.demand_index, sg.supply_index, sg.gap_index,
           sg.gap_level, sg.severity_score,
           s.name as skill_name, s.skill_type,
           d.name as district_name, d.code as district_code,
           d.latitude, d.longitude,
           st.name as state_name, st.code as state_code,
           sf.growth_rate as forecast_growth,
           sf.confidence_score as forecast_confidence,
           sf.confidence_level
    FROM skill_gaps sg
    JOIN skills s ON sg.skill_id = s.id
    JOIN districts d ON sg.district_id = d.id
    JOIN states st ON d.state_id = st.id
    LEFT JOIN skill_forecasts sf ON sg.skill_id = sf.skill_id AND sg.district_id = sf.district_id
      AND sf.forecast_month = (SELECT MIN(forecast_month) FROM skill_forecasts WHERE skill_id = sg.skill_id AND district_id = sg.district_id)
    ${whereClause}
    ORDER BY sg.severity_score DESC
    LIMIT 200
  `, params);

  res.json(result.rows.map(r => ({
    id: r.id,
    skillId: r.skill_id,
    skillName: r.skill_name,
    skillType: r.skill_type,
    districtId: r.district_id,
    districtName: r.district_name,
    districtCode: r.district_code,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    stateName: r.state_name,
    stateCode: r.state_code,
    month: r.month,
    demand: parseFloat(r.demand_index),
    supply: parseFloat(r.supply_index),
    gap: parseFloat(r.gap_index),
    gapLevel: r.gap_level,
    severity: parseFloat(r.severity_score),
    forecastGrowth: r.forecast_growth ? parseFloat(r.forecast_growth) : null,
    forecastConfidence: r.forecast_confidence ? parseFloat(r.forecast_confidence) : null,
    confidenceLevel: r.confidence_level,
  })));
}));

// Gap summary by state
gapsRouter.get('/summary', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT st.id, st.name, st.code,
           COUNT(CASE WHEN sg.gap_level = 'critical_shortage' THEN 1 END) as critical_shortage,
           COUNT(CASE WHEN sg.gap_level = 'shortage' THEN 1 END) as shortage,
           COUNT(CASE WHEN sg.gap_level = 'balanced' THEN 1 END) as balanced,
           COUNT(CASE WHEN sg.gap_level = 'surplus' THEN 1 END) as surplus,
           COUNT(CASE WHEN sg.gap_level = 'critical_surplus' THEN 1 END) as critical_surplus,
           AVG(sg.severity_score) as avg_severity
    FROM skill_gaps sg
    JOIN districts d ON sg.district_id = d.id
    JOIN states st ON d.state_id = st.id
    WHERE sg.month = (SELECT MAX(month) FROM skill_gaps)
    GROUP BY st.id, st.name, st.code
    ORDER BY avg_severity DESC
  `);

  res.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
    criticalShortage: parseInt(r.critical_shortage),
    shortage: parseInt(r.shortage),
    balanced: parseInt(r.balanced),
    surplus: parseInt(r.surplus),
    criticalSurplus: parseInt(r.critical_surplus),
    avgSeverity: parseFloat(r.avg_severity),
  })));
}));
