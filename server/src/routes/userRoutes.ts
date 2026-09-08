import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.patch('/profile', requireAuth, userController.updateProfile);
router.get('/search', requireAuth, userController.searchUsers);
router.post('/:userId/follow', requireAuth, userController.followUser);
router.delete('/:userId/follow', requireAuth, userController.unfollowUser);
router.get('/:username', userController.getProfile);
router.get('/:username/posts', userController.getUserPosts);

export default router;
