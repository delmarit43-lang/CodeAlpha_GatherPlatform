/* Gather Platform - Auth Controller */

const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { full_name, username, email, password } = req.body;
      if (!full_name || !username || !email || !password) {
        return res.status(400).json({ message: 'All fields (full_name, username, email, password) are required.' });
      }
      const result = await authService.register({ full_name, username, email, password });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { identity, password } = req.body;
      if (!identity || !password) {
        return res.status(400).json({ message: 'Identity (email or username) and password are required.' });
      }
      const result = await authService.login({ identity, password });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
