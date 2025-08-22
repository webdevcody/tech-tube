import { createServerFn } from "@tanstack/react-start";
import {
  findAllTags,
  findOrCreateTag,
  findUserTags,
  addUserTag,
  removeUserTag,
  findCreators,
  findUsersByTags,
} from "~/data-access/tags";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";

export const getAllTagsFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return await findAllTags();
});

export const getUserTagsFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    return await findUserTags(data.userId);
  });

export const addUserTagFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      tagName: z.string().min(1).max(50),
      description: z.string().max(200).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const tag = await findOrCreateTag(data.tagName, data.description);
    const userTag = await addUserTag(context.userId, tag.id);

    return {
      id: userTag.id,
      tag,
    };
  });

export const removeUserTagFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ tagId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    await removeUserTag(context.userId, data.tagId);
    return { success: true };
  });

export const getCreatorsFn = createServerFn({
  method: "GET",
})
  .validator(
    z
      .object({
        tags: z.array(z.string()).optional(),
      })
      .optional()
  )
  .handler(async ({ data }) => {
    if (data?.tags && data.tags.length > 0) {
      return await findUsersByTags(data.tags);
    }
    return await findCreators();
  });
