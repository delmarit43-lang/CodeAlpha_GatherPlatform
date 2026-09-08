/* Gather Platform - Realistic Seed Data Definition */

const bcrypt = require('bcryptjs');

async function getSeedData() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      id: 1,
      full_name: 'Siddiiq Cawil',
      username: 'siddiiq',
      email: 'siddiiq@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Full Stack Engineer & Tech Enthusiast building Gather Platform.',
      location: 'Hargeisa, Somaliland',
      created_at: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      full_name: 'Ahmed Yusuf',
      username: 'ahmedy',
      email: 'ahmed@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Software Developer & PostgreSQL enthusiast. Writing code for local solutions.',
      location: 'Hargeisa, Somaliland',
      created_at: '2024-01-05T10:00:00Z'
    },
    {
      id: 3,
      full_name: 'Ayaan Mohamed',
      username: 'ayaan_m',
      email: 'ayaan@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Product Designer & Community Organizer. Passionate about UI design & UX research.',
      location: 'Borama, Somaliland',
      created_at: '2024-01-10T12:00:00Z'
    },
    {
      id: 4,
      full_name: 'Abdi Hassan',
      username: 'abdi_h',
      email: 'abdi@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Full-stack JS dev & visual photographer. Capturing moments and building web apps.',
      location: 'Berbera, Somaliland',
      created_at: '2024-01-15T09:30:00Z'
    },
    {
      id: 5,
      full_name: 'Maryan Ali',
      username: 'maryan_a',
      email: 'maryan@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Data Analyst & Educator. Writing articles on technology, data & literacy.',
      location: 'Hargeisa, Somaliland',
      created_at: '2024-01-20T14:15:00Z'
    },
    {
      id: 6,
      full_name: 'Yusuf Ahmed',
      username: 'yusuf_a',
      email: 'yusuf@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Backend systems engineer & open-source contributor.',
      location: 'Burco, Somaliland',
      created_at: '2024-01-25T11:00:00Z'
    },
    {
      id: 7,
      full_name: 'Hodan Warsame',
      username: 'hodan_w',
      email: 'hodan@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Entrepreneur & Tech Founder. Empowering local youth through digital literacy.',
      location: 'Hargeisa, Somaliland',
      created_at: '2024-02-01T15:45:00Z'
    },
    {
      id: 8,
      full_name: 'Guled Farah',
      username: 'guled_f',
      email: 'guled@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Mobile App Developer & Linux enthusiast.',
      location: 'Borama, Somaliland',
      created_at: '2024-02-05T08:20:00Z'
    },
    {
      id: 9,
      full_name: 'Asha Jama',
      username: 'asha_j',
      email: 'asha@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'UI/UX Designer creating human-centered digital experiences.',
      location: 'Hargeisa, Somaliland',
      created_at: '2024-02-10T13:10:00Z'
    },
    {
      id: 10,
      full_name: 'Hamza Said',
      username: 'hamza_s',
      email: 'hamza@gather.com',
      password_hash: passwordHash,
      avatar_url: null,
      bio: 'Cybersecurity researcher & network engineer.',
      location: 'Berbera, Somaliland',
      created_at: '2024-02-15T16:30:00Z'
    }
  ];

  const posts = [
    {
      id: 1,
      user_id: 2,
      content: 'Spent the morning working on a small PostgreSQL project. Sometimes the simplest database designs are the hardest to get right. #WebDevelopment',
      image_url: null,
      created_at: '2026-09-06T07:30:00Z'
    },
    {
      id: 2,
      user_id: 3,
      content: 'Excited to announce our upcoming community tech meetup in Hargeisa! We will discuss modern full-stack development and open source tools. #SomalilandTech',
      image_url: null,
      created_at: '2026-09-06T06:15:00Z'
    },
    {
      id: 3,
      user_id: 5,
      content: 'Reading "Clean Code" by Robert C. Martin again this weekend. A timeless reminder that readable code is written for humans first, machines second. #Books',
      image_url: null,
      created_at: '2026-09-05T18:40:00Z'
    },
    {
      id: 4,
      user_id: 4,
      content: 'Golden hour walk along the coast of Berbera. The lighting this afternoon was incredible for landscape photography. #Photography',
      image_url: null,
      created_at: '2026-09-05T15:20:00Z'
    },
    {
      id: 5,
      user_id: 7,
      content: 'Building a startup requires discipline and patience. Focus on solving real problems for real people rather than chasing trends. #Entrepreneurship',
      image_url: null,
      created_at: '2026-09-05T11:10:00Z'
    },
    {
      id: 6,
      user_id: 6,
      content: 'Node.js async/await performance combined with connection pooling makes database-heavy applications crisp and responsive.',
      image_url: null,
      created_at: '2026-09-04T20:05:00Z'
    },
    {
      id: 7,
      user_id: 8,
      content: 'Switching entirely to Linux on my workstation has improved my daily coding workflow significantly.',
      image_url: null,
      created_at: '2026-09-04T16:50:00Z'
    },
    {
      id: 8,
      user_id: 9,
      content: 'Micro-animations should always serve a functional purpose: giving immediate visual feedback without delaying the user.',
      image_url: null,
      created_at: '2026-09-04T12:30:00Z'
    },
    {
      id: 9,
      user_id: 10,
      content: 'Security starts at the data layer. Prepared statements and parameterized queries are mandatory to prevent SQL injection vulnerabilities.',
      image_url: null,
      created_at: '2026-09-03T22:15:00Z'
    },
    {
      id: 10,
      user_id: 1,
      content: 'Welcome to Gather! We designed this platform to bring people together around meaningful conversations, local communities, and genuine learning.',
      image_url: null,
      created_at: '2026-09-03T09:00:00Z'
    },
    {
      id: 11,
      user_id: 2,
      content: 'What is your favorite vanilla JavaScript feature introduced in recent years? Mine is ES Modules and async/await.',
      image_url: null,
      created_at: '2026-09-02T19:25:00Z'
    },
    {
      id: 12,
      user_id: 3,
      content: 'Design systems cut UI development time by half once tokens and component contracts are firmly established.',
      image_url: null,
      created_at: '2026-09-02T14:10:00Z'
    },
    {
      id: 13,
      user_id: 4,
      content: 'Editing raw camera photos with natural contrast always gives a timeless warm aesthetic.',
      image_url: null,
      created_at: '2026-09-01T17:45:00Z'
    },
    {
      id: 14,
      user_id: 5,
      content: 'Data visualization is about telling a clear, honest story with metrics.',
      image_url: null,
      created_at: '2026-09-01T10:30:00Z'
    },
    {
      id: 15,
      user_id: 6,
      content: 'Indexes in PostgreSQL can dramatically decrease query time if applied to high-cardinality foreign keys.',
      image_url: null,
      created_at: '2026-08-31T21:00:00Z'
    },
    {
      id: 16,
      user_id: 7,
      content: 'Great leaders listen more than they speak. Team building is about fostering trust.',
      image_url: null,
      created_at: '2026-08-30T16:15:00Z'
    },
    {
      id: 17,
      user_id: 8,
      content: 'Testing REST APIs with automated integration suites saves hundreds of hours of manual verification.',
      image_url: null,
      created_at: '2026-08-30T11:40:00Z'
    },
    {
      id: 18,
      user_id: 9,
      content: 'Accessibility is not an afterthought. High contrast ratios and semantic HTML make software better for everyone.',
      image_url: null,
      created_at: '2026-08-29T18:20:00Z'
    },
    {
      id: 19,
      user_id: 10,
      content: 'Store passwords with bcrypt using high work factors to keep user credentials safe.',
      image_url: null,
      created_at: '2026-08-29T13:00:00Z'
    },
    {
      id: 20,
      user_id: 1,
      content: 'Gather platform is now live! Clean typography, warm color tones, zero clutter.',
      image_url: null,
      created_at: '2026-08-28T09:00:00Z'
    }
  ];

  const comments = [
    { id: 1, post_id: 1, user_id: 3, content: 'Totally agree! Normalization vs indexing trade-offs are always tricky.', created_at: '2026-09-06T07:45:00Z' },
    { id: 2, post_id: 1, user_id: 5, content: 'Great insight Ahmed. Foreign keys and explicit constraints save so much headache down the line.', created_at: '2026-09-06T08:10:00Z' },
    { id: 3, post_id: 2, user_id: 1, content: 'Looking forward to attending! Great initiative Ayaan.', created_at: '2026-09-06T06:30:00Z' },
    { id: 4, post_id: 2, user_id: 4, content: 'Will there be a live stream recorded for those outside Hargeisa?', created_at: '2026-09-06T06:45:00Z' },
    { id: 5, post_id: 3, user_id: 2, content: 'Clean Code is essential reading for every junior developer.', created_at: '2026-09-05T19:00:00Z' },
    { id: 6, post_id: 4, user_id: 9, content: 'The coastal lighting in Berbera is breathtaking.', created_at: '2026-09-05T16:00:00Z' },
    { id: 7, post_id: 5, user_id: 8, content: 'Spot on Hodan. Solving genuine problems creates real value.', created_at: '2026-09-05T12:00:00Z' },
    { id: 8, post_id: 6, user_id: 10, content: 'Async/await with connection pooling is a game changer.', created_at: '2026-09-04T20:30:00Z' },
    { id: 9, post_id: 10, user_id: 2, content: 'Happy to be part of the community!', created_at: '2026-09-03T09:30:00Z' },
    { id: 10, post_id: 10, user_id: 3, content: 'The visual theme feels so calm and human.', created_at: '2026-09-03T10:00:00Z' }
  ];

  const likes = [
    { id: 1, user_id: 1, post_id: 1 },
    { id: 2, user_id: 3, post_id: 1 },
    { id: 3, user_id: 5, post_id: 1 },
    { id: 4, user_id: 1, post_id: 2 },
    { id: 5, user_id: 2, post_id: 2 },
    { id: 6, user_id: 4, post_id: 2 },
    { id: 7, user_id: 5, post_id: 2 },
    { id: 8, user_id: 2, post_id: 3 },
    { id: 9, user_id: 3, post_id: 3 },
    { id: 10, user_id: 9, post_id: 4 },
    { id: 11, user_id: 7, post_id: 5 },
    { id: 12, user_id: 8, post_id: 5 },
    { id: 13, user_id: 1, post_id: 10 },
    { id: 14, user_id: 2, post_id: 10 },
    { id: 15, user_id: 3, post_id: 10 }
  ];

  const follows = [
    { id: 1, follower_id: 1, following_id: 2 },
    { id: 2, follower_id: 1, following_id: 3 },
    { id: 3, follower_id: 2, following_id: 1 },
    { id: 4, follower_id: 2, following_id: 3 },
    { id: 5, follower_id: 3, following_id: 1 },
    { id: 6, follower_id: 3, following_id: 2 },
    { id: 7, follower_id: 4, following_id: 1 },
    { id: 8, follower_id: 5, following_id: 2 },
    { id: 9, follower_id: 6, following_id: 1 },
    { id: 10, follower_id: 7, following_id: 3 },
    { id: 11, follower_id: 8, following_id: 2 },
    { id: 12, follower_id: 9, following_id: 3 },
    { id: 13, follower_id: 10, following_id: 1 },
    { id: 14, follower_id: 4, following_id: 5 },
    { id: 15, follower_id: 5, following_id: 7 }
  ];

  const bookmarks = [
    { id: 1, user_id: 1, post_id: 1 },
    { id: 2, user_id: 1, post_id: 2 },
    { id: 3, user_id: 2, post_id: 3 },
    { id: 4, user_id: 3, post_id: 5 }
  ];

  const notifications = [
    { id: 1, recipient_id: 1, actor_id: 3, post_id: null, type: 'follow', is_read: false, created_at: '2026-09-06T09:20:00Z' },
    { id: 2, recipient_id: 1, actor_id: 2, post_id: 10, type: 'like', is_read: false, created_at: '2026-09-06T09:05:00Z' },
    { id: 3, recipient_id: 1, actor_id: 5, post_id: 10, type: 'comment', is_read: true, created_at: '2026-09-06T08:30:00Z' }
  ];

  return { users, posts, comments, likes, follows, bookmarks, notifications };
}

module.exports = { getSeedData };
