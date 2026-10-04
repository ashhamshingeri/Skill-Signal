import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const statesRouter = Router();

statesRouter.get('/', asyncHandler(async (_req, res) => {
  const result = await query(`
    SELECT s.id, s.name, s.code, s.region, s.population,
           COUNT(DISTINCT d.id) as district_count,
           AVG(d.coverage_percentage) as avg_coverage
    FROM states s
    LEFT JOIN districts d ON s.id = d.state_id
    GROUP BY s.id, s.name, s.code, s.region, s.population
    ORDER BY s.name
  `);

  res.json(result.rows.map(r => ({
    id: r.id,
    name: r.name,
    code: r.code,
    region: r.region,
    population: parseInt(r.population),
    districtCount: parseInt(r.district_count),
    avgCoverage: parseFloat(r.avg_coverage) || 0,
  })));
}));

statesRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query(`
    SELECT s.*, 
           json_agg(json_build_object(
             'id', d.id, 'name', d.name, 'code', d.code,
             'coverage', d.coverage_percentage, 'population', d.population
           )) as districts
    FROM states s
    LEFT JOIN districts d ON s.id = d.state_id
    WHERE s.id = $1
    GROUP BY s.id
  `, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'State not found' });
    return;
  }

  res.json(result.rows[0]);
}));
