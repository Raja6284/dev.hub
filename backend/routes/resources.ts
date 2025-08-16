import { Router } from 'express';
import { getTrending, getStackOverflowQuestions } from '../controllers/resourceController';
import protect from '../middleware/authMiddleware';
import { trackActivity } from '../middleware/activityMiddleware';

const router = Router();

router.get('/trending', protect, trackActivity('view_trending'), getTrending);
router.get('/stackoverflow', protect, trackActivity('view_stackoverflow'), getStackOverflowQuestions);

export default router;