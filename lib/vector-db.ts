// @ts-nocheck
import { logger } from '@/lib/logger';
// We'll use Upstash Vector for vector embeddings
const VECTOR_API_URL = process.env.UPSTASH_VECTOR_REST_URL || '';
const VECTOR_API_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN || '';

// Simple client for Upstash Vector
class UpstashVectorClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  async upsert(index: string, id: string, embedding: number[], metadata: Record<string, unknown> = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/indexes/${index}/points`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: [
            {
              id,
              vector: embedding,
              metadata,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Upstash Vector API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error upserting vector:', error);
      throw error;
    }
  }

  // TODO: Replace 'any' with a more specific type
  // TODO: Replace 'any' with a more specific type
  async query(index: string, embedding: number[], topK: number = 5, filters?: unknown) {
    try {
      const queryBody: unknown = {
        vector: embedding,
        topK,
      };

      if (filters) {
// @ts-ignore
        queryBody.filter = filters;
      }

      const response = await fetch(`${this.baseUrl}/indexes/${index}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryBody),
      });

      if (!response.ok) {
        throw new Error(`Upstash Vector API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error querying vectors:', error);
      throw error;
    }
  }

  async createIndex(index: string, dimensions: number) {
    try {
      const response = await fetch(`${this.baseUrl}/indexes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: index,
          dimensions,
        }),
      });

      if (!response.ok) {
        // If it's a 409 (conflict), the index already exists, which is fine
        if (response.status !== 409) {
          throw new Error(`Upstash Vector API error: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      logger.error('Error creating index:', error);
      // Just log and continue if there's an error, since this is just initialization
    }
  }
}

const vectorClient = new UpstashVectorClient(VECTOR_API_URL, VECTOR_API_TOKEN);

// Initialize indexes
async function initVectorDB() {
  try {
    // Create indexes if they don't exist yet
    await vectorClient.createIndex('token_embeddings', 1536);
    await vectorClient.createIndex('chat_embeddings', 1536);
    logger.log('Vector DB indexes initialized');
  } catch (error) {
    logger.error('Error initializing vector database:', error);
  }
}

// Initialize on module load
initVectorDB();

/**
 * Vector database client for TradesXBT using Supabase + pgvector
 */
export class VectorDB {
  /**
   * Stores a token embedding for semantic search
   */
  static async storeTokenEmbedding(
    tokenId: string,
    symbol: string,
    name: string,
    description: string,
    embedding: number[]
  ): Promise<void> {
    try {
      // Store token embedding in Upstash Vector
      await vectorClient.upsert('token_embeddings', tokenId, embedding, {
        symbol,
        name,
        description,
      });
    } catch (error) {
      logger.error('Error in storeTokenEmbedding:', error);
    }
  }

  /**
   * Search tokens by semantic similarity
   */
  static async searchTokensBySimilarity(
    queryEmbedding: number[],
    matchThreshold: number = 0.7,
    maxResults: number = 10
  ): Promise<unknown[]> {
    try {
      // Perform similarity search in Upstash Vector
      const response = await vectorClient.query('token_embeddings', queryEmbedding, maxResults);

      // Filter results by score threshold and format the response
      return (response.points || [])
        .filter(
          (point: {
            score: number;
            id: string;
            metadata: { symbol: string; name: string; description: string };
          }) => point.score >= matchThreshold
        )
        .map(
          (point: {
            id: string;
            score: number;
            metadata: { symbol: string; name: string; description: string };
          }) => ({
            id: point.id,
            score: point.score,
            ...point.metadata,
          })
        );
    } catch (error) {
      logger.error('Error in searchTokensBySimilarity:', error);
      return [];
    }
  }

  /**
   * Stores a chat message embedding for retrieval
   */
  static async storeChatMessageEmbedding(
    userId: string,
    tokenId: string,
    messageId: string,
    message: string,
    embedding: number[]
  ): Promise<void> {
    try {
      // Store chat message embedding in Upstash Vector
      await vectorClient.upsert('chat_embeddings', messageId, embedding, {
        user_id: userId,
        token_id: tokenId,
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in storeChatMessageEmbedding:', error);
    }
  }

  /**
   * Search chat messages by semantic similarity
   */
  static async searchChatMessagesBySimilarity(
    userId: string,
    tokenId: string,
    queryEmbedding: number[],
    matchThreshold: number = 0.7,
    maxResults: number = 5
  ): Promise<unknown[]> {
    try {
      // Perform similarity search in Upstash Vector with filters
      const response = await vectorClient.query('chat_embeddings', queryEmbedding, maxResults, {
        user_id: userId,
        token_id: tokenId,
      });

      // Filter results by score threshold and format the response
      return (response.points || [])
        .filter(
          (point: {
            score: number;
            id: string;
            metadata: { message: string; user_id: string; token_id: string; timestamp: string };
          }) => point.score >= matchThreshold
        )
        .map(
          (point: {
            score: number;
            id: string;
            metadata: { message: string; user_id: string; token_id: string; timestamp: string };
          }) => ({
            id: point.id,
            score: point.score,
            message: point.metadata.message,
            user_id: point.metadata.user_id,
            token_id: point.metadata.token_id,
            timestamp: point.metadata.timestamp,
          })
        );
    } catch (error) {
      logger.error('Error in searchChatMessagesBySimilarity:', error);
      return [];
    }
  }

  /**
   * Search past chat messages by semantic similarity
   */
  static async searchPastChatMessages(
    userId: string,
    query: string,
    limit: number = 5,
    matchThreshold: number = 0.6
  ): Promise<
    {
      id: string;
      score: number;
      message: string;
      user_id: string;
      token_id: string;
      timestamp: string;
    }[]
  > {
    // Generate embeddings for the search query
    const queryEmbedding = await createEmbedding(query);

    // Set up the search parameters
    const searchParams = {
      namespace: `chat:${userId}`,
      vector: queryEmbedding,
      limit: limit,
      include_metadata: true,
    };

    // Execute the vector search
    logger.log(`Searching past chat messages for user ${userId}`);
    const response = await vectorClient.query('chat_embeddings', queryEmbedding, limit, {
      user_id: userId,
    });

    // Filter results by score threshold and format the response
    return (response.points || [])
      .filter(
        (point: {
          score: number;
          id: string;
          metadata: { message: string; user_id: string; token_id: string; timestamp: string };
        }) => point.score >= matchThreshold
      )
      .map(
        (point: {
          id: string;
          score: number;
          metadata: { message: string; user_id: string; token_id: string; timestamp: string };
        }) => ({
          id: point.id,
          score: point.score,
          message: point.metadata.message,
          user_id: point.metadata.user_id,
          token_id: point.metadata.token_id,
          timestamp: point.metadata.timestamp,
        })
      );
  }
}

// Create embeddings using OpenAI or Cohere
export async function createEmbedding(text: string): Promise<number[]> {
  // Function to generate mock embeddings as a last resort
  const createMockEmbedding = (dimension: number = 1536) => {
    logger.warn('Using mock embeddings - this should not happen in production');
    return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
  };

  // Try OpenAI embeddings first
  async function tryOpenAIEmbedding(): Promise<number[] | null> {
    try {
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!openaiKey) {
        logger.warn('No OpenAI API key found');
        return null;
      }

      // Try with exponential backoff - 3 attempts
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              input: text,
              model: 'text-embedding-3-small', // Fallback to text-embedding-ada-002 if needed
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // If it's a model error, try the fallback model
            if (response.status === 404 && attempts === 0) {
              logger.warn('Embedding model not found, trying fallback model');
              const fallbackResponse = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                  input: text,
                  model: 'text-embedding-ada-002',
                }),
              });

              if (fallbackResponse.ok) {
                const result = await fallbackResponse.json();
                return result.data[0].embedding;
              }
            }

            throw new Error(
              `OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`
            );
          }

          const result = await response.json();
          return result.data[0].embedding;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            logger.error('OpenAI embedding failed after retries:', error);
            return null;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
        }
      }

      return null;
    } catch (error) {
      logger.error('OpenAI embedding error:', error);
      return null;
    }
  }

  // Try Cohere embeddings as fallback
  async function tryCohereEmbedding(): Promise<number[] | null> {
    try {
      const cohereKey = process.env.COHERE_API_KEY;

      if (!cohereKey || cohereKey.startsWith('xxxxx')) {
        logger.warn('No valid Cohere API key found');
        return null;
      }

      const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cohereKey}`,
        },
        body: JSON.stringify({
          texts: [text],
          model: 'embed-english-v3.0',
          truncate: 'END',
        }),
      });

      if (!response.ok) {
        throw new Error(`Cohere API error: ${response.status}`);
      }

      const result = await response.json();
      return result.embeddings[0];
    } catch (error) {
      logger.error('Cohere embedding error:', error);
      return null;
    }
  }

  // Try embeddings in sequence with fallbacks
  try {
    // First try OpenAI
    const openAIEmbedding = await tryOpenAIEmbedding();
    if (openAIEmbedding) return openAIEmbedding;

    // Then try Cohere
    const cohereEmbedding = await tryCohereEmbedding();
    if (cohereEmbedding) return cohereEmbedding;

    // Last resort: mock embedding
    return createMockEmbedding();
  } catch (error) {
    logger.error('All embedding methods failed:', error);
    return createMockEmbedding();
  }
}
