import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateCommentInput } from '../validators/schemas';
import { CommentWithUser } from '../types';

function formatComment(c: {
  id: number; userId: number; postId: number; content: string; createdAt: Date;
  user: { id: number; fullName: string; username: string; avatarUrl: string | null };
}): CommentWithUser {
  return {
    id: c.id,
    user_id: c.userId,
    post_id: c.postId,
    content: c.content,
    created_at: c.createdAt,
    user: {
      id: c.user.id,
      full_name: c.user.fullName,
      username: c.user.username,
      avatar_url: c.user.avatarUrl,
    },
  };
}

export async function getComments(postId: number): Promise<CommentWithUser[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
    },
  });
  return comments.map(formatComment);
}

export async function createComment(
  userId: number,
  postId: number,
  data: CreateCommentInput
): Promise<CommentWithUser> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post not found.', 404);

  const comment = await prisma.comment.create({
    data: { userId, postId, content: data.content },
    include: {
      user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
    },
  });

  // Notify post owner (not if commenting on own post)
  if (post.userId !== userId) {
    await prisma.notification.create({
      data: { recipientId: post.userId, actorId: userId, postId, type: 'comment' },
    }).catch(() => {}); // non-blocking
  }

  return formatComment(comment);
}

export async function deleteComment(commentId: number, userId: number) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError('Comment not found.', 404);
  if (comment.userId !== userId) throw new AppError('Not authorized to delete this comment.', 403);

  await prisma.comment.delete({ where: { id: commentId } });
  return { success: true, message: 'Comment deleted.' };
}
