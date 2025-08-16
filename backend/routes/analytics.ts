import { Router } from 'express';
import { getAnalytics, getGlobalAnalytics } from '../controllers/analyticsController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getAnalytics);
router.get('/global', protect, getGlobalAnalytics);

export default router;