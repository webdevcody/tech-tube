import { queryOptions } from "@tanstack/react-query";
import { getPopularVideosFn, getRecentVideosFn, getVideoByIdFn } from "~/fn/videos";

export const getRecentVideosQuery = () =>
  queryOptions({
    queryKey: ["recent-videos"],
    queryFn: () => getRecentVideosFn(),
  });

export const getPopularVideosQuery = () =>
  queryOptions({
    queryKey: ["popular-videos"],
    queryFn: () => getPopularVideosFn(),
  });

export const getVideoByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["video", id],
    queryFn: () => getVideoByIdFn({ data: { id } }),
  });