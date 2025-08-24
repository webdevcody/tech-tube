import { eq, desc, asc, sql, count, and, inArray, ne, ilike } from "drizzle-orm";
import { database } from "~/db";
import { video, videoLike, videoTag, tag, user, type Video, type CreateVideoData, type UpdateVideoData } from "~/db/schema";
import { nanoid } from "nanoid";

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

export async function incrementViewCount(id: string): Promise<void> {
  await database
    .update(video)
    .set({
      viewCount: sql`${video.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(video.id, id));
}

export type VideoWithLikes = Video & { 
  likeCount: number;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  tags?: {
    id: string;
    name: string;
  }[];
};

export async function findPopularVideosWithLikes(limit: number = 10): Promise<VideoWithLikes[]> {
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
      transcript: video.transcript,
      transcriptStatus: video.transcriptStatus,
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
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.viewCount))
    .limit(limit);

  const videos = result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));

  // Fetch tags for all videos
  const videoIds = videos.map(v => v.id);
  const tagsMap = await getTagsForVideos(videoIds);

  return videos.map(v => ({
    ...v,
    tags: tagsMap.get(v.id) || [],
  }));
}

export async function findRecentVideosWithLikes(limit: number = 10): Promise<VideoWithLikes[]> {
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
      transcript: video.transcript,
      transcriptStatus: video.transcriptStatus,
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
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.createdAt))
    .limit(limit);

  const videos = result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));

  // Fetch tags for all videos
  const videoIds = videos.map(v => v.id);
  const tagsMap = await getTagsForVideos(videoIds);

  return videos.map(v => ({
    ...v,
    tags: tagsMap.get(v.id) || [],
  }));
}

export async function updateVideo(id: string, updateData: UpdateVideoData): Promise<Video> {
  const [updatedVideo] = await database
    .update(video)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(video.id, id))
    .returning();

  return updatedVideo;
}

export async function findVideoTags(videoId: string): Promise<{
  id: string;
  videoId: string;
  tagId: string;
  createdAt: Date;
  tag: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
  };
}[]> {
  return await database
    .select({
      id: videoTag.id,
      videoId: videoTag.videoId,
      tagId: videoTag.tagId,
      createdAt: videoTag.createdAt,
      tag: tag,
    })
    .from(videoTag)
    .innerJoin(tag, eq(videoTag.tagId, tag.id))
    .where(eq(videoTag.videoId, videoId));
}

export async function addVideoTag(videoId: string, tagId: string): Promise<void> {
  await database
    .insert(videoTag)
    .values({
      id: nanoid(),
      videoId,
      tagId,
    });
}

export async function removeVideoTag(videoId: string, tagId: string): Promise<void> {
  await database
    .delete(videoTag)
    .where(and(eq(videoTag.videoId, videoId), eq(videoTag.tagId, tagId)));
}

export async function removeAllVideoTags(videoId: string): Promise<void> {
  await database
    .delete(videoTag)
    .where(eq(videoTag.videoId, videoId));
}

export async function findVideosByTagWithLikes(tagName: string, limit: number = 10): Promise<VideoWithLikes[]> {
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
      transcript: video.transcript,
      transcriptStatus: video.transcriptStatus,
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
    .innerJoin(videoTag, eq(video.id, videoTag.videoId))
    .innerJoin(tag, eq(videoTag.tagId, tag.id))
    .leftJoin(videoLike, eq(video.id, videoLike.videoId))
    .where(eq(tag.name, tagName))
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.createdAt))
    .limit(limit);

  const videos = result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));

  // Fetch tags for all videos
  const videoIds = videos.map(v => v.id);
  const tagsMap = await getTagsForVideos(videoIds);

  return videos.map(v => ({
    ...v,
    tags: tagsMap.get(v.id) || [],
  }));
}

export async function findRelatedVideosByTags(excludeVideoId: string, tagNames: string[], limit: number = 5): Promise<VideoWithLikes[]> {
  if (tagNames.length === 0) {
    return [];
  }

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
      transcript: video.transcript,
      transcriptStatus: video.transcriptStatus,
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
    .innerJoin(videoTag, eq(video.id, videoTag.videoId))
    .innerJoin(tag, eq(videoTag.tagId, tag.id))
    .leftJoin(videoLike, eq(video.id, videoLike.videoId))
    .where(
      and(
        inArray(tag.name, tagNames),
        ne(video.id, excludeVideoId)
      )
    )
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(desc(video.createdAt))
    .limit(limit);

  const videos = result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));

  // Fetch tags for all videos
  const videoIds = videos.map(v => v.id);
  const tagsMap = await getTagsForVideos(videoIds);

  return videos.map(v => ({
    ...v,
    tags: tagsMap.get(v.id) || [],
  }));
}

// Helper function to get tags for videos
async function getTagsForVideos(videoIds: string[]): Promise<Map<string, Array<{ id: string; name: string }>>> {
  if (videoIds.length === 0) return new Map();
  
  const tags = await database
    .select({
      videoId: videoTag.videoId,
      tagId: tag.id,
      tagName: tag.name,
    })
    .from(videoTag)
    .innerJoin(tag, eq(videoTag.tagId, tag.id))
    .where(inArray(videoTag.videoId, videoIds));
  
  const tagsMap = new Map<string, Array<{ id: string; name: string }>>();
  tags.forEach(t => {
    if (!tagsMap.has(t.videoId)) {
      tagsMap.set(t.videoId, []);
    }
    tagsMap.get(t.videoId)!.push({ id: t.tagId, name: t.tagName });
  });
  
  return tagsMap;
}

export async function searchVideosByTitle(
  searchQuery: string, 
  sortBy: 'views_asc' | 'views_desc' | 'date_asc' | 'date_desc' = 'date_desc',
  limit: number = 20
): Promise<VideoWithLikes[]> {
  const orderByClause = 
    sortBy === 'views_asc' ? asc(video.viewCount) :
    sortBy === 'views_desc' ? desc(video.viewCount) :
    sortBy === 'date_asc' ? asc(video.createdAt) :
    desc(video.createdAt);

  const whereClause = searchQuery ? ilike(video.title, `%${searchQuery}%`) : undefined;

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
      transcript: video.transcript,
      transcriptStatus: video.transcriptStatus,
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
    .where(whereClause)
    .groupBy(video.id, user.id, user.name, user.image)
    .orderBy(orderByClause)
    .limit(limit);

  const videos = result.map(row => ({
    ...row,
    likeCount: Number(row.likeCount),
  }));

  // Fetch tags for all videos
  const videoIds = videos.map(v => v.id);
  const tagsMap = await getTagsForVideos(videoIds);

  return videos.map(v => ({
    ...v,
    tags: tagsMap.get(v.id) || [],
  }));
}
