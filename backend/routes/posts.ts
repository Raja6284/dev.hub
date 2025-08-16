import { Router } from 'express';
import { 
  createPost, 
  updatePost,
  deletePost,
  getFeed, 
  searchPosts, 
  addComment, 
  getComments,
  getPost,
  getUserPosts
} from '../controllers/postController';
import protect from '../middleware/authMiddleware';
import sanitizeInput from '../middleware/sanitizeMiddleware';
import { trackActivity } from '../middleware/activityMiddleware';
import { standardRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();

router.post('/', protect, standardRateLimit, sanitizeInput, trackActivity('create_post'), createPost);
router.put('/:id', protect, sanitizeInput, trackActivity('update_post'), updatePost);
router.delete('/:id', protect, trackActivity('delete_post'), deletePost);
router.get('/feed', getFeed);
router.get('/search', searchPosts);
router.get('/:id', trackActivity('view_post'), getPost);
router.get('/user/:userId', protect, getUserPosts);
router.post('/comment', protect, sanitizeInput, trackActivity('comment'), addComment);
router.get('/comments', getComments);

export default router;