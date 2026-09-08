import { prisma } from '../lib/prisma';
import { PostWithMeta } from '../types';

function formatBookmarkedPost(item: {
  post: {
    id: number; userId: number; content: string; imageUrl: string | null; createdAt: Date;
    user: { id: number; fullName: string; username: string; avatarUrl: string | null };
    _count: { likes: number; comments: number };
    likes: { id: number }[];
    bookmarks: { id: number }[];
  };
}): PostWithMeta {
  const p = item.post;
  return {
    id: p.id,
    user_id: p.userId,
    content: p.content,
    image_url: p.imageUrl,
    created_at: p.createdAt,
    user: {
      id: p.user.id,
      full_name: p.user.fullName,
      username: p.user.username,
      avatar_url: p.user.avatarUrl,
    },
    like_count: p._count.likes,
    comment_count: p._count.comments,
    is_liked: p.likes.length > 0,
    is_bookmarked: true,
  };
}

export async function getBookmarks(userId: number): Promise<PostWithMeta[]> {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      post: {
        include: {
          user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId }, select: { id: true } },
          bookmarks: { where: { userId }, select: { id: true } },
        },
      },
    },
  });

  return bookmarks.map(formatBookmarkedPost);
}

export async function addBookmark(userId: number, postId: number) {
  await prisma.bookmark.upsert({
    where: { userId_postId: { userId, postId } },
    update: {},
    create: { userId, postId },
  });
  return { success: true, message: 'Bookmarked.' };
}

export async function removeBookmark(userId: number, postId: number) {
  await prisma.bookmark.deleteMany({ where: { userId, postId } });
  return { success: true, message: 'Bookmark removed.' };
}
