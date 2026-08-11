import { Request, Response, NextFunction } from 'express';
import getRedis from '../config/redis';

interface RateLimiterOptions {
  /**
   * Unique key prefix for this limiter (e.g. 'ai_vision', 'ai_chat')
   */
  keyPrefix: string;
  /**
   * Max requests allowed in the window
   */
  maxRequests: number;
  /**
   * Window size in seconds
   */
  windowSeconds: number;
}

/**
 * Redis Token-Bucket rate limiter keyed by user ID.
 * Falls through if Redis is unavailable (non-blocking degradation).
 */
export const redisRateLimiter = (opts: RateLimiterOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(); // unauthenticated – skip

    const key = `rl:${opts.keyPrefix}:${req.user.id}`;
    const redis = getRedis();

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        // First request in the window – set TTL
        await redis.expire(key, opts.windowSeconds);
      }
      if (current > opts.maxRequests) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfterSeconds: ttl,
          limit: opts.maxRequests,
          window: `${opts.windowSeconds}s`,
        });
      }
      // Attach usage info to response headers
      res.setHeader('X-RateLimit-Limit', opts.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.maxRequests - current));
    } catch {
      // Redis down – allow request to proceed
    }

    next();
  };
};

// Pre-configured limiters
export const aiVisionRateLimiter = redisRateLimiter({
  keyPrefix: 'ai_vision',
  maxRequests: 5,
  windowSeconds: 86400, // 5 per day
});

export const aiChatRateLimiter = redisRateLimiter({
  keyPrefix: 'ai_chat',
  maxRequests: 50,
  windowSeconds: 86400, // 50 per day
});
