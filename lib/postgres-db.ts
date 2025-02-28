import { sql } from '@vercel/postgres';
import { db } from '@vercel/postgres';
import { logger } from '@/lib/logger';

/**
 * Postgres database client for TradesXBT
 */
export class PostgresDB {
  /**
   * Initialize database schema if it doesn't exist
   */
  static async initSchema(): Promise<void> {
    try {
      // Create token data table
      await sql`
        CREATE TABLE IF NOT EXISTS tokens (
          id VARCHAR(255) PRIMARY KEY,
          symbol VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create user preferences table
      await sql`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id VARCHAR(255) PRIMARY KEY,
          ai_provider VARCHAR(50),
          ai_model VARCHAR(50),
          settings JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create token price history table
      await sql`
        CREATE TABLE IF NOT EXISTS token_price_history (
          id SERIAL PRIMARY KEY,
          token_id VARCHAR(255) NOT NULL,
          price NUMERIC NOT NULL,
          market_cap NUMERIC,
          volume NUMERIC,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_token
            FOREIGN KEY(token_id)
            REFERENCES tokens(id)
            ON DELETE CASCADE
        )
      `;

      // Create user chat history table
      await sql`
        CREATE TABLE IF NOT EXISTS chat_history (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          token_id VARCHAR(255) NOT NULL,
          messages JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_token_chat
            FOREIGN KEY(token_id)
            REFERENCES tokens(id)
            ON DELETE CASCADE
        )
      `;

      logger.log('Database schema initialized');
    } catch (error) {
      logger.error('Error initializing database schema:', error);
    }
  }

  /**
   * Store or update token data
   */
  static async upsertToken(id: string, symbol: string, name: string, data: Record<string, unknown>): Promise<void> {
    try {
      await sql`
        INSERT INTO tokens (id, symbol, name, data, updated_at)
        VALUES (${id}, ${symbol}, ${name}, ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id)
        DO UPDATE SET
          symbol = ${symbol},
          name = ${name},
          data = ${JSON.stringify(data)},
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      logger.error('Error upserting token:', error);
    }
  }

  /**
   * Get token data by ID
   */
  static async getTokenById(id: string): Promise<any | null> {
    try {
      const result = await sql`SELECT * FROM tokens WHERE id = ${id}`;
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error getting token by ID:', error);
      return null;
    }
  }

  /**
   * Search tokens by name or symbol
   */
  static async searchTokens(query: string, limit: number = 10): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM tokens
        WHERE 
          symbol ILIKE ${`%${query}%`} OR
          name ILIKE ${`%${query}%`}
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;
      return result.rows;
    } catch (error) {
      logger.error('Error searching tokens:', error);
      return [];
    }
  }

  /**
   * Get trending tokens based on recent updates and views
   */
  static async getTrendingTokens(limit: number = 10): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT t.* FROM tokens t
        ORDER BY t.updated_at DESC
        LIMIT ${limit}
      `;
      return result.rows;
    } catch (error) {
      logger.error('Error getting trending tokens:', error);
      return [];
    }
  }

