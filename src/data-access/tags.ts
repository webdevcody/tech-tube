import { eq, and, inArray, sql } from "drizzle-orm";
import { database } from "~/db";
import { 
  tag, 
  userTag, 
  user,
  video,
  type Tag, 
  type UserTag, 
  type CreateTagData,
  type CreateUserTagData 
} from "~/db/schema";
import { nanoid } from "nanoid";

export async function findAllTags(): Promise<Tag[]> {
  return await database
    .select()
    .from(tag)
    .orderBy(tag.name);
}

export async function findTagByName(name: string): Promise<Tag | null> {
  const [result] = await database
    .select()
    .from(tag)
    .where(eq(tag.name, name))
    .limit(1);

  return result || null;
}

export async function createTag(data: Omit<CreateTagData, "id">): Promise<Tag> {
  const [newTag] = await database
    .insert(tag)
    .values({
      id: nanoid(),
      ...data,
    })
    .returning();

  return newTag;
}

export async function findOrCreateTag(name: string, description?: string): Promise<Tag> {
  const existingTag = await findTagByName(name);
  if (existingTag) {
    return existingTag;
  }

  return await createTag({ name, description });
}

export async function findUserTags(userId: string): Promise<(UserTag & { tag: Tag })[]> {
  return await database
    .select({
      id: userTag.id,
      userId: userTag.userId,
      tagId: userTag.tagId,
      createdAt: userTag.createdAt,
      tag: tag,
    })
    .from(userTag)
    .innerJoin(tag, eq(userTag.tagId, tag.id))
    .where(eq(userTag.userId, userId));
}

export async function addUserTag(userId: string, tagId: string): Promise<UserTag> {
  const [newUserTag] = await database
    .insert(userTag)
    .values({
      id: nanoid(),
      userId,
      tagId,
    })
    .returning();

  return newUserTag;
}

export async function removeUserTag(userId: string, tagId: string): Promise<void> {
  await database
    .delete(userTag)
    .where(and(eq(userTag.userId, userId), eq(userTag.tagId, tagId)));
}

export async function findUsersByTags(tagNames: string[]): Promise<{
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  tags: Tag[];
  videoCount: number;
}[]> {
  if (tagNames.length === 0) {
    return [];
  }

  const result = await database
    .select({
      user: user,
      tag: tag,
      videoCount: sql<number>`count(distinct ${video.id})`.as("video_count"),
    })
    .from(user)
    .innerJoin(userTag, eq(user.id, userTag.userId))
    .innerJoin(tag, eq(userTag.tagId, tag.id))
    .leftJoin(video, eq(user.id, video.userId))
    .where(inArray(tag.name, tagNames))
    .groupBy(user.id, tag.id);

  // Group users and their tags
  const userMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    tags: Tag[];
    videoCount: number;
  }>();

  for (const row of result) {
    const userId = row.user.id;
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        image: row.user.image,
        bio: row.user.bio,
        tags: [],
        videoCount: row.videoCount || 0,
      });
    }
    userMap.get(userId)!.tags.push(row.tag);
  }

  return Array.from(userMap.values());
}

export async function findCreators(): Promise<{
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  tags: Tag[];
  videoCount: number;
}[]> {
  const result = await database
    .select({
      user: user,
      tag: tag,
      videoCount: sql<number>`count(distinct ${video.id})`.as("video_count"),
    })
    .from(user)
    .leftJoin(userTag, eq(user.id, userTag.userId))
    .leftJoin(tag, eq(userTag.tagId, tag.id))
    .leftJoin(video, eq(user.id, video.userId))
    .groupBy(user.id, tag.id)
    .orderBy(user.name);

  // Group users and their tags
  const userMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    tags: Tag[];
    videoCount: number;
  }>();

  for (const row of result) {
    const userId = row.user.id;
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        image: row.user.image,
        bio: row.user.bio,
        tags: [],
        videoCount: row.videoCount || 0,
      });
    }
    if (row.tag) {
      userMap.get(userId)!.tags.push(row.tag);
    }
  }

  return Array.from(userMap.values());
}