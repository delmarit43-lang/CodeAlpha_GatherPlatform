/* Gather Platform - Auth Service */

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const memoryStore = require('./memoryStore');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register({ full_name, username, email, password }) {
    const isPg = db.isPgConnected();

    if (isPg) {
      // Check existing user
      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email.toLowerCase(), username.toLowerCase()]
      );
      if (existing.rows.length > 0) {
        const err = new Error('Username or email already exists.');
        err.status = 409;
        throw err;
      }

      const password_hash = await bcrypt.hash(password, 10);
      const res = await db.query(
        `INSERT INTO users (full_name, username, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, username, email, avatar_url, bio, location, created_at`,
        [full_name, username.toLowerCase(), email.toLowerCase(), password_hash]
      );
      const user = res.rows[0];
      const token = generateToken({ id: user.id, username: user.username, email: user.email });
      return { token, user };
    } else {
      // Fallback memory store
      await memoryStore.init();
      const existing = memoryStore.users.find(
        u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
      );
      if (existing) {
        const err = new Error('Username or email already exists.');
        err.status = 409;
        throw err;
      }

      const password_hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: memoryStore.users.length + 1,
        full_name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash,
        avatar_url: null,
        bio: '',
        location: '',
        created_at: new Date().toISOString()
      };
      memoryStore.users.push(newUser);
      const token = generateToken({ id: newUser.id, username: newUser.username, email: newUser.email });
      const { password_hash: _, ...userWithoutPassword } = newUser;
      return { token, user: userWithoutPassword };
    }
  }

  async login({ identity, password }) {
    const isPg = db.isPgConnected();
    const cleanIdentity = identity.toLowerCase();

    if (isPg) {
      const res = await db.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [cleanIdentity, cleanIdentity]
      );
      if (res.rows.length === 0) {
        const err = new Error('Invalid email/username or password.');
        err.status = 401;
        throw err;
      }

      const user = res.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        const err = new Error('Invalid email/username or password.');
        err.status = 401;
        throw err;
      }

      const token = generateToken({ id: user.id, username: user.username, email: user.email });
      const { password_hash, ...userWithoutPassword } = user;
      return { token, user: userWithoutPassword };
    } else {
      await memoryStore.init();
      const user = memoryStore.users.find(
        u => u.email.toLowerCase() === cleanIdentity || u.username.toLowerCase() === cleanIdentity
      );
      if (!user) {
        const err = new Error('Invalid email/username or password.');
        err.status = 401;
        throw err;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        const err = new Error('Invalid email/username or password.');
        err.status = 401;
        throw err;
      }

      const token = generateToken({ id: user.id, username: user.username, email: user.email });
      const { password_hash: _, ...userWithoutPassword } = user;
      return { token, user: userWithoutPassword };
    }
  }

  async getCurrentUser(userId) {
    const isPg = db.isPgConnected();
    if (isPg) {
      const res = await db.query(
        'SELECT id, full_name, username, email, avatar_url, bio, location, created_at FROM users WHERE id = $1',
        [userId]
      );
      return res.rows[0] || null;
    } else {
      await memoryStore.init();
      const user = memoryStore.users.find(u => u.id === parseInt(userId, 10));
      if (!user) return null;
      const { password_hash, ...userClean } = user;
      return userClean;
    }
  }
}

module.exports = new AuthService();
