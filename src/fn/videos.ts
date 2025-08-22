import { createServerFn } from "@tanstack/react-start";
import {
  findRecentVideos,
  findPopularVideos,
  createVideo,
  findVideoById,
} from "~/data-access/videos";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import { publicEnv } from "~/config/publicEnv";

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
      cloudinaryId: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      duration: z.number().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    // Generate Cloudinary URLs from the public ID
    const videoUrl = `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/${data.cloudinaryId}`;
    const thumbnailUrl =
      data.thumbnailUrl ||
      `https://res.cloudinary.com/${publicEnv.cloudName}/video/upload/${data.cloudinaryId}.jpg`;

    const videoData = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      videoUrl,
      thumbnailUrl,
      cloudinaryId: data.cloudinaryId,
      duration: data.duration,
      status: "published" as const,
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
