import { eq, desc } from "drizzle-orm";
import { database } from "~/db";
import { video, type Video, type CreateVideoData } from "~/db/schema";

export async function findVideoById(id: string): Promise<Video | null> {
  const [result] = await database
    .select()
    .from(video)
    .where(eq(video.id, id))
    .limit(1);

  return result || null;
}

export async function createVideo(videoData: CreateVideoData): Promise<Video> {
  const [newVideo] = await database
    .insert(video)
    .values({
      ...videoData,
      updatedAt: new Date(),
    })
    .returning();

  return newVideo;
}

export async function findPopularVideos(limit: number = 10): Promise<Video[]> {
  return await database
    .select()
    .from(video)
    // Temporarily show all videos regardless of status
    // .where(eq(video.status, "published"))
    .orderBy(desc(video.viewCount))
    .limit(limit);
}

export async function findRecentVideos(limit: number = 10): Promise<Video[]> {
  return await database
    .select()
    .from(video)
    // Temporarily show all videos regardless of status
    // .where(eq(video.status, "published"))
    .orderBy(desc(video.createdAt))
    .limit(limit);
}
