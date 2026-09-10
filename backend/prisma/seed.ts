import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GatherPlatform database...');

  // Clean existing data cleanly with CASCADE
  await prisma.$executeRawUnsafe('TRUNCATE TABLE notifications, bookmarks, likes, comments, follows, posts, users RESTART IDENTITY CASCADE;');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // Seed Users
  const user1 = await prisma.user.create({
    data: {
      fullName: 'Siddiiq Cawil',
      username: 'siddiiq',
      email: 'siddiiq@gather.com',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      bio: 'Full Stack Intern @ CodeAlpha. Building Gather Platform!',
      location: 'Hargeisa, Somaliland',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Ahmed Yusuf',
      username: 'ahmedy',
      email: 'ahmed@gather.com',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      bio: 'Spent the morning working on a small PostgreSQL project. Software developer and tech explorer.',
      location: 'Hargeisa, Somaliland',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      fullName: 'Ayaan Mohamed',
      username: 'ayaan_m',
      email: 'ayaan@gather.com',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      bio: 'Tech lead & open-source contributor. Excited about full-stack web dev.',
      location: 'Mogadishu, Somalia',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      fullName: 'Maryan Ali',
      username: 'maryan_a',
      email: 'maryan@gather.com',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      bio: 'UI/UX Designer and Frontend Advocate. Love clean architecture!',
      location: 'Nairobi, Kenya',
    },
  });

  console.log(` Created 4 users.`);

  // Seed Follows
  await prisma.follow.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user1.id, followingId: user3.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user3.id, followingId: user2.id },
    ],
  });

  // Seed Posts
  const post1 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'Spent the morning working on a small PostgreSQL project. Sometimes the simplest database designs are the hardest to get right. #PostgreSQL #Backend',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user3.id,
      content: 'Excited to announce our upcoming community tech meetup! We will be discussing modern full-stack development with #WebDevelopment and #TechCommunity.',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user4.id,
      content: 'Reading "Clean Code" by Robert C. Martin again this weekend. A timeless reminder that readable code is writing for humans first, machines second. #CleanCode #SoftwareEngineering',
    },
  });

  const post4 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'Gather Platform backend is now fully powered by TypeScript, Express, Prisma ORM and PostgreSQL! 🚀 #FullStack #CodeAlpha',
    },
  });

  console.log(` Created 4 posts.`);

  // Seed Likes
  await prisma.like.createMany({
    data: [
      { userId: user1.id, postId: post1.id },
      { userId: user3.id, postId: post1.id },
      { userId: user1.id, postId: post2.id },
      { userId: user2.id, postId: post4.id },
    ],
  });

  // Seed Bookmarks
  await prisma.bookmark.createMany({
    data: [
      { userId: user1.id, postId: post2.id },
      { userId: user1.id, postId: post3.id },
    ],
  });

  // Seed Comments
  await prisma.comment.createMany({
    data: [
      {
        userId: user3.id,
        postId: post1.id,
        content: 'Totally agree! Database design trade-offs are always tricky.',
      },
      {
        userId: user4.id,
        postId: post1.id,
        content: 'Great insight Ahmed. Foreign keys and explicit constraints save so much headache down the line.',
      },
      {
        userId: user1.id,
        postId: post2.id,
        content: 'Can not wait for the meetup! Counting down the days.',
      },
    ],
  });

  // Seed Notifications
  await prisma.notification.createMany({
    data: [
      { recipientId: user1.id, actorId: user2.id, type: 'follow' },
      { recipientId: user1.id, actorId: user2.id, postId: post4.id, type: 'like' },
      { recipientId: user2.id, actorId: user3.id, postId: post1.id, type: 'comment' },
    ],
  });

  console.log(' Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
