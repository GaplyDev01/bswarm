import { PostgresDB } from '../lib/postgres-db';
import { RedisCache } from '../lib/redis-cache';

/**
 * Script to clear Redis cache and reset the tokens table in PostgreSQL
 */
async function resetCacheAndDB() {
  console.log('🧹 Starting cleanup process...');

  try {
    // Step 1: Clear Redis cache
    console.log('Clearing Redis cache...');
    await RedisCache.flush();
    console.log('✅ Redis cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing Redis cache:', error);
  }

  try {
    // Step 2: Reset tokens table in PostgreSQL
    console.log('Resetting tokens table in PostgreSQL...');

    // Drop the tokens table
    await PostgresDB.resetTokensTable();

    console.log('✅ PostgreSQL tokens table reset successfully');
  } catch (error) {
    console.error('❌ Error resetting PostgreSQL table:', error);
  }

  console.log('🎉 Reset complete!');
  process.exit(0);
}

// Run the reset function
resetCacheAndDB().catch(error => {
  console.error('❌ Unhandled error during reset:', error);
  process.exit(1);
});
