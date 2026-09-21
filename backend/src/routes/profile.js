import { Router } from 'express';
import { getProfileCtrl, updateProfileCtrl, changePassword } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/profileValidator.js';

const router = Router();
router.use(authMiddleware);
router.get('/', getProfileCtrl);
router.patch('/', validate(updateProfileSchema), updateProfileCtrl);
router.post('/change-password', strictLimiter, validate(changePasswordSchema), changePassword);

export default router;
