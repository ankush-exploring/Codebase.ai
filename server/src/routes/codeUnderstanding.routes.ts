import { Router } from 'express';
import { codeUnderstandingController } from '../controllers/codeUnderstanding.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/:id/explain', codeUnderstandingController.explain);
router.get('/:id/files', codeUnderstandingController.getFileTree);
router.get('/:id/file-info', codeUnderstandingController.getFileInfo);

export default router;