import { queryOptions } from "@tanstack/react-query";
import { getPopularVideosFn, getRecentVideosFn, getVideoByIdFn, getVideosByTagFn, searchTagsFn, searchVideosByTitleFn } from "~/fn/videos";

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

export const getVideosByTagQuery = (tag: string) =>
  queryOptions({
    queryKey: ["videos-by-tag", tag],
    queryFn: () => getVideosByTagFn({ data: { tag } }),
  });

export const searchTagsQuery = (query: string = "", limit: number = 10) =>
  queryOptions({
    queryKey: ["search-tags", query, limit],
    queryFn: () => searchTagsFn({ data: { query, limit } }),
  });

export const searchVideosQuery = (query: string = "", sortBy: 'views_asc' | 'views_desc' | 'date_asc' | 'date_desc' = 'date_desc', limit: number = 20) =>
  queryOptions({
    queryKey: ["search-videos", query, sortBy, limit],
    queryFn: () => searchVideosByTitleFn({ data: { query, sortBy, limit } }),
  });