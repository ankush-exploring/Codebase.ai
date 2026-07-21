import { Router } from 'express';
import { ragController } from '../controllers/rag.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/:id/embed', ragController.embed);
router.post('/:id/query', ragController.query);

export default router;