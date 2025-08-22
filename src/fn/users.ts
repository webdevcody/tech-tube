import { createServerFn } from "@tanstack/react-start";
import {
  findUserById,
  findVideosByUserId,
  updateUser,
} from "~/data-access/users";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";

export const getUserProfileFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const profileUser = await findUserById(data.userId);

    if (!profileUser) {
      throw new Error("User not found");
    }

    const userVideos = await findVideosByUserId(data.userId);

    return {
      profile: {
        userId: profileUser.id,
        name: profileUser.name,
        bio: profileUser.bio,
        image: profileUser.image,
      },
      videos: userVideos,
    };
  });

export const updateProfileFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      name: z.string().min(1).max(50),
      bio: z.string().max(500).optional(),
      image: z.url().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const updatedUser = await updateUser(context.userId, {
      name: data.name,
      bio: data.bio || null,
      image: data.image || null,
    });

    return {
      userId: updatedUser.id,
      name: updatedUser.name,
      bio: updatedUser.bio,
      image: updatedUser.image,
    };
  });

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const currentUser = await findUserById(context.userId);

    if (!currentUser) {
      throw new Error("User not found");
    }

    return currentUser;
  });
