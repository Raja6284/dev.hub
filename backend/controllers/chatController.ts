import { Request, Response } from 'express';
import { redisClient } from '../config/redis';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getChatRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }

    // Get chat rooms from Redis
    const chatRoomsKey = `chat_rooms:${userId}`;
    const chatRooms = await redisClient.lRange(chatRoomsKey, 0, -1);
    
    const parsedRooms = chatRooms.map(room => JSON.parse(room));
    res.json(parsedRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { page = '1', limit = '50' } = req.query;
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }

    // Get messages from Redis
    const messagesKey = `chat_messages:${chatId}`;
    const start = (parseInt(page as string) - 1) * parseInt(limit as string);
    const end = start + parseInt(limit as string) - 1;
    
    const messages = await redisClient.lRange(messagesKey, start, end);
    const parsedMessages = messages.reverse().map(msg => JSON.parse(msg));
    
    res.json(parsedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};