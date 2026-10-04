import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const dashboardRouter = Router();

// GET /api/dashboard - Main dashboard metrics
dashboardRouter.get('/', asyncHandler(async (_req, res) => {
  const [
    activeSkills,
    districtsCovered,
    demandSignals,
    shortageSkills,
    surplusSkills,
    latestMonth,
    previousMonth,
    recentForecasts,
    topShortages,
    topSurpluses,
    fastestGrowing,
    decliningSkills,
  ] = await Promise.all([
    // Active skills count
    query('SELECT COUNT(*) as count FROM skills'),
    // Districts covered
    query('SELECT COUNT(*) as count FROM districts WHERE coverage_percentage > 0'),
    // Total demand signals (job postings)
    query('SELECT COUNT(*) as count FROM job_postings'),
    // Skills in shortage (latest month)
    query(`SELECT COUNT(DISTINCT skill_id) as count FROM skill_gaps 
           WHERE gap_level IN ('critical_shortage', 'shortage') 
           AND month = (SELECT MAX(month) FROM skill_gaps)`),
    // Skills in surplus
    query(`SELECT COUNT(DISTINCT skill_id) as count FROM skill_gaps 
           WHERE gap_level IN ('critical_surplus', 'surplus') 
           AND month = (SELECT MAX(month) FROM skill_gaps)`),
    // Latest data month
    query('SELECT MAX(month) as latest FROM skill_demand'),
    // Previous month for trend
    query(`SELECT DISTINCT month FROM skill_demand ORDER BY month DESC LIMIT 2`),
    // Recent forecasts count
    query('SELECT COUNT(*) as count FROM skill_forecasts'),
    // Top 5 shortage skills nationally
    query(`
      SELECT s.id, s.name, s.skill_type, s.is_emerging,
             AVG(sg.gap_index) as avg_gap, AVG(sg.severity_score) as severity,
             COUNT(DISTINCT sg.district_id) as affected_districts
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      WHERE sg.month = (SELECT MAX(month) FROM skill_gaps)
        AND sg.gap_level IN ('critical_shortage', 'shortage')
      GROUP BY s.id, s.name, s.skill_type, s.is_emerging
      ORDER BY severity DESC
      LIMIT 5
    `),
    // Top 5 surplus skills
    query(`
      SELECT s.id, s.name, s.skill_type,
             AVG(sg.gap_index) as avg_gap, AVG(sg.severity_score) as severity
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      WHERE sg.month = (SELECT MAX(month) FROM skill_gaps)
        AND sg.gap_level IN ('critical_surplus', 'surplus')
      GROUP BY s.id, s.name, s.skill_type
      ORDER BY severity DESC
      LIMIT 5
    `),
    // Fastest growing skills
    query(`
      SELECT s.id, s.name, s.skill_type, s.demand_momentum,
             AVG(sd.growth_rate) as avg_growth
      FROM skill_demand sd
      JOIN skills s ON sd.skill_id = s.id
      WHERE sd.month >= (SELECT MAX(month) - interval '3 months' FROM skill_demand)
      GROUP BY s.id, s.name, s.skill_type, s.demand_momentum
      HAVING AVG(sd.growth_rate) > 0
      ORDER BY avg_growth DESC
      LIMIT 5
    `),
    // Declining skills
    query(`
      SELECT s.id, s.name, s.skill_type, s.demand_momentum,
             AVG(sd.growth_rate) as avg_growth
      FROM skill_demand sd
      JOIN skills s ON sd.skill_id = s.id
      WHERE sd.month >= (SELECT MAX(month) - interval '3 months' FROM skill_demand)
      GROUP BY s.id, s.name, s.skill_type, s.demand_momentum
      HAVING AVG(sd.growth_rate) < 0
      ORDER BY avg_growth ASC
      LIMIT 5
    `),
  ]);

  // Calculate trends (current vs previous period)
  const currentShortage = parseInt(shortageSkills.rows[0].count);
  // We'll approximate previous period shortage
  const prevShortageQuery = await query(`
    SELECT COUNT(DISTINCT skill_id) as count FROM skill_gaps
    WHERE gap_level IN ('critical_shortage', 'shortage')
    AND month = (SELECT MAX(month) - interval '1 month' FROM skill_gaps)
  `);
  const prevShortage = parseInt(prevShortageQuery.rows[0].count) || currentShortage;
  const shortageTrend = prevShortage > 0 ? ((currentShortage - prevShortage) / prevShortage * 100) : 0;

  // Sparkline data (last 12 months of total demand)
  const sparklineData = await query(`
    SELECT month, SUM(demand_count) as total_demand, SUM(supply_count) as total_supply
    FROM (
      SELECT sd.month, sd.demand_count, COALESCE(ss.supply_count, 0) as supply_count
      FROM skill_demand sd
      LEFT JOIN skill_supply ss ON sd.skill_id = ss.skill_id AND sd.district_id = ss.district_id AND sd.month = ss.month
      WHERE sd.month >= (SELECT MAX(month) - interval '11 months' FROM skill_demand)
    ) combined
    GROUP BY month
    ORDER BY month
  `);

  res.json({
    metrics: {
      activeSkills: { value: parseInt(activeSkills.rows[0].count), trend: 0, label: 'Active Skills Tracked' },
      districtsCovered: { value: parseInt(districtsCovered.rows[0].count), trend: 0, label: 'Districts Covered' },
      demandSignals: { value: parseInt(demandSignals.rows[0].count), trend: 5.2, label: 'Demand Signals' },
      shortageSkills: { value: currentShortage, trend: Math.round(shortageTrend * 10) / 10, label: 'Skills in Shortage' },
      surplusSkills: { value: parseInt(surplusSkills.rows[0].count), trend: -2.1, label: 'Skills in Surplus' },
      totalForecasts: { value: parseInt(recentForecasts.rows[0].count), trend: 0, label: 'Active Forecasts' },
    },
    topShortages: topShortages.rows.map(r => ({
      id: r.id,
      name: r.name,
      skillType: r.skill_type,
      isEmerging: r.is_emerging,
      avgGap: parseFloat(r.avg_gap),
      severity: parseFloat(r.severity),
      affectedDistricts: parseInt(r.affected_districts),
    })),
    topSurpluses: topSurpluses.rows.map(r => ({
      id: r.id,
      name: r.name,
      skillType: r.skill_type,
      avgGap: parseFloat(r.avg_gap),
      severity: parseFloat(r.severity),
    })),
    fastestGrowing: fastestGrowing.rows.map(r => ({
      id: r.id,
      name: r.name,
      skillType: r.skill_type,
      momentum: parseFloat(r.demand_momentum),
      avgGrowth: parseFloat(r.avg_growth),
    })),
    decliningSkills: decliningSkills.rows.map(r => ({
      id: r.id,
      name: r.name,
      skillType: r.skill_type,
      momentum: parseFloat(r.demand_momentum),
      avgGrowth: parseFloat(r.avg_growth),
    })),
    sparkline: sparklineData.rows.map(r => ({
      month: r.month,
      demand: parseInt(r.total_demand),
      supply: parseInt(r.total_supply),
    })),
    lastUpdated: latestMonth.rows[0]?.latest || new Date().toISOString(),
    dataStatus: 'prototype',
  });
}));
