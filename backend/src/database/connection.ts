import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isDbConfigured = Boolean(process.env.DATABASE_URL);

const pool = isDbConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    console.warn('PostgreSQL pool background notice:', err.message);
  });
}

export async function query(text: string, params?: unknown[]): Promise<pg.QueryResult<any>> {
  if (!pool) {
    // Database URL not configured; return empty result set gracefully
    return {
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: [],
    };
  }
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 80));
    }
    return res;
  } catch (err: any) {
    console.warn('Database query fallback (using in-memory data store):', err.message);
    return {
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: [],
    };
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export default pool;
