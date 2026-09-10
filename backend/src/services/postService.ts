import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreatePostInput } from '../validators/schemas';
import { PostWithMeta } from '../types';

function formatPost(row: {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  user: { id: number; fullName: string; username: string; avatarUrl: string | null };
  _count: { likes: number; comments: number };
  likes: { id: number }[];
  bookmarks: { id: number }[];
}): PostWithMeta {
  return {
    id: row.id,
    user_id: row.userId,
    content: row.content,
    image_url: row.imageUrl,
    created_at: row.createdAt,
    user: {
      id: row.user.id,
      full_name: row.user.fullName,
      username: row.user.username,
      avatar_url: row.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.user.fullName)}&background=6366f1&color=ffffff&bold=true&size=128`,
    },
    like_count: row._count.likes,
    comment_count: row._count.comments,
    is_liked: row.likes.length > 0,
    is_bookmarked: row.bookmarks.length > 0,
  };
}

const postInclude = (currentUserId: number) => ({
  user: {
    select: { id: true, fullName: true, username: true, avatarUrl: true },
  },
  _count: { select: { likes: true, comments: true } },
  likes: {
    where: { userId: currentUserId },
    select: { id: true },
  },
  bookmarks: {
    where: { userId: currentUserId },
    select: { id: true },
  },
});

export async function getFeedPosts(currentUserId: number): Promise<PostWithMeta[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: postInclude(currentUserId),
  });
  return posts.map(formatPost);
}

export async function getPostById(postId: number, currentUserId: number): Promise<PostWithMeta> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude(currentUserId),
  });
  if (!post) throw new AppError('Post not found.', 404);
  return formatPost(post);
}

export async function getPostsByUser(
  username: string,
  currentUserId: number,
  tab: string
): Promise<PostWithMeta[]> {
  if (tab === 'likes') {
    const likes = await prisma.like.findMany({
      where: { user: { username: username.toLowerCase() } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        post: {
          include: postInclude(currentUserId),
        },
      },
    });
    return likes.map(l => formatPost(l.post));
  }

  const posts = await prisma.post.findMany({
    where: { user: { username: username.toLowerCase() } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: postInclude(currentUserId),
  });
  return posts.map(formatPost);
}

export async function createPost(
  userId: number,
  data: CreatePostInput
): Promise<PostWithMeta> {
  const post = await prisma.post.create({
    data: {
      userId,
      content: data.content,
      imageUrl: data.image_url || null,
    },
    include: postInclude(userId),
  });
  return formatPost(post);
}

export async function deletePost(postId: number, userId: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post not found.', 404);
  if (post.userId !== userId) throw new AppError('Not authorized to delete this post.', 403);

  await prisma.post.delete({ where: { id: postId } });
  return { success: true, message: 'Post deleted.' };
}
