/* Gather Platform - Bookmark Routes */

const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, bookmarkController.getBookmarks);

module.exports = router;
