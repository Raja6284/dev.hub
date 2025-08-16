import { Router } from 'express';
import { getChatRooms, getChatMessages } from '../controllers/chatController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.get('/rooms', protect, getChatRooms);
router.get('/messages/:chatId', protect, getChatMessages);

export default router;