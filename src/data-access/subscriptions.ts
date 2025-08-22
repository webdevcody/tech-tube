import { eq, and, count, desc } from "drizzle-orm";
import { database } from "~/db";
import {
  subscription,
  user,
  video,
  videoLike,
  comment,
  type Subscription,
  type CreateSubscriptionData,
} from "~/db/schema";
import type { VideoWithLikes } from "./videos";

export async function createSubscription(
  subscriptionData: CreateSubscriptionData
): Promise<Subscription> {
  const [newSubscription] = await database
    .insert(subscription)
    .values({
      ...subscriptionData,
    })
    .returning();

  return newSubscription;
}

export async function deleteSubscription(
  subscriberId: string,
  subscribedToId: string
): Promise<void> {
  await database
    .delete(subscription)
    .where(
      and(
        eq(subscription.subscriberId, subscriberId),
        eq(subscription.subscribedToId, subscribedToId)
      )
    );
}

export async function findSubscription(
  subscriberId: string,
  subscribedToId: string
): Promise<Subscription | null> {
  const [result] = await database
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.subscriberId, subscriberId),
        eq(subscription.subscribedToId, subscribedToId)
      )
    )
    .limit(1);

  return result || null;
}

export async function findUserSubscriptions(userId: string): Promise<
  (Subscription & {
    subscribedTo: {
      id: string;
      name: string;
      image: string | null;
    };
  })[]
> {
  return await database
    .select({
      id: subscription.id,
      subscriberId: subscription.subscriberId,
      subscribedToId: subscription.subscribedToId,
      createdAt: subscription.createdAt,
      subscribedTo: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(subscription)
    .innerJoin(user, eq(subscription.subscribedToId, user.id))
    .where(eq(subscription.subscriberId, userId));
}

export async function findUserSubscribers(userId: string): Promise<
  (Subscription & {
    subscriber: {
      id: string;
      name: string;
      image: string | null;
    };
  })[]
> {
  return await database
    .select({
      id: subscription.id,
      subscriberId: subscription.subscriberId,
      subscribedToId: subscription.subscribedToId,
      createdAt: subscription.createdAt,
      subscriber: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(subscription)
    .innerJoin(user, eq(subscription.subscriberId, user.id))
    .where(eq(subscription.subscribedToId, userId));
}

export async function getSubscriptionCount(userId: string): Promise<number> {
  const [result] = await database
    .select({ count: count() })
    .from(subscription)
    .where(eq(subscription.subscribedToId, userId));

  return result?.count || 0;
}

export async function getSubscribingCount(userId: string): Promise<number> {
  const [result] = await database
    .select({ count: count() })
    .from(subscription)
    .where(eq(subscription.subscriberId, userId));

  return result?.count || 0;
}

export async function getSubscribedUsersVideos(
  userId: string,
  limit: number = 20
): Promise<VideoWithLikes[]> {
  const result = await database
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      cloudinaryId: video.cloudinaryId,
      duration: video.duration,
      viewCount: video.viewCount,
      status: video.status,
      userId: video.userId,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      likeCount: count(videoLike.id),
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(video)
    .innerJoin(user, eq(video.userId, user.id))
    .innerJoin(subscription, eq(subscription.subscribedToId, video.userId))
    .leftJoin(videoLike, eq(video.id, videoLike.videoId))
    .where(eq(subscription.subscriberId, userId))
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.createdAt))
    .limit(limit);

  return result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));
}

export async function getSubscribedUsersComments(
  userId: string,
  limit: number = 20
) {
  return await database
    .select({
      id: comment.id,
      content: comment.content,
      videoId: comment.videoId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .innerJoin(video, eq(comment.videoId, video.id))
    .innerJoin(subscription, eq(subscription.subscribedToId, comment.userId))
    .where(eq(subscription.subscriberId, userId))
    .orderBy(desc(comment.createdAt))
    .limit(limit);
}
