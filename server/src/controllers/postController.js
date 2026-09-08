/* Gather Platform - Post Controller */

const postService = require('../services/postService');

class PostController {
  async getFeed(req, res, next) {
    try {
      const currentUserId = req.user ? req.user.id : null;
      const posts = await postService.getFeed(currentUserId);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const currentUserId = req.user ? req.user.id : null;
      const post = await postService.getById(req.params.id, currentUserId);
      res.json(post);
    } catch (err) {
      next(err);
    }
  }

  async getByUser(req, res, next) {
    try {
      const { username } = req.params;
      const tab = req.query.tab || 'posts';
      const currentUserId = req.user ? req.user.id : null;
      const posts = await postService.getByUser(username, currentUserId, tab);
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { content, image_url } = req.body;
      if (!content && !image_url) {
        return res.status(400).json({ message: 'Post content or image is required.' });
      }
      const post = await postService.create(req.user.id, { content, image_url });
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await postService.delete(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostController();
