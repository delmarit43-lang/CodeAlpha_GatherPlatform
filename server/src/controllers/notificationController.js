/* Gather Platform - Notification Controller */

const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getNotifications(req.user.id);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
