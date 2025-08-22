# TanStack Start v2 Development Guide

This guide covers data fetching patterns, server functions, and UI patterns for TanStack Start v2.

## Data Fetching Pattern

Our standard approach uses loaders with `queryClient.ensureQueryData` and `useQuery` in components.

### Loader Pattern

Always use loaders to prefetch data on the server:

```typescript
// In route file (e.g., src/routes/posts.tsx)
import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '~/lib/query-client'
import { getPostsQuery } from '~/queries/posts'

export const Route = createFileRoute('/posts')({
  loader: () => {
    queryClient.ensureQueryData(getPostsQuery()),
  },
  component: PostsPage,
})
```

### Component Pattern

Use `useQuery` in components with skeleton loading states:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getPostsQuery } from '~/queries/posts'

function PostsPage() {
  const { data: posts, isLoading } = useQuery(getPostsQuery())

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts?.map(post => (
        <PostCard key={post.id} post={post} />
      )) || (
        // Placeholder skeleton for empty/loading map
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
        ))
      )}
    </div>
  )
}
```

### Query Definition Pattern

Define queries in separate files for reusability:

```typescript
// src/queries/posts.ts
import { queryOptions } from "@tanstack/react-query";
import { getPostsServerFn } from "~/server/posts";

export const getPostsQuery = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: () => getPostsServerFn(),
  });
```

### Skeleton Loading Guidelines

- **Text Content**: Use `bg-gray-200 animate-pulse` divs with appropriate heights
- **Lists**: Show 3-5 skeleton items for `.map()` calls
- **Cards**: Match the expected content structure with skeleton shapes
- **Always show skeletons**: Never show empty states during loading

## Server Functions

TanStack Start v2 introduces a simple pattern for defining and using server functions. Server functions allow you to run code on the server from your client-side React components, similar to RPC.

### 1. Basic Server Function (No Middleware)

Define a simple server function without authentication:

```typescript
// src/server/posts.ts
import { createServerFn } from "@tanstack/start";
import { database } from "~/db";
import { posts } from "~/db/schema";

export const getPostsServerFn = createServerFn().handler(async () => {
  const allPosts = await database.select().from(posts);
  return allPosts;
});
```

### 2. Server Function with Authentication Middleware

For functions requiring authentication, use middleware:

```typescript
// src/server/protected-posts.ts
import { createServerFn } from "@tanstack/start";
import { authMiddleware } from "~/middleware/auth";
import { database } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";

export const getUserPostsServerFn = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { user } = context;

    const userPosts = await database
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id));

    return userPosts;
  });
```

### 3. Middleware Definition

Create reusable middleware for common patterns:

```typescript
// src/middleware/auth.ts
import { createMiddleware } from "@tanstack/start";
import { getSession } from "~/utils/auth";

export const authMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const session = await getSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        user: session.user,
      },
    });
  }
);
```

### 4. Server Functions with Zod Validation

Use Zod for input validation in server functions:

```typescript
// src/server/posts-with-validation.ts
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { database } from "~/db";
import { posts } from "~/db/schema";
import { authMiddleware } from "~/middleware/auth";

// Define input schemas
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().uuid("Invalid category ID"),
});

const updatePostSchema = z.object({
  id: z.string().uuid("Invalid post ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title too long")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
});

export const createPostServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createPostSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;
    const { title, content, categoryId } = data;

    const newPost = await database
      .insert(posts)
      .values({
        title,
        content,
        categoryId,
        userId: user.id,
        createdAt: new Date(),
      })
      .returning();

    return newPost[0];
  });

export const updatePostServerFn = createServerFn({ method: "PUT" })
  .middleware([authMiddleware])
  .validator(updatePostSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;
    const { id, ...updates } = data;

    // Check if post belongs to user
    const existingPost = await database
      .select()
      .from(posts)
      .where(eq(posts.id, id) && eq(posts.userId, user.id))
      .limit(1);

    if (!existingPost.length) {
      throw new Error("Post not found or unauthorized");
    }

    const updatedPost = await database
      .update(posts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    return updatedPost[0];
  });
```

### 5. Query Parameters with Validation

Validate query parameters in GET requests:

```typescript
// src/server/posts-search.ts
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { database } from "~/db";
import { posts } from "~/db/schema";
import { like, desc, asc } from "drizzle-orm";

const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(["createdAt", "title", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchPostsServerFn = createServerFn({ method: "GET" })
  .validator(searchParamsSchema)
  .handler(async ({ data }) => {
    const { q, category, page, limit, sortBy, sortOrder } = data;

    let query = db.select().from(posts);

    // Add search filters
    if (q) {
      query = query.where(like(posts.title, `%${q}%`));
    }

    if (category) {
      query = query.where(eq(posts.categoryId, category));
    }

    // Add sorting
    const orderFn = sortOrder === "asc" ? asc : desc;
    query = query.orderBy(orderFn(posts[sortBy]));

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const results = await query;

    return {
      posts: results,
      pagination: {
        page,
        limit,
        hasMore: results.length === limit,
      },
    };
  });
```

### 6. Form Data Validation

Handle form submissions with file uploads:

```typescript
// src/server/upload-post.ts
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { database } from "~/db";
import { posts } from "~/db/schema";
import { authMiddleware } from "~/middleware/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const uploadPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    )
    .optional(),
});

export const uploadPostServerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(uploadPostSchema)
  .handler(async ({ data, context }) => {
    const { user } = context;
    const { title, content, image } = data;

    let imageUrl: string | null = null;

    if (image) {
      // Handle file upload (implement your storage logic)
      imageUrl = await uploadImageToStorage(image);
    }

    const newPost = await database
      .insert(posts)
      .values({
        title,
        content,
        imageUrl,
        userId: user.id,
        createdAt: new Date(),
      })
      .returning();

    return newPost[0];
  });

async function uploadImageToStorage(file: File): Promise<string> {
  // Implement your file storage logic here
  // This could be AWS S3, Cloudinary, local storage, etc.
  throw new Error("File upload not implemented");
}
```

### 7. Error Handling with Zod

Handle validation errors gracefully:

```typescript
// src/server/posts-with-error-handling.ts
import { createServerFn } from "@tanstack/start";
import { z, ZodError } from "zod";
import { database } from "~/db";
import { posts } from "~/db/schema";
import { authMiddleware } from "~/middleware/auth";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required"),
});

export const createPostWithErrorHandlingServerFn = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(createPostSchema)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context;
      const { title, content } = data;

      const newPost = await database
        .insert(posts)
        .values({
          title,
          content,
          userId: user.id,
          createdAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: newPost[0],
        error: null,
      };
    } catch (error) {
      // Handle database errors
      if (error instanceof Error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: false,
        data: null,
        error: "An unexpected error occurred",
      };
    }
  });
```

### Usage in Components

Use validated server functions in your React components:

```typescript
// src/components/CreatePostForm.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPostServerFn } from "~/server/posts-with-validation";

export function CreatePostForm() {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPostServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await createPostMutation.mutateAsync({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        categoryId: formData.get("categoryId") as string,
      });
    } catch (error) {
      // Handle validation or server errors
      console.error("Failed to create post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <select name="categoryId" required>
        <option value="">Select category</option>
        {/* Category options */}
      </select>
      <button type="submit" disabled={createPostMutation.isPending}>
        {createPostMutation.isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```
