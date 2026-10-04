import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getClient } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate() {
  console.log('🔄 Running database migrations...');
  
  const schemaPath = path.resolve(
    __dirname,
    '../../../database/schema.sql'
  );
  
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run directly
if (process.argv[1]?.includes('migrate')) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
