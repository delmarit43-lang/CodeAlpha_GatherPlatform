/* Gather Platform - Comment Routes */

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');

router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
