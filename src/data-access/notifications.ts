import { eq, desc, count, sql, and, or } from "drizzle-orm";
import { database } from "~/db";
import {
  notification,
  user,
  video,
  comment,
  type Notification,
  type CreateNotificationData,
  type UpdateNotificationData,
} from "~/db/schema";

export interface NotificationWithDetails extends Notification {
  video?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
  triggeredByUser?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export async function findNotificationsByUserId(
  userId: string,
  filter?: "read" | "unread"
): Promise<NotificationWithDetails[]> {
  let whereCondition = eq(notification.userId, userId);
  
  if (filter === "read") {
    whereCondition = and(eq(notification.userId, userId), eq(notification.isRead, true));
  } else if (filter === "unread") {
    whereCondition = and(eq(notification.userId, userId), eq(notification.isRead, false));
  }

  return await database
    .select({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      userId: notification.userId,
      videoId: notification.videoId,
      commentId: notification.commentId,
      triggeredByUserId: notification.triggeredByUserId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
      },
      comment: {
        id: comment.id,
        content: comment.content,
      },
      triggeredByUser: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(notification)
    .leftJoin(video, eq(notification.videoId, video.id))
    .leftJoin(comment, eq(notification.commentId, comment.id))
    .leftJoin(user, eq(notification.triggeredByUserId, user.id))
    .where(whereCondition)
    .orderBy(desc(notification.createdAt));
}

export async function createNotification(
  notificationData: CreateNotificationData
): Promise<Notification> {
  const [newNotification] = await database
    .insert(notification)
    .values({
      ...notificationData,
      updatedAt: new Date(),
    })
    .returning();

  return newNotification;
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await database
    .update(notification)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<number> {
  const result = await database
    .update(notification)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.isRead, false)
      )
    )
    .returning();

  return result.length;
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const [result] = await database
    .select({
      count: count(notification.id),
    })
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.isRead, false)
      )
    );

  return result?.count || 0;
}

export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await database
    .delete(notification)
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId)
      )
    )
    .returning();

  return result.length > 0;
}

export async function findNotificationById(
  notificationId: string
): Promise<Notification | null> {
  const [result] = await database
    .select()
    .from(notification)
    .where(eq(notification.id, notificationId))
    .limit(1);

  return result || null;
}