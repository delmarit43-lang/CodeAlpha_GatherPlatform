/* Gather Platform - Like Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');

class LikeService {
  async likePost(userId, postId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      try {
        await db.query(
          'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
          [userId, postId]
        );

        // Get post author to send notification
        const postRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
        if (postRes.rows.length > 0 && postRes.rows[0].user_id !== parseInt(userId, 10)) {
          await db.query(
            `INSERT INTO notifications (recipient_id, actor_id, post_id, type)
             VALUES ($1, $2, $3, 'like')`,
            [postRes.rows[0].user_id, userId, postId]
          );
        }
      } catch (err) {
        if (err.code === '23505') {
          // Already liked
          return { success: true, message: 'Already liked.' };
        }
        throw err;
      }
      return { success: true, message: 'Liked post.' };
    } else {
      await memoryStore.init();
      const pId = parseInt(postId, 10);
      const uId = parseInt(userId, 10);
      const exists = memoryStore.likes.some(l => l.post_id === pId && l.user_id === uId);
      if (!exists) {
        memoryStore.likes.push({
          id: memoryStore.likes.length + 1,
          user_id: uId,
          post_id: pId
        });

        const post = memoryStore.posts.find(p => p.id === pId);
        if (post && post.user_id !== uId) {
          memoryStore.notifications.push({
            id: memoryStore.notifications.length + 1,
            recipient_id: post.user_id,
            actor_id: uId,
            post_id: pId,
            type: 'like',
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
      return { success: true, message: 'Liked post.' };
    }
  }

  async unlikePost(userId, postId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      return { success: true, message: 'Unliked post.' };
    } else {
      await memoryStore.init();
      const pId = parseInt(postId, 10);
      const uId = parseInt(userId, 10);
      memoryStore.likes = memoryStore.likes.filter(l => !(l.post_id === pId && l.user_id === uId));
      return { success: true, message: 'Unliked post.' };
    }
  }
}

module.exports = new LikeService();
