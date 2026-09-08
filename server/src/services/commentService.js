/* Gather Platform - Comment Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');

class CommentService {
  async getComments(postId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `SELECT c.id, c.content, c.created_at, c.user_id,
          u.full_name, u.username, u.avatar_url
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
        [postId]
      );
      return res.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          full_name: row.full_name,
          username: row.username,
          avatar_url: row.avatar_url
        }
      }));
    } else {
      await memoryStore.init();
      const pId = parseInt(postId, 10);
      return memoryStore.comments
        .filter(c => c.post_id === pId)
        .map(c => {
          const author = memoryStore.users.find(u => u.id === c.user_id) || { full_name: 'User', username: 'user' };
          return {
            id: c.id,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            user: {
              id: author.id,
              full_name: author.full_name,
              username: author.username,
              avatar_url: author.avatar_url
            }
          };
        });
    }
  }

  async addComment(userId, postId, content) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `INSERT INTO comments (user_id, post_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, post_id, content, created_at`,
        [userId, postId, content]
      );
      const commentRow = res.rows[0];

      // Send notification to post owner
      const postRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      if (postRes.rows.length > 0 && postRes.rows[0].user_id !== parseInt(userId, 10)) {
        await db.query(
          `INSERT INTO notifications (recipient_id, actor_id, post_id, type)
           VALUES ($1, $2, $3, 'comment')`,
          [postRes.rows[0].user_id, userId, postId]
        );
      }

      // Fetch user info for return
      const userRes = await db.query('SELECT full_name, username, avatar_url FROM users WHERE id = $1', [userId]);
      return {
        ...commentRow,
        user: userRes.rows[0]
      };
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      const pId = parseInt(postId, 10);
      const author = memoryStore.users.find(u => u.id === uId);

      const newComment = {
        id: memoryStore.comments.length + 100,
        post_id: pId,
        user_id: uId,
        content,
        created_at: new Date().toISOString()
      };
      memoryStore.comments.push(newComment);

      const post = memoryStore.posts.find(p => p.id === pId);
      if (post && post.user_id !== uId) {
        memoryStore.notifications.push({
          id: memoryStore.notifications.length + 1,
          recipient_id: post.user_id,
          actor_id: uId,
          post_id: pId,
          type: 'comment',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      return {
        ...newComment,
        user: {
          id: author.id,
          full_name: author.full_name,
          username: author.username,
          avatar_url: author.avatar_url
        }
      };
    }
  }

  async deleteComment(commentId, userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const check = await db.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
      if (check.rows.length === 0) {
        const err = new Error('Comment not found.');
        err.status = 404;
        throw err;
      }
      if (check.rows[0].user_id !== parseInt(userId, 10)) {
        const err = new Error('You are not authorized to delete this comment.');
        err.status = 403;
        throw err;
      }

      await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
      return { success: true, message: 'Comment deleted.' };
    } else {
      await memoryStore.init();
      const cIndex = memoryStore.comments.findIndex(c => c.id === parseInt(commentId, 10));
      if (cIndex === -1) {
        const err = new Error('Comment not found.');
        err.status = 404;
        throw err;
      }
      if (memoryStore.comments[cIndex].user_id !== parseInt(userId, 10)) {
        const err = new Error('You are not authorized to delete this comment.');
        err.status = 403;
        throw err;
      }
      memoryStore.comments.splice(cIndex, 1);
      return { success: true, message: 'Comment deleted.' };
    }
  }
}

module.exports = new CommentService();
