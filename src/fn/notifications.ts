import { createServerFn } from "@tanstack/react-start";
import {
  findNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from "~/data-access/notifications";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";

export const getNotificationsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      filter: z.enum(["read", "unread"]).optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    return await findNotificationsByUserId(context.userId, data.filter);
  });

export const markNotificationAsReadFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ notificationId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const success = await markNotificationAsRead(
      data.notificationId,
      context.userId
    );

    if (!success) {
      throw new Error("Failed to mark notification as read");
    }

    return { success: true };
  });

export const markAllNotificationsAsReadFn = createServerFn({
  method: "POST",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const count = await markAllNotificationsAsRead(context.userId);
    return { count };
  });

export const getUnreadNotificationCountFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    return await getUnreadNotificationCount(context.userId);
  });

export const deleteNotificationFn = createServerFn({
  method: "POST",
})
  .validator(z.object({ notificationId: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const success = await deleteNotification(data.notificationId, context.userId);

    if (!success) {
      throw new Error("Failed to delete notification");
    }

    return { success: true };
  });