import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function likePost(userId: number, postId: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post not found.', 404);

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) return { success: true, message: 'Already liked.' };

  await prisma.$transaction([
    prisma.like.create({ data: { userId, postId } }),
    ...(post.userId !== userId
      ? [prisma.notification.create({
          data: { recipientId: post.userId, actorId: userId, postId, type: 'like' },
        })]
      : []),
  ]);

  return { success: true, message: 'Liked post.' };
}

export async function unlikePost(userId: number, postId: number) {
  await prisma.like.deleteMany({ where: { userId, postId } });
  return { success: true, message: 'Unliked post.' };
}
