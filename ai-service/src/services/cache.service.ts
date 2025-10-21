import Redis from 'ioredis';
import { logger } from './logging.service';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const useRedis = process.env.USE_REDIS !== 'false';

let redis: Redis | null = null;

if (useRedis) {
  try {
    redis = new Redis(redisUrl);

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    redis.on('error', (err) => {
      logger.warn('⚠️  Redis error (running without cache):', err.message);
      redis = null;
    });
  } catch (error) {
    logger.warn('⚠️  Redis unavailable, running without cache');
    redis = null;
  }
} else {
  logger.info('ℹ️  Redis disabled (USE_REDIS=false)');
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }
};

export { redis };
