import express from 'express';
import { 
  signup, 
  login, 
  refresh, 
  logout,
  resetPassword, 
  confirmResetPassword,
  updateProfile,
  getProfile
} from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import sanitizeInput from '../middleware/sanitizeMiddleware';
import { authRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';

const router = express.Router();

router.post('/signup', authRateLimit, sanitizeInput, signup);
router.post('/login', authRateLimit, sanitizeInput, login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.post('/reset-password', strictRateLimit, sanitizeInput, resetPassword);
router.post('/confirm-reset-password', strictRateLimit, sanitizeInput, confirmResetPassword);
router.put('/profile', authMiddleware, sanitizeInput, updateProfile);
router.get('/profile', authMiddleware, getProfile);

export default router;