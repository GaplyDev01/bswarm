// @ts-nocheck
import { NextResponse } from 'next/server';
import { PostgresDB } from '@/lib/postgres-db';
import { logger } from '@/lib/logger';

/**
 * API route to reset the tokens table in PostgreSQL
 * Use this endpoint only in development for testing purposes
 */
export async function POST() {
  try {
    // Reset the tokens table
    await PostgresDB.resetTokensTable();

    return NextResponse.json({
      success: true,
      message: 'Tokens table reset successfully',
    });
  } catch (error) {
    logger.error('Error resetting tokens table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset tokens table' },
      { status: 500 }
    );
  }
}
