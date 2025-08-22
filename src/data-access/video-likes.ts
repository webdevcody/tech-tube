import { eq, and, count } from "drizzle-orm";
import { database } from "~/db";
import { videoLike, type CreateVideoLikeData } from "~/db/schema";

export async function likeVideo(videoId: string, userId: string): Promise<void> {
  // Check if the user has already liked this video
  const existingLike = await database
    .select()
    .from(videoLike)
    .where(and(eq(videoLike.videoId, videoId), eq(videoLike.userId, userId)))
    .limit(1);

  if (existingLike.length === 0) {
    await database.insert(videoLike).values({
      id: crypto.randomUUID(),
      videoId,
      userId,
    });
  }
}

export async function unlikeVideo(videoId: string, userId: string): Promise<void> {
  await database
    .delete(videoLike)
    .where(and(eq(videoLike.videoId, videoId), eq(videoLike.userId, userId)));
}

export async function isVideoLikedByUser(videoId: string, userId: string): Promise<boolean> {
  const [result] = await database
    .select()
    .from(videoLike)
    .where(and(eq(videoLike.videoId, videoId), eq(videoLike.userId, userId)))
    .limit(1);

  return !!result;
}

export async function getVideoLikeCount(videoId: string): Promise<number> {
  const [result] = await database
    .select({ count: count() })
    .from(videoLike)
    .where(eq(videoLike.videoId, videoId));

  return result?.count || 0;
}