  /**
   * Add token price history entry
   */
  static async addTokenPriceHistory(
    tokenId: string,
    price: number,
    marketCap?: number,
    volume?: number
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO token_price_history (token_id, price, market_cap, volume)
        VALUES (${tokenId}, ${price}, ${marketCap || null}, ${volume || null})
      `;
    } catch (error) {
      logger.error('Error adding token price history:', error);
    }
  }

  /**
   * Get token price history
   */
  static async getTokenPriceHistory(tokenId: string, days: number = 7): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM token_price_history
        WHERE 
          token_id = ${tokenId} AND
          timestamp > NOW() - INTERVAL '${days} days'
        ORDER BY timestamp ASC
      `;
      return result.rows;
    } catch (error) {
      logger.error('Error getting token price history:', error);
      return [];
    }
  }

  /**
   * Set user preferences
   */
  static async setUserPreferences(
    userId: string,
    aiProvider?: string,
    aiModel?: string,
    // TODO: Replace 'any' with a more specific type
    settings?: unknown
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO user_preferences (user_id, ai_provider, ai_model, settings, updated_at)
        VALUES (${userId}, ${aiProvider || null}, ${aiModel || null}, ${settings ? JSON.stringify(settings) : null}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET
          ai_provider = COALESCE(${aiProvider}, user_preferences.ai_provider),
          ai_model = COALESCE(${aiModel}, user_preferences.ai_model),
          settings = COALESCE(${settings ? JSON.stringify(settings) : null}, user_preferences.settings),
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      logger.error('Error setting user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<any | null> {
    try {
      const result = await sql`SELECT * FROM user_preferences WHERE user_id = ${userId}`;
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Save chat history
   */
  static async saveChatHistory(userId: string, tokenId: string, messages: Event[]): Promise<void> {
    try {
      // Check if entry exists
      const existing = await sql`
        SELECT id FROM chat_history 
        WHERE user_id = ${userId} AND token_id = ${tokenId}
      `;

      if (existing.rows.length > 0) {
        // Update existing entry
        await sql`
          UPDATE chat_history
          SET 
            messages = ${JSON.stringify(messages)},
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId} AND token_id = ${tokenId}
        `;
      } else {
        // Create new entry
        await sql`
          INSERT INTO chat_history (user_id, token_id, messages)
          VALUES (${userId}, ${tokenId}, ${JSON.stringify(messages)})
        `;
      }
    } catch (error) {
      logger.error('Error saving chat history:', error);
    }
  }

  /**
   * Get chat history
   */
  static async getChatHistory(userId: string, tokenId: string): Promise<any | null> {
    try {
      const result = await sql`
        SELECT messages FROM chat_history
        WHERE user_id = ${userId} AND token_id = ${tokenId}
      `;
      return result.rows.length > 0 ? result.rows[0].messages : null;
    } catch (error) {
      logger.error('Error getting chat history:', error);
      return null;
    }
  }

  /**
   * Truncate and reset the tokens table
   */
  static async resetTokensTable(): Promise<void> {
    try {
      // Use TRUNCATE instead of DROP to maintain the table structure and foreign keys
      await sql`TRUNCATE TABLE tokens CASCADE`;
      logger.log('Tokens table truncated successfully');

      return;
    } catch (error) {
      logger.error('Error truncating tokens table:', error);

      // Alternative approach if truncate fails - try to clear table contents
      try {
        await sql`DELETE FROM tokens`;
        logger.log('All records deleted from tokens table');
        return;
      } catch (deleteError) {
        logger.error('Error deleting token records:', deleteError);
        throw error;
      }
    }
  }

  // AI Trading Methods

  /**
   * Save trading authority for a user
   */
  static async saveTradingAuthority(
    userId: string,
    authority: {
      publicKey: string;
      privateKeyEncrypted: string;
      permissionLevel: 'limited' | 'full';
      createdAt: Date;
    }
  ): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS trading_authorities (
          user_id VARCHAR(255) PRIMARY KEY,
          public_key VARCHAR(255) NOT NULL,
          private_key_encrypted TEXT NOT NULL,
          permission_level VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `;

      await sql`
        INSERT INTO trading_authorities (user_id, public_key, private_key_encrypted, permission_level, created_at)
        VALUES (${userId}, ${authority.publicKey}, ${authority.privateKeyEncrypted}, ${authority.permissionLevel}, ${authority.createdAt.toISOString()})
        ON CONFLICT (user_id)
        DO UPDATE SET
          public_key = ${authority.publicKey},
          private_key_encrypted = ${authority.privateKeyEncrypted},
          permission_level = ${authority.permissionLevel},
          created_at = ${authority.createdAt.toISOString()}
      `;
    } catch (error) {
      logger.error('Error saving trading authority:', error);
      throw error;
    }
  }

  /**
   * Get trading authority for a user
   */
  static async getTradingAuthority(userId: string): Promise<any | null> {
    try {
      const result = await sql`
        SELECT * FROM trading_authorities WHERE user_id = ${userId}
      `;

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error getting trading authority:', error);
      return null;
    }
  }

  /**
   * Get all trading authorities
   */
  static async getAllTradingAuthorities(): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM trading_authorities
      `;

      return result.rows;
    } catch (error) {
      logger.error('Error getting all trading authorities:', error);
      return [];
    }
  }

  /**
   * Save trading result
   */
  static async saveTradeResult(userId: string, tradeResult: Response): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS trade_history (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          tx_signature VARCHAR(255),
          input_token VARCHAR(50) NOT NULL,
          output_token VARCHAR(50) NOT NULL,
          input_amount NUMERIC NOT NULL,
          output_amount NUMERIC,
          executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
          slippage NUMERIC,
          success BOOLEAN NOT NULL,
          error TEXT
        )
      `;

      await sql`
        INSERT INTO trade_history (
          user_id, tx_signature, input_token, output_token, 
          input_amount, output_amount, executed_at, slippage, success, error
        )
        VALUES (
          ${userId}, 
          ${tradeResult.txSignature || null}, 
          ${tradeResult.inputToken || ''}, 
          ${tradeResult.outputToken || ''}, 
          ${tradeResult.inputAmount || 0}, 
          ${tradeResult.outputAmount || null}, 
          ${tradeResult.executedAt ? new Date(tradeResult.executedAt).toISOString() : new Date().toISOString()}, 
          ${tradeResult.slippage || null}, 
          ${tradeResult.success}, 
          ${tradeResult.error || null}
        )
      `;
    } catch (error) {
      logger.error('Error saving trade result:', error);
    }
  }

  /**
   * Get trade history for a user
   */
  static async getTradeHistory(userId: string): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM trade_history
        WHERE user_id = ${userId}
        ORDER BY executed_at DESC
      `;

      return result.rows;
    } catch (error) {
      logger.error('Error getting trade history:', error);
      return [];
    }
  }

  /**
   * Save user strategy
   */
  static async saveUserStrategy(userId: string, strategy: Event): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_strategies (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          strategy_id VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          risk_override VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          last_run_at TIMESTAMP WITH TIME ZONE,
          performance_pnl NUMERIC,
          performance_percentage NUMERIC
        )
      `;

      await sql`
        INSERT INTO user_strategies (
          id, user_id, strategy_id, status, risk_override,
          created_at, last_run_at, performance_pnl, performance_percentage
        )
        VALUES (
          ${strategy.id},
          ${userId},
          ${strategy.strategyId},
          ${strategy.status},
          ${strategy.riskOverride || null},
          ${strategy.createdAt},
          ${strategy.lastRunAt || null},
          ${strategy.performancePnL || null},
          ${strategy.performancePercentage || null}
        )
        ON CONFLICT (id)
        DO UPDATE SET
          status = ${strategy.status},
          risk_override = ${strategy.riskOverride || null},
          last_run_at = ${strategy.lastRunAt || null},
          performance_pnl = ${strategy.performancePnL || null},
          performance_percentage = ${strategy.performancePercentage || null}
      `;
    } catch (error) {
      logger.error('Error saving user strategy:', error);
      throw error;
    }
  }

  /**
   * Get user strategies
   */
  static async getUserStrategies(userId: string): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM user_strategies
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;

      return result.rows;
    } catch (error) {
      logger.error('Error getting user strategies:', error);
      return [];
    }
  }

  /**
   * Get user strategy by ID
   */
  static async getUserStrategyById(userId: string, strategyId: string): Promise<any | null> {
    try {
      const result = await sql`
        SELECT * FROM user_strategies
        WHERE id = ${strategyId} AND user_id = ${userId}
      `;

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error getting user strategy by ID:', error);
      return null;
    }
  }

  /**
   * Update user strategy
   */
  static async updateUserStrategy(strategy: Event): Promise<void> {
    try {
      await sql`
        UPDATE user_strategies
        SET
          status = ${strategy.status},
          risk_override = ${strategy.riskOverride || null},
          last_run_at = ${strategy.lastRunAt || null},
          performance_pnl = ${strategy.performancePnL || null},
          performance_percentage = ${strategy.performancePercentage || null}
        WHERE id = ${strategy.id}
      `;
    } catch (error) {
      logger.error('Error updating user strategy:', error);
      throw error;
    }
  }

  /**
   * Save strategy position
   */
  static async saveStrategyPosition(position: unknown): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS strategy_positions (
          id VARCHAR(255) PRIMARY KEY,
          user_strategy_id VARCHAR(255) NOT NULL,
          input_token VARCHAR(50) NOT NULL,
          output_token VARCHAR(50) NOT NULL,
          input_amount NUMERIC NOT NULL,
          output_amount NUMERIC NOT NULL,
          entry_price NUMERIC NOT NULL,
          current_price NUMERIC,
          exit_price NUMERIC,
          status VARCHAR(50) NOT NULL,
          unrealized_pnl NUMERIC,
          unrealized_pnl_percentage NUMERIC,
          realized_pnl NUMERIC,
          realized_pnl_percentage NUMERIC,
          opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
          closed_at TIMESTAMP WITH TIME ZONE,
          tx_id_open VARCHAR(255),
          tx_id_close VARCHAR(255)
        )
      `;

      await sql`
        INSERT INTO strategy_positions (
          id, user_strategy_id, input_token, output_token, input_amount,
          output_amount, entry_price, current_price, exit_price, status,
          unrealized_pnl, unrealized_pnl_percentage, realized_pnl, realized_pnl_percentage,
          opened_at, closed_at, tx_id_open, tx_id_close
        )
        VALUES (
          ${position.id},
          ${position.userStrategyId},
          ${position.inputToken},
          ${position.outputToken},
          ${position.inputAmount},
          ${position.outputAmount},
          ${position.entryPrice},
          ${position.currentPrice || null},
          ${position.exitPrice || null},
          ${position.status},
          ${position.unrealizedPnL || null},
          ${position.unrealizedPnLPercentage || null},
          ${position.realizedPnL || null},
          ${position.realizedPnLPercentage || null},
          ${position.openedAt},
          ${position.closedAt || null},
          ${position.txIdOpen || null},
          ${position.txIdClose || null}
        )
        ON CONFLICT (id)
        DO UPDATE SET
          current_price = ${position.currentPrice || null},
          exit_price = ${position.exitPrice || null},
          status = ${position.status},
          unrealized_pnl = ${position.unrealizedPnL || null},
          unrealized_pnl_percentage = ${position.unrealizedPnLPercentage || null},
          realized_pnl = ${position.realizedPnL || null},
          realized_pnl_percentage = ${position.realizedPnLPercentage || null},
          closed_at = ${position.closedAt || null},
          tx_id_close = ${position.txIdClose || null}
      `;
    } catch (error) {
      logger.error('Error saving strategy position:', error);
      throw error;
    }
  }

  /**
   * Get strategy positions
   */
  static async getStrategyPositions(userStrategyId: string): Promise<unknown[]> {
    try {
      const result = await sql`
        SELECT * FROM strategy_positions
        WHERE user_strategy_id = ${userStrategyId}
        ORDER BY opened_at DESC
      `;

      return result.rows;
    } catch (error) {
      logger.error('Error getting strategy positions:', error);
      return [];
    }
  }

  /**
   * Get position by ID
   */
  static async getPositionById(positionId: string): Promise<any | null> {
    try {
      const result = await sql`
        SELECT * FROM strategy_positions
        WHERE id = ${positionId}
      `;

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      logger.error('Error getting position by ID:', error);
      return null;
    }
  }

  /**
   * Update strategy position
   */
  static async updateStrategyPosition(position: unknown): Promise<void> {
    try {
      await sql`
        UPDATE strategy_positions
        SET
          current_price = ${position.currentPrice || null},
          exit_price = ${position.exitPrice || null},
          status = ${position.status},
          unrealized_pnl = ${position.unrealizedPnL || null},
          unrealized_pnl_percentage = ${position.unrealizedPnLPercentage || null},
          realized_pnl = ${position.realizedPnL || null},
          realized_pnl_percentage = ${position.realizedPnLPercentage || null},
          closed_at = ${position.closedAt || null},
          tx_id_close = ${position.txIdClose || null}
        WHERE id = ${position.id}
      `;
    } catch (error) {
      logger.error('Error updating strategy position:', error);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await sql`SELECT 1 as healthy`;
      return result.rows.length > 0 && result.rows[0].healthy === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Initialize database schema on module load
PostgresDB.initSchema().catch(logger.error);
