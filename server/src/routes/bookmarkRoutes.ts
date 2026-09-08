import { Router } from 'express';
import * as bookmarkController from '../controllers/bookmarkController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, bookmarkController.getBookmarks);
router.post('/:postId', requireAuth, bookmarkController.addBookmark);
router.delete('/:postId', requireAuth, bookmarkController.removeBookmark);

export default router;
