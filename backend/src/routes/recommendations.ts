import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const recommendationsRouter = Router();

recommendationsRouter.get('/', asyncHandler(async (req, res) => {
  const { district_id, state_id, skill_id, priority } = req.query;
  
  const conditions: string[] = ['r.is_active = true'];
  const params: unknown[] = [];
  let idx = 1;

  if (district_id) { conditions.push(`r.district_id = $${idx++}`); params.push(district_id); }
  if (state_id) { conditions.push(`r.state_id = $${idx++}`); params.push(state_id); }
  if (skill_id) { conditions.push(`r.skill_id = $${idx++}`); params.push(skill_id); }
  if (priority) { conditions.push(`r.priority = $${idx++}`); params.push(priority); }

  const result = await query(`
    SELECT r.*, s.name as skill_name, s.skill_type,
           d.name as district_name, d.code as district_code,
           st.name as state_name
    FROM recommendations r
    LEFT JOIN skills s ON r.skill_id = s.id
    LEFT JOIN districts d ON r.district_id = d.id
    LEFT JOIN states st ON r.state_id = st.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY CASE r.priority 
      WHEN 'critical' THEN 1 WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 ELSE 4 END,
      r.generated_at DESC
    LIMIT 50
  `, params);

  res.json(result.rows.map(r => ({
    id: r.id,
    skillId: r.skill_id,
    skillName: r.skill_name,
    skillType: r.skill_type,
    districtId: r.district_id,
    districtName: r.district_name,
    districtCode: r.district_code,
    stateName: r.state_name,
    priority: r.priority,
    title: r.title,
    description: r.description,
    reasoning: r.reasoning,
    suggestedAction: r.suggested_action,
    demandGrowth: parseFloat(r.demand_growth),
    supplyGrowth: parseFloat(r.supply_growth),
    gapSeverity: parseFloat(r.gap_severity),
    forecastConfidence: parseFloat(r.forecast_confidence),
    generatedAt: r.generated_at,
    dataStatus: 'analytical_recommendation',
  })));
}));
