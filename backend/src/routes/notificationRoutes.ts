import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, notificationController.getNotifications);
router.patch('/read-all', requireAuth, notificationController.markAllRead);
router.patch('/:id/read', requireAuth, notificationController.markOneRead);

export default router;
