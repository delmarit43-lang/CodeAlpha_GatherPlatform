/* Gather Platform - Comment Controller */

const commentService = require('../services/commentService');

class CommentController {
  async getComments(req, res, next) {
    try {
      const comments = await commentService.getComments(req.params.id);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  }

  async addComment(req, res, next) {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: 'Comment content is required.' });
      }
      const comment = await commentService.addComment(req.user.id, req.params.id, content);
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CommentController();
