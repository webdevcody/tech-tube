import { eq, desc, count, sql, and } from "drizzle-orm";
import { database } from "~/db";
import {
  comment,
  user,
  video,
  commentLike,
  type Comment,
  type CreateCommentData,
  type CreateCommentLikeData,
} from "~/db/schema";

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  likeCount: number;
  isLikedByUser: boolean;
}

export interface CommentWithVideo extends Comment {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    viewCount: number;
    createdAt: Date;
  };
  likeCount: number;
  isLikedByUser: boolean;
}

export async function findCommentsByVideoId(
  videoId: string,
  currentUserId?: string
): Promise<CommentWithUser[]> {
  // TODO: look into making this more performant if possible
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
        email: user.email,
        image: user.image,
      },
      likeCount: sql<number>`cast(count(${commentLike.id}) as int)`,
      isLikedByUser: currentUserId 
        ? sql<boolean>`count(case when ${commentLike.userId} = ${currentUserId} then 1 end) > 0`
        : sql<boolean>`false`,
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .leftJoin(commentLike, eq(comment.id, commentLike.commentId))
    .where(eq(comment.videoId, videoId))
    .groupBy(comment.id, user.id)
    .orderBy(desc(comment.createdAt));
}

export async function createComment(
  commentData: CreateCommentData
): Promise<Comment> {
  const [newComment] = await database
    .insert(comment)
    .values({
      ...commentData,
      updatedAt: new Date(),
    })
    .returning();

  return newComment;
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  const result = await database
    .delete(comment)
    .where(eq(comment.id, commentId))
    .returning();

  return result.length > 0;
}

export async function findCommentById(
  commentId: string
): Promise<Comment | null> {
  const [result] = await database
    .select()
    .from(comment)
    .where(eq(comment.id, commentId))
    .limit(1);

  return result || null;
}

export async function findCommentsByUserId(
  userId: string,
  currentUserId?: string
): Promise<CommentWithVideo[]> {
  // TODO: verify this is performant
  return await database
    .select({
      id: comment.id,
      content: comment.content,
      videoId: comment.videoId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      video: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        viewCount: video.viewCount,
        createdAt: video.createdAt,
      },
      likeCount: sql<number>`cast(count(${commentLike.id}) as int)`,
      isLikedByUser: currentUserId 
        ? sql<boolean>`count(case when ${commentLike.userId} = ${currentUserId} then 1 end) > 0`
        : sql<boolean>`false`,
    })
    .from(comment)
    .innerJoin(video, eq(comment.videoId, video.id))
    .leftJoin(commentLike, eq(comment.id, commentLike.commentId))
    .where(eq(comment.userId, userId))
    .groupBy(comment.id, video.id)
    .orderBy(desc(comment.createdAt));
}

export async function createCommentLike(
  commentId: string,
  userId: string
): Promise<void> {
  await database.insert(commentLike).values({
    id: crypto.randomUUID(),
    commentId,
    userId,
  });
}

export async function deleteCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  const result = await database
    .delete(commentLike)
    .where(
      and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId))
    )
    .returning();

  return result.length > 0;
}

export async function findCommentLike(
  commentId: string,
  userId: string
): Promise<boolean> {
  const [result] = await database
    .select()
    .from(commentLike)
    .where(
      and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId))
    )
    .limit(1);

  return !!result;
}
