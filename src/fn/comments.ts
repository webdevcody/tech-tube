import { createServerFn } from "@tanstack/react-start";
import {
  findCommentsByVideoId,
  createComment,
  deleteComment,
  findCommentById,
  findCommentsByUserId,
  createCommentLike,
  deleteCommentLike,
  findCommentLike,
} from "~/data-access/comments";
import { z } from "zod";
import { authenticatedMiddleware, optionalAuthentication } from "./middleware";

export const getCommentsByVideoIdFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ videoId: z.string() }))
  .middleware([optionalAuthentication])
  .handler(async ({ data, context }) => {
    const currentUserId = context?.userId;
    return await findCommentsByVideoId(data.videoId, currentUserId);
  });

export const createCommentFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      content: z
        .string()
        .min(1, "Comment cannot be empty")
        .max(1000, "Comment is too long"),
      videoId: z.string(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const commentData = {
      id: crypto.randomUUID(),
      content: data.content,
      videoId: data.videoId,
      userId: context.userId,
    };

    const newComment = await createComment(commentData);
    return newComment;
  });

export const deleteCommentFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ commentId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const commentToDelete = await findCommentById(data.commentId);

    if (!commentToDelete) {
      throw new Error("Comment not found");
    }

    if (commentToDelete.userId !== context.userId) {
      throw new Error("You can only delete your own comments");
    }

    const success = await deleteComment(data.commentId, context.userId);

    if (!success) {
      throw new Error("Failed to delete comment");
    }

    return { success: true };
  });

export const getCommentsByUserIdFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ userId: z.string() }))
  .middleware([optionalAuthentication])
  .handler(async ({ data, context }) => {
    const currentUserId = context?.userId;
    return await findCommentsByUserId(data.userId, currentUserId);
  });

export const toggleCommentLikeFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ commentId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { commentId } = data;
    const userId = context.userId;

    const isLiked = await findCommentLike(commentId, userId);

    if (isLiked) {
      await deleteCommentLike(commentId, userId);
      return { liked: false };
    } else {
      await createCommentLike(commentId, userId);
      return { liked: true };
    }
  });
