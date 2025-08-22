import { createServerFn } from "@tanstack/react-start";
import {
  createSubscription,
  deleteSubscription,
  findSubscription,
  findUserSubscriptions,
  findUserSubscribers,
  getSubscriptionCount,
  getSubscribingCount,
  getSubscribedUsersVideos,
  getSubscribedUsersComments,
} from "~/data-access/subscriptions";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";

export const subscribeToUserFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      subscribedToId: z.string().min(1),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { subscribedToId } = data;
    const subscriberId = context.userId;

    if (subscriberId === subscribedToId) {
      throw new Error("You cannot subscribe to yourself");
    }

    const existingSubscription = await findSubscription(subscriberId, subscribedToId);
    if (existingSubscription) {
      throw new Error("Already subscribed to this user");
    }

    const subscriptionData = {
      id: crypto.randomUUID(),
      subscriberId,
      subscribedToId,
    };

    const newSubscription = await createSubscription(subscriptionData);
    return newSubscription;
  });

export const unsubscribeFromUserFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      subscribedToId: z.string().min(1),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { subscribedToId } = data;
    const subscriberId = context.userId;

    const existingSubscription = await findSubscription(subscriberId, subscribedToId);
    if (!existingSubscription) {
      throw new Error("You are not subscribed to this user");
    }

    await deleteSubscription(subscriberId, subscribedToId);
    return { success: true };
  });

export const getUserSubscriptionsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      userId: z.string().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const userId = data.userId || context.userId;
    const subscriptions = await findUserSubscriptions(userId);
    return subscriptions;
  });

export const getUserSubscribersFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      userId: z.string().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const userId = data.userId || context.userId;
    const subscribers = await findUserSubscribers(userId);
    return subscribers;
  });

export const checkSubscriptionStatusFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      subscribedToId: z.string().min(1),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { subscribedToId } = data;
    const subscriberId = context.userId;
    
    const subscription = await findSubscription(subscriberId, subscribedToId);
    return { isSubscribed: !!subscription };
  });

export const getSubscriptionStatsFn = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      userId: z.string().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const userId = data.userId || context.userId;
    
    const [subscriberCount, subscribingCount] = await Promise.all([
      getSubscriptionCount(userId),
      getSubscribingCount(userId),
    ]);

    return {
      subscriberCount,
      subscribingCount,
    };
  });

export const getSubscribedVideosAndCommentsFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const userId = context.userId;
    
    const [videos, comments] = await Promise.all([
      getSubscribedUsersVideos(userId),
      getSubscribedUsersComments(userId),
    ]);

    return {
      videos,
      comments,
    };
  });