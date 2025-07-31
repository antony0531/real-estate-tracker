import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | undefined;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    // Don't throw - Redis is optional for basic functionality
  }
};

// Cache helpers
export const cache = {
  // Get cached value
  get: async (key: string): Promise<any> => {
    try {
      if (!redisClient || !redisClient.isOpen) return null;
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },

  // Set cached value with expiration
  set: async (key: string, value: any, expirationInSeconds = 3600): Promise<void> => {
    try {
      if (!redisClient || !redisClient.isOpen) return;
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  },

  // Delete cached value
  del: async (key: string): Promise<void> => {
    try {
      if (!redisClient || !redisClient.isOpen) return;
      await redisClient.del(key);
    } catch (error) {
      logger.error('Redis delete error:', error);
    }
  },

  // Clear cache by pattern
  clearPattern: async (pattern: string): Promise<void> => {
    try {
      if (!redisClient || !redisClient.isOpen) return;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Redis clear pattern error:', error);
    }
  }
};

export default redisClient!;