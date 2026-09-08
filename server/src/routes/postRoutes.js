/* Gather Platform - Post Routes */

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/feed', optionalAuth, postController.getFeed);
router.get('/:id', optionalAuth, postController.getById);
router.post('/', authenticate, postController.create);
router.delete('/:id', authenticate, postController.delete);

// Like routes on post
router.post('/:id/like', authenticate, likeController.like);
router.delete('/:id/like', authenticate, likeController.unlike);

// Comment routes on post
router.get('/:id/comments', optionalAuth, commentController.getComments);
router.post('/:id/comments', authenticate, commentController.addComment);

// Bookmark routes on post
router.post('/:id/bookmark', authenticate, bookmarkController.addBookmark);
router.delete('/:id/bookmark', authenticate, bookmarkController.removeBookmark);

module.exports = router;
