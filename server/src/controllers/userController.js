/* Gather Platform - User Controller */

const userService = require('../services/userService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const { username } = req.params;
      const currentUserId = req.user ? req.user.id : null;
      const profile = await userService.getProfile(username, currentUserId);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await userService.updateProfile(req.user.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const q = req.query.q || '';
      const currentUserId = req.user ? req.user.id : null;
      const results = await userService.search(q, currentUserId);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }

  async follow(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const result = await userService.follow(req.user.id, targetUserId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async unfollow(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const result = await userService.unfollow(req.user.id, targetUserId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
