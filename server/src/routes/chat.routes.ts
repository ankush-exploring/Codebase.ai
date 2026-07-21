import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', chatController.list);
router.post('/', chatController.create);
router.get('/:id/messages', chatController.getMessages);
router.post('/:id/messages', chatLimiter, chatController.sendMessage);
router.delete('/:id', chatController.delete);

export default router;