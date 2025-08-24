import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  bio: text("bio"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const video = pgTable("video", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  cloudinaryId: text("cloudinary_id"),
  status: text("status")
    .$default(() => "processing")
    .notNull(),
  duration: real("duration"),
  viewCount: integer("view_count")
    .$default(() => 0)
    .notNull(),
  transcript: text("transcript"),
  transcriptStatus: text("transcript_status"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  videoId: text("video_id")
    .notNull()
    .references(() => video.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  subscriberId: text("subscriber_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subscribedToId: text("subscribed_to_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const commentLike = pgTable("comment_like", {
  id: text("id").primaryKey(),
  commentId: text("comment_id")
    .notNull()
    .references(() => comment.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const videoLike = pgTable("video_like", {
  id: text("id").primaryKey(),
  videoId: text("video_id")
    .notNull()
    .references(() => video.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userTag = pgTable("user_tag", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const videoTag = pgTable("video_tag", {
  id: text("id").primaryKey(),
  videoId: text("video_id")
    .notNull()
    .references(() => video.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read")
    .$default(() => false)
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  videoId: text("video_id")
    .references(() => video.id, { onDelete: "cascade" }),
  commentId: text("comment_id")
    .references(() => comment.id, { onDelete: "cascade" }),
  triggeredByUserId: text("triggered_by_user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  videos: many(video),
  comments: many(comment),
  commentLikes: many(commentLike),
  videoLikes: many(videoLike),
  subscriptions: many(subscription, { relationName: "subscriber" }),
  subscribers: many(subscription, { relationName: "subscribedTo" }),
  userTags: many(userTag),
  notifications: many(notification),
  triggeredNotifications: many(notification, { relationName: "triggeredBy" }),
}));

export const videoRelations = relations(video, ({ one, many }) => ({
  user: one(user, {
    fields: [video.userId],
    references: [user.id],
  }),
  comments: many(comment),
  likes: many(videoLike),
  videoTags: many(videoTag),
  notifications: many(notification),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  video: one(video, {
    fields: [comment.videoId],
    references: [video.id],
  }),
  likes: many(commentLike),
  notifications: many(notification),
}));

export const commentLikeRelations = relations(commentLike, ({ one }) => ({
  comment: one(comment, {
    fields: [commentLike.commentId],
    references: [comment.id],
  }),
  user: one(user, {
    fields: [commentLike.userId],
    references: [user.id],
  }),
}));

export const videoLikeRelations = relations(videoLike, ({ one }) => ({
  video: one(video, {
    fields: [videoLike.videoId],
    references: [video.id],
  }),
  user: one(user, {
    fields: [videoLike.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  subscriber: one(user, {
    fields: [subscription.subscriberId],
    references: [user.id],
    relationName: "subscriber",
  }),
  subscribedTo: one(user, {
    fields: [subscription.subscribedToId],
    references: [user.id],
    relationName: "subscribedTo",
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  userTags: many(userTag),
  videoTags: many(videoTag),
}));

export const userTagRelations = relations(userTag, ({ one }) => ({
  user: one(user, {
    fields: [userTag.userId],
    references: [user.id],
  }),
  tag: one(tag, {
    fields: [userTag.tagId],
    references: [tag.id],
  }),
}));

export const videoTagRelations = relations(videoTag, ({ one }) => ({
  video: one(video, {
    fields: [videoTag.videoId],
    references: [video.id],
  }),
  tag: one(tag, {
    fields: [videoTag.tagId],
    references: [tag.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
  video: one(video, {
    fields: [notification.videoId],
    references: [video.id],
  }),
  comment: one(comment, {
    fields: [notification.commentId],
    references: [comment.id],
  }),
  triggeredByUser: one(user, {
    fields: [notification.triggeredByUserId],
    references: [user.id],
    relationName: "triggeredBy",
  }),
}));

export type Video = typeof video.$inferSelect;
export type CreateVideoData = typeof video.$inferInsert;
export type UpdateVideoData = Partial<
  Omit<CreateVideoData, "id" | "createdAt">
>;

export type Comment = typeof comment.$inferSelect;
export type CreateCommentData = typeof comment.$inferInsert;
export type UpdateCommentData = Partial<
  Omit<CreateCommentData, "id" | "createdAt">
>;

export type Subscription = typeof subscription.$inferSelect;
export type CreateSubscriptionData = typeof subscription.$inferInsert;
export type UpdateSubscriptionData = Partial<
  Omit<CreateSubscriptionData, "id" | "createdAt">
>;

export type CommentLike = typeof commentLike.$inferSelect;
export type CreateCommentLikeData = typeof commentLike.$inferInsert;

export type VideoLike = typeof videoLike.$inferSelect;
export type CreateVideoLikeData = typeof videoLike.$inferInsert;

export type User = typeof user.$inferSelect;
export type CreateUserData = typeof user.$inferInsert;
export type UpdateUserData = Partial<Omit<CreateUserData, "id" | "createdAt">>;

export type Tag = typeof tag.$inferSelect;
export type CreateTagData = typeof tag.$inferInsert;
export type UpdateTagData = Partial<Omit<CreateTagData, "id" | "createdAt">>;

export type UserTag = typeof userTag.$inferSelect;
export type CreateUserTagData = typeof userTag.$inferInsert;
export type UpdateUserTagData = Partial<Omit<CreateUserTagData, "id" | "createdAt">>;

export type VideoTag = typeof videoTag.$inferSelect;
export type CreateVideoTagData = typeof videoTag.$inferInsert;
export type UpdateVideoTagData = Partial<Omit<CreateVideoTagData, "id" | "createdAt">>;

export type Notification = typeof notification.$inferSelect;
export type CreateNotificationData = typeof notification.$inferInsert;
export type UpdateNotificationData = Partial<Omit<CreateNotificationData, "id" | "createdAt">>;
