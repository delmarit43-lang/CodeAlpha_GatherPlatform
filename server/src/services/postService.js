/* Gather Platform - Post Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');

class PostService {
  async getFeed(currentUserId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id,
          u.full_name, u.username, u.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked,
          EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = $1) AS is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [currentUserId || 0]
      );
      return res.rows.map(row => this.formatPostRow(row));
    } else {
      await memoryStore.init();
      return memoryStore.posts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(p => {
          const author = memoryStore.users.find(u => u.id === p.user_id) || { full_name: 'User', username: 'user' };
          const like_count = memoryStore.likes.filter(l => l.post_id === p.id).length;
          const comment_count = memoryStore.comments.filter(c => c.post_id === p.id).length;
          const is_liked = currentUserId ? memoryStore.likes.some(l => l.post_id === p.id && l.user_id === parseInt(currentUserId, 10)) : false;
          const is_bookmarked = currentUserId ? memoryStore.bookmarks.some(b => b.post_id === p.id && b.user_id === parseInt(currentUserId, 10)) : false;

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
            is_bookmarked
          };
        });
    }
  }

  async getById(postId, currentUserId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id,
          u.full_name, u.username, u.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked,
          EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = $1) AS is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $2`,
        [currentUserId || 0, postId]
      );
      if (res.rows.length === 0) {
        const err = new Error('Post not found.');
        err.status = 404;
        throw err;
      }
      return this.formatPostRow(res.rows[0]);
    } else {
      await memoryStore.init();
      const p = memoryStore.posts.find(item => item.id === parseInt(postId, 10));
      if (!p) {
        const err = new Error('Post not found.');
        err.status = 404;
        throw err;
      }
      const author = memoryStore.users.find(u => u.id === p.user_id) || { full_name: 'User', username: 'user' };
      const like_count = memoryStore.likes.filter(l => l.post_id === p.id).length;
      const comment_count = memoryStore.comments.filter(c => c.post_id === p.id).length;
      const is_liked = currentUserId ? memoryStore.likes.some(l => l.post_id === p.id && l.user_id === parseInt(currentUserId, 10)) : false;
      const is_bookmarked = currentUserId ? memoryStore.bookmarks.some(b => b.post_id === p.id && b.user_id === parseInt(currentUserId, 10)) : false;

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
        is_bookmarked
      };
    }
  }

  async getByUser(username, currentUserId, tab = 'posts') {
    const isPg = db.isPgConnected();
    if (isPg) {
      let query = `
        SELECT p.id, p.content, p.image_url, p.created_at, p.user_id,
          u.full_name, u.username, u.avatar_url,
          (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
          EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) AS is_liked,
          EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = $1) AS is_bookmarked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE u.username = $2
      `;

      if (tab === 'likes') {
        query = `
          SELECT p.id, p.content, p.image_url, p.created_at, p.user_id,
            u.full_name, u.username, u.avatar_url,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id)::int AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count,
            TRUE AS is_liked,
            EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = $1) AS is_bookmarked
          FROM likes l
          JOIN posts p ON l.post_id = p.id
          JOIN users u ON p.user_id = u.id
          JOIN users lu ON l.user_id = lu.id
          WHERE lu.username = $2
        `;
      }

      query += ` ORDER BY p.created_at DESC LIMIT 50`;
      const res = await db.query(query, [currentUserId || 0, username.toLowerCase()]);
      return res.rows.map(row => this.formatPostRow(row));
    } else {
      await memoryStore.init();
      const targetUser = memoryStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!targetUser) return [];

      let matchingPosts = [];
      if (tab === 'likes') {
        const likedPostIds = memoryStore.likes.filter(l => l.user_id === targetUser.id).map(l => l.post_id);
        matchingPosts = memoryStore.posts.filter(p => likedPostIds.includes(p.id));
      } else {
        matchingPosts = memoryStore.posts.filter(p => p.user_id === targetUser.id);
      }

      return matchingPosts.map(p => {
        const author = memoryStore.users.find(u => u.id === p.user_id) || targetUser;
        const like_count = memoryStore.likes.filter(l => l.post_id === p.id).length;
        const comment_count = memoryStore.comments.filter(c => c.post_id === p.id).length;
        const is_liked = currentUserId ? memoryStore.likes.some(l => l.post_id === p.id && l.user_id === parseInt(currentUserId, 10)) : false;
        const is_bookmarked = currentUserId ? memoryStore.bookmarks.some(b => b.post_id === p.id && b.user_id === parseInt(currentUserId, 10)) : false;

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
          is_bookmarked
        };
      });
    }
  }

  async create(userId, { content, image_url }) {
    const isPg = db.isPgConnected();

    if (isPg) {
      const res = await db.query(
        `INSERT INTO posts (user_id, content, image_url)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, content, image_url, created_at`,
        [userId, content, image_url || null]
      );
      const postRow = res.rows[0];
      return this.getById(postRow.id, userId);
    } else {
      await memoryStore.init();
      const author = memoryStore.users.find(u => u.id === parseInt(userId, 10));
      const newPost = {
        id: memoryStore.posts.length + 100,
        user_id: parseInt(userId, 10),
        content,
        image_url: image_url || null,
        created_at: new Date().toISOString()
      };
      memoryStore.posts.unshift(newPost);
      return {
        ...newPost,
        user: {
          id: author.id,
          full_name: author.full_name,
          username: author.username,
          avatar_url: author.avatar_url
        },
        like_count: 0,
        comment_count: 0,
        is_liked: false,
        is_bookmarked: false
      };
    }
  }

  async delete(postId, userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const check = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      if (check.rows.length === 0) {
        const err = new Error('Post not found.');
        err.status = 404;
        throw err;
      }
      if (check.rows[0].user_id !== parseInt(userId, 10)) {
        const err = new Error('You are not authorized to delete this post.');
        err.status = 403;
        throw err;
      }

      await db.query('DELETE FROM posts WHERE id = $1', [postId]);
      return { success: true, message: 'Post deleted.' };
    } else {
      await memoryStore.init();
      const postIndex = memoryStore.posts.findIndex(p => p.id === parseInt(postId, 10));
      if (postIndex === -1) {
        const err = new Error('Post not found.');
        err.status = 404;
        throw err;
      }
      if (memoryStore.posts[postIndex].user_id !== parseInt(userId, 10)) {
        const err = new Error('You are not authorized to delete this post.');
        err.status = 403;
        throw err;
      }

      memoryStore.posts.splice(postIndex, 1);
      return { success: true, message: 'Post deleted.' };
    }
  }

  formatPostRow(row) {
    return {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      image_url: row.image_url,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        full_name: row.full_name,
        username: row.username,
        avatar_url: row.avatar_url
      },
      like_count: row.like_count || 0,
      comment_count: row.comment_count || 0,
      is_liked: !!row.is_liked,
      is_bookmarked: !!row.is_bookmarked
    };
  }
}

module.exports = new PostService();
