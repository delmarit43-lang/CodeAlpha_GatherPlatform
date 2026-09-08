/* Gather Platform - Notification Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');

class NotificationService {
  async getNotifications(userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `SELECT n.id, n.type, n.is_read, n.created_at, n.post_id,
          au.full_name AS actor_full_name, au.username AS actor_username, au.avatar_url AS actor_avatar_url, au.id AS actor_id
         FROM notifications n
         JOIN users au ON n.actor_id = au.id
         WHERE n.recipient_id = $1
         ORDER BY n.created_at DESC`,
        [userId]
      );
      return res.rows.map(row => ({
        id: row.id,
        type: row.type,
        is_read: row.is_read,
        post_id: row.post_id,
        created_at: row.created_at,
        actor: {
          id: row.actor_id,
          full_name: row.actor_full_name,
          username: row.actor_username,
          avatar_url: row.actor_avatar_url
        }
      }));
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      return memoryStore.notifications
        .filter(n => n.recipient_id === uId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(n => {
          const actor = memoryStore.users.find(u => u.id === n.actor_id) || { full_name: 'Someone', username: 'user' };
          return {
            id: n.id,
            type: n.type,
            is_read: n.is_read,
            post_id: n.post_id,
            created_at: n.created_at,
            actor: {
              id: actor.id,
              full_name: actor.full_name,
              username: actor.username,
              avatar_url: actor.avatar_url
            }
          };
        });
    }
  }

  async markAsRead(notificationId, userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2',
        [notificationId, userId]
      );
      return { success: true };
    } else {
      await memoryStore.init();
      const item = memoryStore.notifications.find(n => n.id === parseInt(notificationId, 10) && n.recipient_id === parseInt(userId, 10));
      if (item) item.is_read = true;
      return { success: true };
    }
  }

  async markAllAsRead(userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1',
        [userId]
      );
      return { success: true };
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      memoryStore.notifications.forEach(n => {
        if (n.recipient_id === uId) n.is_read = true;
      });
      return { success: true };
    }
  }
}

module.exports = new NotificationService();
