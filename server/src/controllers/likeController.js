/* Gather Platform - Like Controller */

const likeService = require('../services/likeService');

class LikeController {
  async like(req, res, next) {
    try {
      const result = await likeService.likePost(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async unlike(req, res, next) {
    try {
      const result = await likeService.unlikePost(req.user.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LikeController();
