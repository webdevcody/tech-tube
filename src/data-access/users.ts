import { desc, eq, count } from "drizzle-orm";
import { database } from "~/db";
import { user, video, videoLike, type User, type Video } from "~/db/schema";
import type { VideoWithLikes } from "./videos";

export async function findUserById(id: string): Promise<User | null> {
  const [result] = await database
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return result || null;
}

export async function findVideosByUserId(userId: string): Promise<VideoWithLikes[]> {
  const result = await database
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      cloudinaryId: video.cloudinaryId,
      status: video.status,
      duration: video.duration,
      viewCount: video.viewCount,
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
    .leftJoin(videoLike, eq(video.id, videoLike.videoId))
    .where(eq(video.userId, userId))
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.createdAt));

  return result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));
}

export async function updateUser(
  id: string,
  data: { name?: string; bio?: string | null; image?: string | null }
): Promise<User> {
  const [updatedUser] = await database
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();

  return updatedUser;
}
