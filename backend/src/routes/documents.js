import { Router } from 'express';
import { get, upsert, remove } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upsertDocumentSchema } from '../validators/documentValidator.js';

const router = Router();
router.use(authMiddleware);
router.get('/requirements/:id/document', get);
router.put('/requirements/:id/document', validate(upsertDocumentSchema), upsert);
router.delete('/requirements/:id/document', remove);

export default router;
