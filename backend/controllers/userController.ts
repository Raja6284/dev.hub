import { Request, Response } from 'express';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q = '', limit = 20 } = req.query;
  
  try {
    const searchQuery = q as string;
    const users = await User.find({
      _id: { $ne: req.user?.id }, // Exclude current user
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('name email isOnline lastSeen')
    .limit(parseInt(limit as string))
    .sort({ name: 1 });
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};