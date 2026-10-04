import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const coverageRouter = Router();

// GET /api/coverage/summary
coverageRouter.get('/summary', asyncHandler(async (_req, res) => {
  const stateCoverageResult = await query(`
    SELECT 
      s.id as state_id,
      s.name as state_name,
      s.code as state_code,
      s.region,
      COUNT(d.id) as total_districts,
      ROUND(AVG(d.coverage_percentage), 1) as avg_coverage,
      ROUND(AVG(d.data_quality_score), 1) as avg_data_quality,
      SUM(CASE WHEN d.coverage_percentage >= 75 THEN 1 ELSE 0 END) as high_coverage_count,
      SUM(CASE WHEN d.coverage_percentage >= 40 AND d.coverage_percentage < 75 THEN 1 ELSE 0 END) as medium_coverage_count,
      SUM(CASE WHEN d.coverage_percentage < 40 THEN 1 ELSE 0 END) as low_coverage_count
    FROM states s
    LEFT JOIN districts d ON s.id = d.state_id
    GROUP BY s.id, s.name, s.code, s.region
    ORDER BY avg_coverage DESC
  `);

  const nationalSummary = await query(`
    SELECT 
      COUNT(DISTINCT s.id) as covered_states,
      COUNT(DISTINCT d.id) as covered_districts,
      ROUND(AVG(d.coverage_percentage), 1) as national_avg_coverage,
      ROUND(AVG(d.data_quality_score), 1) as national_avg_quality,
      COUNT(DISTINCT tc.id) as active_training_centres,
      COUNT(DISTINCT jp.id) as indexed_job_postings
    FROM states s
    JOIN districts d ON s.id = d.state_id
    LEFT JOIN training_centres tc ON d.id = tc.district_id
    LEFT JOIN job_postings jp ON d.id = jp.district_id
  `);

  res.json({
    national: nationalSummary.rows[0],
    states: stateCoverageResult.rows.map(row => ({
      stateId: row.state_id,
      stateName: row.state_name,
      stateCode: row.state_code,
      region: row.region,
      totalDistricts: parseInt(row.total_districts, 10),
      avgCoverage: parseFloat(row.avg_coverage || '0'),
      avgDataQuality: parseFloat(row.avg_data_quality || '0'),
      highCoverageCount: parseInt(row.high_coverage_count, 10),
      mediumCoverageCount: parseInt(row.medium_coverage_count, 10),
      lowCoverageCount: parseInt(row.low_coverage_count, 10),
    }))
  });
}));

// GET /api/coverage/districts
coverageRouter.get('/districts', asyncHandler(async (req, res) => {
  const { stateId, minCoverage, maxCoverage } = req.query;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (stateId) {
    conditions.push(`d.state_id = $${paramIdx++}`);
    params.push(stateId);
  }

  if (minCoverage) {
    conditions.push(`d.coverage_percentage >= $${paramIdx++}`);
    params.push(parseFloat(minCoverage as string));
  }

  if (maxCoverage) {
    conditions.push(`d.coverage_percentage <= $${paramIdx++}`);
    params.push(parseFloat(maxCoverage as string));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(`
    SELECT 
      d.id,
      d.name,
      d.code,
      d.coverage_percentage,
      d.data_quality_score,
      d.urban_percentage,
      d.population,
      s.name as state_name,
      COUNT(DISTINCT tc.id) as training_centres_count,
      COUNT(DISTINCT jp.id) as active_jobs_count
    FROM districts d
    JOIN states s ON d.state_id = s.id
    LEFT JOIN training_centres tc ON d.id = tc.district_id
    LEFT JOIN job_postings jp ON d.id = jp.district_id
    ${whereClause}
    GROUP BY d.id, d.name, d.code, d.coverage_percentage, d.data_quality_score, d.urban_percentage, d.population, s.name
    ORDER BY d.coverage_percentage ASC
  `, params);

  res.json({
    districts: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      stateName: row.state_name,
      coveragePercentage: parseFloat(row.coverage_percentage || '0'),
      dataQualityScore: parseFloat(row.data_quality_score || '0'),
      urbanPercentage: parseFloat(row.urban_percentage || '0'),
      population: parseInt(row.population || '0', 10),
      trainingCentresCount: parseInt(row.training_centres_count, 10),
      activeJobsCount: parseInt(row.active_jobs_count, 10),
    }))
  });
}));
