/* Gather Platform - Database Seeder Utility */

const fs = require('fs');
const path = require('path');
const { pool, checkDatabaseConnection } = require('../config/db');
const { getSeedData } = require('./seedData');

async function seedDatabase() {
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.log('Skipping PostgreSQL database seed because connection could not be established.');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('Running database schema migration...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../config/schema.sql'), 'utf-8');
    await client.query(schemaSql);

    console.log('Clearing existing table records...');
    await client.query('TRUNCATE users, posts, likes, comments, follows, bookmarks, notifications RESTART IDENTITY CASCADE;');

    const seedData = await getSeedData();

    // Insert Users
    console.log('Inserting seed users...');
    for (const u of seedData.users) {
      await client.query(
        `INSERT INTO users (id, full_name, username, email, password_hash, avatar_url, bio, location, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [u.id, u.full_name, u.username, u.email, u.password_hash, u.avatar_url, u.bio, u.location, u.created_at]
      );
    }

    // Insert Posts
    console.log('Inserting seed posts...');
    for (const p of seedData.posts) {
      await client.query(
        `INSERT INTO posts (id, user_id, content, image_url, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.user_id, p.content, p.image_url, p.created_at]
      );
    }

    // Insert Comments
    console.log('Inserting seed comments...');
    for (const c of seedData.comments) {
      await client.query(
        `INSERT INTO comments (id, post_id, user_id, content, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.id, c.post_id, c.user_id, c.content, c.created_at]
      );
    }

    // Insert Likes
    console.log('Inserting seed likes...');
    for (const l of seedData.likes) {
      await client.query(
        `INSERT INTO likes (id, user_id, post_id)
         VALUES ($1, $2, $3)`,
        [l.id, l.user_id, l.post_id]
      );
    }

    // Insert Follows
    console.log('Inserting seed follows...');
    for (const f of seedData.follows) {
      await client.query(
        `INSERT INTO follows (id, follower_id, following_id)
         VALUES ($1, $2, $3)`,
        [f.id, f.follower_id, f.following_id]
      );
    }

    // Insert Bookmarks
    console.log('Inserting seed bookmarks...');
    for (const b of seedData.bookmarks) {
      await client.query(
        `INSERT INTO bookmarks (id, user_id, post_id)
         VALUES ($1, $2, $3)`,
        [b.id, b.user_id, b.post_id]
      );
    }

    // Insert Notifications
    console.log('Inserting seed notifications...');
    for (const n of seedData.notifications) {
      await client.query(
        `INSERT INTO notifications (id, recipient_id, actor_id, post_id, type, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [n.id, n.recipient_id, n.actor_id, n.post_id, n.type, n.is_read, n.created_at]
      );
    }

    // Reset Sequences
    await client.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
    await client.query(`SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));`);
    await client.query(`SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));`);
    await client.query(`SELECT setval('likes_id_seq', (SELECT MAX(id) FROM likes));`);
    await client.query(`SELECT setval('follows_id_seq', (SELECT MAX(id) FROM follows));`);
    await client.query(`SELECT setval('bookmarks_id_seq', (SELECT MAX(id) FROM bookmarks));`);
    await client.query(`SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));`);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    pool.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
