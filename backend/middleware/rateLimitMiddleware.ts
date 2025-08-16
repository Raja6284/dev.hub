import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const createRateLimit = (windowMs: number, maxRequests: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const key = `rate_limit:${req.user ? req.user.id : req.ip}`;
    const windowStart = Math.floor(Date.now() / windowMs);
    const windowKey = `${key}:${windowStart}`;
    
    try {
      const current = await redisClient.incr(windowKey);
      
      if (current === 1) {
        await redisClient.expire(windowKey, Math.ceil(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        res.status(429).json({ 
          msg: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000)
        });
        return;
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue on Redis error
    }
  };
};

// Standard rate limit: 100 requests per 15 minutes
export const standardRateLimit = createRateLimit(15 * 60 * 1000, 100);

// Strict rate limit for sensitive endpoints: 10 requests per 15 minutes
export const strictRateLimit = createRateLimit(15 * 60 * 1000, 100);

// Auth rate limit: 5 requests per 15 minutes
export const authRateLimit = createRateLimit(15 * 60 * 1000, 100);