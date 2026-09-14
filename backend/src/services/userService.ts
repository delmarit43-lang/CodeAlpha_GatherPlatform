import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { UpdateProfileInput } from '../validators/schemas';
import { UserProfile, SafeUser } from '../types';

function formatUser(user: {
  id: number; fullName: string; username: string; email: string;
  avatarUrl: string | null; coverUrl?: string | null; bio: string | null; location: string | null; createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    full_name: user.fullName,
    username: user.username,
    email: user.email,
    avatar_url: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=ffffff&bold=true&size=128`,
    cover_url: user.coverUrl || null,
    bio: user.bio,
    location: user.location,
    created_at: user.createdAt,
  };
}

export async function getUserProfile(username: string, currentUserId: number): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      followers: {
        where: { followerId: currentUserId },
        select: { id: true },
      },
    },
  });

  if (!user) throw new AppError('User not found.', 404);

  return {
    ...formatUser(user),
    posts_count: user._count.posts,
    followers_count: user._count.followers,
    following_count: user._count.following,
    is_following: user.followers.length > 0,
  };
}

export async function updateProfile(userId: number, data: UpdateProfileInput): Promise<SafeUser> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.full_name !== undefined && { fullName: data.full_name }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.avatar_url !== undefined && { avatarUrl: data.avatar_url || null }),
      ...(data.cover_url !== undefined && { coverUrl: data.cover_url || null }),
    },
  });
  return formatUser(updated);
}

export async function searchUsers(query: string, currentUserId: number) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      followers: {
        where: { followerId: currentUserId },
        select: { id: true },
      },
    },
    take: 20,
  });

  return users.map(u => ({
    id: u.id,
    full_name: u.fullName,
    username: u.username,
    avatar_url: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=6366f1&color=ffffff&bold=true&size=128`,
    bio: u.bio,
    is_following: u.followers.length > 0,
  }));
}

export async function followUser(followerId: number, targetUserId: number) {
  if (followerId === targetUserId) {
    throw new AppError('You cannot follow yourself.', 400);
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError('User not found.', 404);

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetUserId } },
  });

  if (existing) throw new AppError('Already following this user.', 409);

  await prisma.$transaction([
    prisma.follow.create({ data: { followerId, followingId: targetUserId } }),
    prisma.notification.create({
      data: { recipientId: targetUserId, actorId: followerId, type: 'follow' },
    }),
  ]);

  return { success: true, message: 'Followed user.' };
}

export async function unfollowUser(followerId: number, targetUserId: number) {
  await prisma.follow.deleteMany({
    where: { followerId, followingId: targetUserId },
  });
  return { success: true, message: 'Unfollowed user.' };
}
