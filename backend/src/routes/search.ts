import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const searchRouter = Router();

// GET /api/search?q=query
searchRouter.get('/', asyncHandler(async (req, res) => {
  const q = ((req.query.q as string) || '').trim();

  if (!q || q.length < 2) {
    return res.json({
      query: q,
      results: {
        skills: [],
        districts: [],
        states: [],
        industries: [],
      }
    });
  }

  const searchPattern = `%${q}%`;

  // Search Skills
  const skillsRes = await query(`
    SELECT s.id, s.name, s.skill_type, s.is_emerging, s.is_green, i.name as industry_name
    FROM skills s
    LEFT JOIN industries i ON s.industry_id = i.id
    WHERE s.name ILIKE $1 OR s.normalized_name ILIKE $1
    LIMIT 6
  `, [searchPattern]);

  // Search Districts
  const districtsRes = await query(`
    SELECT d.id, d.name, d.code, d.coverage_percentage, s.name as state_name
    FROM districts d
    JOIN states s ON d.state_id = s.id
    WHERE d.name ILIKE $1
    LIMIT 6
  `, [searchPattern]);

  // Search States
  const statesRes = await query(`
    SELECT id, name, code, region
    FROM states
    WHERE name ILIKE $1 OR code ILIKE $1
    LIMIT 4
  `, [searchPattern]);

  // Search Industries
  const industriesRes = await query(`
    SELECT id, name, sector, code
    FROM industries
    WHERE name ILIKE $1 OR sector ILIKE $1
    LIMIT 4
  `, [searchPattern]);

  res.json({
    query: q,
    results: {
      skills: skillsRes.rows.map(r => ({
        type: 'skill',
        id: r.id,
        title: r.name,
        subtitle: `${r.industry_name || 'General'} • ${r.skill_type}`,
        url: `/skills?skillId=${r.id}`,
        tags: [r.is_emerging && 'Emerging', r.is_green && 'Green'].filter(Boolean),
      })),
      districts: districtsRes.rows.map(r => ({
        type: 'district',
        id: r.id,
        title: `${r.name} (${r.code})`,
        subtitle: `${r.state_name} • ${r.coverage_percentage}% coverage`,
        url: `/districts?districtId=${r.id}`,
      })),
      states: statesRes.rows.map(r => ({
        type: 'state',
        id: r.id,
        title: r.name,
        subtitle: `${r.region || 'India'} region`,
        url: `/districts?stateCode=${r.code}`,
      })),
      industries: industriesRes.rows.map(r => ({
        type: 'industry',
        id: r.id,
        title: r.name,
        subtitle: r.sector,
        url: `/skills?industry=${encodeURIComponent(r.name)}`,
      })),
    }
  });
}));
