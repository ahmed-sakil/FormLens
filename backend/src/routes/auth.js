import { Router } from 'express';
import { register, profileSync } from '../controllers/authController.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import { registerSchema } from '../validators/authValidator.js';

const router = Router();
router.post('/register', strictLimiter, validate(registerSchema), register);
router.post('/profile-sync', authMiddleware, profileSync);

export default router;
