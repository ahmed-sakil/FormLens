import { Router } from 'express';
import { list, create, update, remove } from '../controllers/requirementController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRequirementSchema, updateRequirementSchema } from '../validators/requirementValidator.js';

const router = Router();
router.use(authMiddleware);
router.get('/applications/:id/requirements', list);
router.post('/applications/:id/requirements', validate(createRequirementSchema), create);
router.patch('/requirements/:id', validate(updateRequirementSchema), update);
router.delete('/requirements/:id', remove);

export default router;
