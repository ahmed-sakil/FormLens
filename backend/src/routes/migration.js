import { Router } from 'express';
import { importGuestData } from '../controllers/migrationController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { migrationSchema } from '../validators/migrationValidator.js';

const router = Router();
router.post('/import', authMiddleware, strictLimiter, validate(migrationSchema), importGuestData);

export default router;
