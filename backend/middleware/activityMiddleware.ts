// backend/middleware/activityMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Activity from '../models/Activity';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const trackActivity = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        const activity = new Activity({
          user: req.user.id,
          action,
          target: req.params.id || req.body.postId || 'general',
          details: {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
          }
        });
        await activity.save();
      }
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
    next();
  };
};