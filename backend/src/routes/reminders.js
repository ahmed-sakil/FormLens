import { Router } from 'express';
import { list, upsert, remove } from '../controllers/reminderController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReminderSchema } from '../validators/reminderValidator.js';

const router = Router();
router.use(authMiddleware);
router.get('/applications/:id/reminders', list);
router.post('/applications/:id/reminders', validate(createReminderSchema), upsert);
router.delete('/reminders/:id', remove);

export default router;
