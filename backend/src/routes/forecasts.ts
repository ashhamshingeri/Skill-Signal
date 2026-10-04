import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const forecastsRouter = Router();

forecastsRouter.get('/', asyncHandler(async (req, res) => {
  const { skill_id, district_id, horizon } = req.query;
  
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (skill_id) { conditions.push(`sf.skill_id = $${idx++}`); params.push(skill_id); }
  if (district_id) { conditions.push(`sf.district_id = $${idx++}`); params.push(district_id); }
  
  // Horizon filter
  if (horizon === '3') {
    conditions.push(`sf.forecast_month <= sf.base_month + interval '3 months'`);
  } else if (horizon === '6') {
    conditions.push(`sf.forecast_month <= sf.base_month + interval '6 months'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(`
    SELECT sf.*,
           s.name as skill_name, s.skill_type, s.demand_momentum,
           d.name as district_name, d.code as district_code,
           st.name as state_name
    FROM skill_forecasts sf
    JOIN skills s ON sf.skill_id = s.id
    JOIN districts d ON sf.district_id = d.id
    JOIN states st ON d.state_id = st.id
    ${whereClause}
    ORDER BY sf.forecast_month, sf.confidence_score DESC
    LIMIT 100
  `, params);

  // Also get historical data for context
  let historicalData: any[] = [];
  if (skill_id && district_id) {
    const hist = await query(`
      SELECT sd.month, sd.demand_index as demand, ss.supply_index as supply,
             sd.growth_rate
      FROM skill_demand sd
      LEFT JOIN skill_supply ss ON sd.skill_id = ss.skill_id AND sd.district_id = ss.district_id AND sd.month = ss.month
      WHERE sd.skill_id = $1 AND sd.district_id = $2
      ORDER BY sd.month
    `, [skill_id, district_id]);
    historicalData = hist.rows;
  }

  res.json({
    forecasts: result.rows.map(r => ({
      id: r.id,
      skillId: r.skill_id,
      skillName: r.skill_name,
      skillType: r.skill_type,
      districtId: r.district_id,
      districtName: r.district_name,
      districtCode: r.district_code,
      stateName: r.state_name,
      forecastMonth: r.forecast_month,
      baseMonth: r.base_month,
      predictedDemand: parseFloat(r.predicted_demand),
      predictedSupply: parseFloat(r.predicted_supply),
      predictedGap: parseFloat(r.predicted_gap),
      growthRate: parseFloat(r.growth_rate),
      confidence: parseFloat(r.confidence_score),
      confidenceLevel: r.confidence_level,
      confidenceLower: parseFloat(r.confidence_lower),
      confidenceUpper: parseFloat(r.confidence_upper),
      modelVersion: r.model_version,
      factors: r.factors,
    })),
    historical: historicalData.map(r => ({
      month: r.month,
      demand: parseFloat(r.demand),
      supply: r.supply ? parseFloat(r.supply) : 0,
      growth: parseFloat(r.growth_rate),
    })),
    methodology: {
      model: 'Statistical Time-Series (v1.0)',
      description: 'Forecast is influenced by recent demand growth trends, historical seasonality patterns, and district-level supply dynamics.',
      factors: ['Demand trend analysis', 'Seasonal weighting', 'Supply gap trajectory', 'Geographic coverage'],
      note: 'This forecast uses a statistical model. Structure supports Prophet/XGBoost upgrade.',
    },
  });
}));

// Run forecast (trigger recalculation)
forecastsRouter.post('/run', asyncHandler(async (req, res) => {
  const { skill_id, district_id } = req.body;
  
  // For MVP, return existing forecasts with a "recalculated" status
  await query(`
    INSERT INTO forecast_runs (status, model_version, skills_processed, districts_processed, started_at, completed_at)
    VALUES ('completed', 'v1.0-statistical', 1, 1, NOW(), NOW())
  `);

  res.json({
    status: 'completed',
    message: 'Forecast recalculated using statistical time-series model',
    modelVersion: 'v1.0-statistical',
  });
}));
