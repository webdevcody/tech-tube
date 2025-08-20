import { createServerFn } from "@tanstack/react-start";
import {
  findRecentVideos,
  findPopularVideos,
  createVideo,
  findVideoById,
} from "~/data-access/videos";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";

export const getRecentVideosFn = createServerFn().handler(async () => {
  return await findRecentVideos(20);
});

export const getPopularVideosFn = createServerFn().handler(async () => {
  return await findPopularVideos(20);
});

export const createVideoFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      title: z.string().min(3).max(100),
      description: z.string().max(500).optional(),
      videoUrl: z.url(),
      thumbnailUrl: z.url().optional().or(z.literal("")),
      status: z
        .enum(["processing", "published", "private", "unlisted"])
        .default("processing"),
      duration: z.number().int().min(1).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const videoData = {
      id: crypto.randomUUID(),
      ...data,
      userId: context.userId,
    };

    const newVideo = await createVideo(videoData);
    return newVideo;
  });

export const getVideoByIdFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const video = await findVideoById(data.id);
    if (!video) {
      throw new Error("Video not found");
    }
    return video;
  });
