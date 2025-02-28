// Import dependencies
const { kv } = require('@vercel/kv');
const { sql } = require('@vercel/postgres');

/**
 * Script to clear Redis cache and reset the tokens table in PostgreSQL
 */
async function resetCacheAndDB() {
  try {
    // Clear Redis cache
    console.log('Clearing Redis cache...');
    await kv.flushall();
    console.log('✅ Redis cache cleared successfully');

    // Drop and recreate tokens table
    console.log('Resetting tokens table in PostgreSQL...');
    await sql`DROP TABLE IF EXISTS tokens`;

    await sql`
      CREATE TABLE IF NOT EXISTS tokens (
        id VARCHAR(255) PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ PostgreSQL tokens table reset successfully');

    console.log('🎉 Cache and database reset complete');
  } catch (error) {
    console.error('Error during reset:', error);
  } finally {
    process.exit();
  }
}

// Run the reset
resetCacheAndDB();
