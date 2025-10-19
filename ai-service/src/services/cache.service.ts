/**
 * Cache Service
 * Redis-based caching for AI responses
 */

import Redis from 'ioredis';
import { logger } from './logging.service';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  logger.error('[Cache] Redis error:', err);
});

redis.on('connect', () => {
  logger.info('[Cache] Redis connected');
});

class CacheService {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<any> {
    try {
      const value = await redis.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`[Cache] Failed to get key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`[Cache] Failed to set key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`[Cache] Failed to delete key ${key}:`, error);
    }
  }

  /**
   * Clear all cache with pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(`[Cache] Failed to clear pattern ${pattern}:`, error);
    }
  }
}

export const cacheService = new CacheService();

