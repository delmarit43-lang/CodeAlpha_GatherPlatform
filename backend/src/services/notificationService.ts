import { prisma } from '../lib/prisma';
import { NotificationWithActor } from '../types';

function formatNotification(n: {
  id: number; type: string; isRead: boolean; createdAt: Date; postId: number | null;
  actor: { id: number; fullName: string; username: string; avatarUrl: string | null };
}): NotificationWithActor {
  return {
    id: n.id,
    type: n.type,
    is_read: n.isRead,
    created_at: n.createdAt,
    post_id: n.postId,
    actor: {
      id: n.actor.id,
      full_name: n.actor.fullName,
      username: n.actor.username,
      avatar_url: n.actor.avatarUrl,
    },
  };
}

export async function getNotifications(userId: number): Promise<NotificationWithActor[]> {
  const items = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      actor: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
    },
  });
  return items.map(formatNotification);
}

export async function markAllRead(userId: number) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
  return { success: true, message: 'All notifications marked as read.' };
}

export async function markOneRead(notificationId: number, userId: number) {
  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { isRead: true },
  });
  return { success: true };
}
