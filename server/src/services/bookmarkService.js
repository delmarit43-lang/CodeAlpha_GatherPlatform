/* Gather Platform - Bookmark Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');
const postService = require('./postService');

class BookmarkService {
  async addBookmark(userId, postId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      try {
        await db.query(
          'INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)',
          [userId, postId]
        );
      } catch (err) {
        if (err.code === '23505') {
          return { success: true, message: 'Post already bookmarked.' };
        }
        throw err;
      }
      return { success: true, message: 'Post bookmarked.' };
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      const pId = parseInt(postId, 10);
      const exists = memoryStore.bookmarks.some(b => b.user_id === uId && b.post_id === pId);
      if (!exists) {
        memoryStore.bookmarks.push({
          id: memoryStore.bookmarks.length + 1,
          user_id: uId,
          post_id: pId
        });
      }
      return { success: true, message: 'Post bookmarked.' };
    }
  }

  async removeBookmark(userId, postId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      await db.query(
        'DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      return { success: true, message: 'Bookmark removed.' };
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      const pId = parseInt(postId, 10);
      memoryStore.bookmarks = memoryStore.bookmarks.filter(b => !(b.user_id === uId && b.post_id === pId));
      return { success: true, message: 'Bookmark removed.' };
    }
  }

  async getBookmarks(userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id,
          u.full_name, u.username, u.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked,
          TRUE AS is_bookmarked
         FROM bookmarks b
         JOIN posts p ON b.post_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      return res.rows.map(row => postService.formatPostRow(row));
    } else {
      await memoryStore.init();
      const uId = parseInt(userId, 10);
      const bookmarkedIds = memoryStore.bookmarks.filter(b => b.user_id === uId).map(b => b.post_id);
      
      return memoryStore.posts
        .filter(p => bookmarkedIds.includes(p.id))
        .map(p => {
          const author = memoryStore.users.find(u => u.id === p.user_id) || { full_name: 'User', username: 'user' };
          const like_count = memoryStore.likes.filter(l => l.post_id === p.id).length;
          const comment_count = memoryStore.comments.filter(c => c.post_id === p.id).length;
          const is_liked = memoryStore.likes.some(l => l.post_id === p.id && l.user_id === uId);

          return {
            id: p.id,
            user_id: p.user_id,
            content: p.content,
            image_url: p.image_url,
            created_at: p.created_at,
            user: {
              id: author.id,
              full_name: author.full_name,
              username: author.username,
              avatar_url: author.avatar_url
            },
            like_count,
            comment_count,
            is_liked,
            is_bookmarked: true
          };
        });
    }
  }
}

module.exports = new BookmarkService();
