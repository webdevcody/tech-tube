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

export const userRelations = relations(user, ({ many }) => ({
  videos: many(video),
  comments: many(comment),
  commentLikes: many(commentLike),
  subscriptions: many(subscription, { relationName: "subscriber" }),
  subscribers: many(subscription, { relationName: "subscribedTo" }),
}));

export const videoRelations = relations(video, ({ one, many }) => ({
  user: one(user, {
    fields: [video.userId],
    references: [user.id],
  }),
  comments: many(comment),
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

export type User = typeof user.$inferSelect;
export type CreateUserData = typeof user.$inferInsert;
export type UpdateUserData = Partial<Omit<CreateUserData, "id" | "createdAt">>;
