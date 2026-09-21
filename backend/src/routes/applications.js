import { Router } from 'express';
import { list, create, get, update, remove, readiness } from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createApplicationSchema, updateApplicationSchema } from '../validators/applicationValidator.js';

const router = Router();
router.use(authMiddleware);
router.get('/', list);
router.post('/', validate(createApplicationSchema), create);
router.get('/:id', get);
router.patch('/:id', validate(updateApplicationSchema), update);
router.delete('/:id', remove);
router.get('/:id/readiness', readiness);

export default router;
