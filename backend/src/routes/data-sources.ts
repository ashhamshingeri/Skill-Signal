import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const dataSourcesRouter = Router();

// GET /api/data-sources
dataSourcesRouter.get('/', asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT * FROM data_sources ORDER BY category, name`
  );

  const stats = await query(`
    SELECT 
      COUNT(*) as total_sources,
      SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as live_sources,
      SUM(CASE WHEN status = 'prototype' THEN 1 ELSE 0 END) as prototype_sources,
      SUM(record_count) as total_records_indexed,
      AVG(data_quality_score) as avg_quality_score
    FROM data_sources
  `);

  res.json({
    dataSources: result.rows.map(ds => ({
      id: ds.id,
      name: ds.name,
      type: ds.type,
      category: ds.category,
      url: ds.url,
      status: ds.status,
      lastUpdated: ds.last_updated,
      recordCount: parseInt(ds.record_count || '0', 10),
      coverageStates: ds.coverage_states,
      coverageDistricts: ds.coverage_districts,
      dataQualityScore: parseFloat(ds.data_quality_score || '0'),
      description: ds.description,
      apiAvailable: ds.api_available,
    })),
    summary: {
      totalSources: parseInt(stats.rows[0].total_sources || '0', 10),
      liveSources: parseInt(stats.rows[0].live_sources || '0', 10),
      prototypeSources: parseInt(stats.rows[0].prototype_sources || '0', 10),
      totalRecordsIndexed: parseInt(stats.rows[0].total_records_indexed || '0', 10),
      avgQualityScore: parseFloat(stats.rows[0].avg_quality_score || '0').toFixed(1),
    }
  });
}));

// POST /api/data-sources/:id/sync (Simulate pipeline sync)
dataSourcesRouter.post('/:id/sync', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ds = await query('SELECT * FROM data_sources WHERE id = $1', [id]);
  if (ds.rows.length === 0) {
    return res.status(404).json({ error: 'Data source not found' });
  }

  // Update last_updated timestamp and increment records
  const updated = await query(
    `UPDATE data_sources 
     SET last_updated = NOW(), 
         record_count = record_count + FLOOR(RANDOM() * 100 + 10)::int
     WHERE id = $1 
     RETURNING *`,
    [id]
  );

  res.json({
    message: `Data pipeline sync completed for ${updated.rows[0].name}`,
    dataSource: updated.rows[0],
  });
}));
