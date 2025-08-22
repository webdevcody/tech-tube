import { desc, eq } from "drizzle-orm";
import { database } from "~/db";
import { user, video, type User, type Video } from "~/db/schema";

export async function findUserById(id: string): Promise<User | null> {
  const [result] = await database
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return result || null;
}

export async function findVideosByUserId(userId: string): Promise<Video[]> {
  return await database
    .select()
    .from(video)
    .where(eq(video.userId, userId))
    .orderBy(desc(video.createdAt));
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
