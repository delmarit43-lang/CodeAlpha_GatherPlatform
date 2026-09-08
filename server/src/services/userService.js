/* Gather Platform - User Service */

const db = require('../config/db');
const memoryStore = require('./memoryStore');

class UserService {
  async getProfile(username, currentUserId) {
    const isPg = db.isPgConnected();
    const cleanUsername = username.toLowerCase();

    if (isPg) {
      const res = await db.query(
        `SELECT u.id, u.full_name, u.username, u.email, u.avatar_url, u.bio, u.location, u.created_at,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id)::int AS posts_count,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id)::int AS followers_count,
          (SELECT COUNT(*) FROM follows WHERE follower_id = u.id)::int AS following_count,
          EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
         FROM users u WHERE u.username = $1`,
        [cleanUsername, currentUserId || 0]
      );
      if (res.rows.length === 0) {
        const err = new Error('User not found.');
        err.status = 404;
        throw err;
      }
      return res.rows[0];
    } else {
      await memoryStore.init();
      const user = memoryStore.users.find(u => u.username.toLowerCase() === cleanUsername);
      if (!user) {
        const err = new Error('User not found.');
        err.status = 404;
        throw err;
      }

      const posts_count = memoryStore.posts.filter(p => p.user_id === user.id).length;
      const followers_count = memoryStore.follows.filter(f => f.following_id === user.id).length;
      const following_count = memoryStore.follows.filter(f => f.follower_id === user.id).length;
      const is_following = currentUserId ? memoryStore.follows.some(f => f.follower_id === parseInt(currentUserId, 10) && f.following_id === user.id) : false;

      const { password_hash, ...profile } = user;
      return {
        ...profile,
        posts_count,
        followers_count,
        following_count,
        is_following
      };
    }
  }

  async updateProfile(userId, { full_name, bio, location, avatar_url }) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio),
             location = COALESCE($3, location),
             avatar_url = COALESCE($4, avatar_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, full_name, username, email, avatar_url, bio, location, created_at`,
        [full_name, bio, location, avatar_url, userId]
      );
      return res.rows[0];
    } else {
      await memoryStore.init();
      const userIndex = memoryStore.users.findIndex(u => u.id === parseInt(userId, 10));
      if (userIndex === -1) {
        const err = new Error('User not found.');
        err.status = 404;
        throw err;
      }
      const user = memoryStore.users[userIndex];
      if (full_name !== undefined) user.full_name = full_name;
      if (bio !== undefined) user.bio = bio;
      if (location !== undefined) user.location = location;
      if (avatar_url !== undefined) user.avatar_url = avatar_url;

      const { password_hash, ...updated } = user;
      return updated;
    }
  }

  async search(query, currentUserId) {
    if (!query) return [];
    const isPg = db.isPgConnected();
    const cleanQ = `%${query.toLowerCase()}%`;

    if (isPg) {
      const res = await db.query(
        `SELECT u.id, u.full_name, u.username, u.avatar_url, u.bio,
          EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = u.id) AS is_following
         FROM users u
         WHERE (LOWER(u.full_name) LIKE $1 OR LOWER(u.username) LIKE $1) AND u.id != $2
         LIMIT 20`,
        [cleanQ, currentUserId || 0]
      );
      return res.rows;
    } else {
      await memoryStore.init();
      const qLower = query.toLowerCase();
      return memoryStore.users
        .filter(u => u.id !== parseInt(currentUserId, 10) && (u.full_name.toLowerCase().includes(qLower) || u.username.toLowerCase().includes(qLower)))
        .map(u => {
          const is_following = currentUserId ? memoryStore.follows.some(f => f.follower_id === parseInt(currentUserId, 10) && f.following_id === u.id) : false;
          return {
            id: u.id,
            full_name: u.full_name,
            username: u.username,
            avatar_url: u.avatar_url,
            bio: u.bio,
            is_following
          };
        });
    }
  }

  async follow(followerId, targetUserId) {
    if (parseInt(followerId, 10) === parseInt(targetUserId, 10)) {
      const err = new Error('You cannot follow yourself.');
      err.status = 400;
      throw err;
    }

    const isPg = db.isPgConnected();
    if (isPg) {
      try {
        await db.query(
          'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
          [followerId, targetUserId]
        );
        // Create Notification for target user
        await db.query(
          `INSERT INTO notifications (recipient_id, actor_id, type)
           VALUES ($1, $2, 'follow')`,
          [targetUserId, followerId]
        );
      } catch (err) {
        if (err.code === '23505') {
          const customErr = new Error('Already following this user.');
          customErr.status = 409;
          throw customErr;
        }
        throw err;
      }
      return { success: true, message: 'Followed user.' };
    } else {
      await memoryStore.init();
      const exists = memoryStore.follows.some(
        f => f.follower_id === parseInt(followerId, 10) && f.following_id === parseInt(targetUserId, 10)
      );
      if (exists) {
        const err = new Error('Already following this user.');
        err.status = 409;
        throw err;
      }

      memoryStore.follows.push({
        id: memoryStore.follows.length + 1,
        follower_id: parseInt(followerId, 10),
        following_id: parseInt(targetUserId, 10),
        created_at: new Date().toISOString()
      });

      // Notification
      memoryStore.notifications.push({
        id: memoryStore.notifications.length + 1,
        recipient_id: parseInt(targetUserId, 10),
        actor_id: parseInt(followerId, 10),
        post_id: null,
        type: 'follow',
        is_read: false,
        created_at: new Date().toISOString()
      });

      return { success: true, message: 'Followed user.' };
    }
  }

  async unfollow(followerId, targetUserId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, targetUserId]
      );
      return { success: true, message: 'Unfollowed user.' };
    } else {
      await memoryStore.init();
      memoryStore.follows = memoryStore.follows.filter(
        f => !(f.follower_id === parseInt(followerId, 10) && f.following_id === parseInt(targetUserId, 10))
      );
      return { success: true, message: 'Unfollowed user.' };
    }
  }
}

module.exports = new UserService();
