import { Router } from 'express';
import * as postController from '../controllers/postController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/feed', postController.getFeed);
router.get('/:id', postController.getPost);
router.post('/', requireAuth, postController.createPost);
router.delete('/:id', requireAuth, postController.deletePost);

// Likes & Comments
router.post('/:id/like', requireAuth, postController.likePost);
router.delete('/:id/like', requireAuth, postController.unlikePost);
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', requireAuth, postController.addComment);

export default router;
