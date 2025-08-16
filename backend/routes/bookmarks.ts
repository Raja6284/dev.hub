// backend/routes/bookmarks.ts
import { Router } from 'express';
import { addBookmark, getBookmarks } from '../controllers/bookmarkController';
import protect from '../middleware/authMiddleware';
import sanitizeInput from '../middleware/sanitizeMiddleware';

const router = Router();

router.post('/', protect, sanitizeInput, addBookmark);
router.get('/', protect, getBookmarks);

export default router;