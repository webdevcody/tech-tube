import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/subscriptions/")({
  loader: () => {
    throw redirect({
      to: "/subscriptions/videos",
    });
  },
});