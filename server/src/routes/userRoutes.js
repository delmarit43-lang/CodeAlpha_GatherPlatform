/* Gather Platform - User Routes */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/search', optionalAuth, userController.search);
router.get('/:username', optionalAuth, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);
router.post('/:id/follow', authenticate, userController.follow);
router.delete('/:id/follow', authenticate, userController.unfollow);

module.exports = router;
