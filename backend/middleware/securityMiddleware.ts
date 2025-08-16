import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

export const checkBlocked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockedKey = `blocked_ip:${req.ip}`;
    const isBlocked = await redisClient.get(blockedKey);
    
    if (isBlocked) {
      res.status(403).json({ 
        msg: 'IP blocked due to suspicious activity',
        blockedUntil: new Date(Date.now() + 3600000).toISOString() // 1 hour
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    next(); // Continue on Redis error
  }
};

export const detectSuspiciousActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suspiciousKey = `suspicious:${req.ip}`;
    
    // Check for rapid requests (more than 50 in 1 minute)
    const rapidRequestsKey = `rapid:${req.ip}`;
    const rapidCount = await redisClient.incr(rapidRequestsKey);
    
    if (rapidCount === 1) {
      await redisClient.expire(rapidRequestsKey, 60);
    }
    
    if (rapidCount > 50) {
      await redisClient.setEx(`blocked_ip:${req.ip}`, 3600, '1'); // Block for 1 hour
      res.status(429).json({ msg: 'Too many rapid requests - IP blocked' });
      return;
    }
    
    // Track suspicious patterns
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent || userAgent.length < 10) {
      const suspiciousCount = await redisClient.incr(suspiciousKey);
      if (suspiciousCount === 1) {
        await redisClient.expire(suspiciousKey, 300); // 5 minutes
      }
      
      if (suspiciousCount > 10) {
        await redisClient.setEx(`blocked_ip:${req.ip}`, 1800, '1'); // Block for 30 minutes
        res.status(403).json({ msg: 'Suspicious activity detected - IP blocked' });
        return;
      }
    }
    
    next();
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    next();
  }
};