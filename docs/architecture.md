# TechTube - Layered Architecture

TechTube follows a layered architecture pattern that separates concerns into distinct layers, promoting maintainability, testability, and code reusability. The application is structured around three primary layers: Server Functions, Use Cases, and Data Access.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                     │
│  Routes, Components, Forms (src/routes/, src/components/)   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Server Functions Layer                   │
│              (src/fn/, API Routes, Utils)                  │
│  • HTTP Request/Response handling                           │
│  • Input validation and sanitization                       │
│  • Authentication & authorization                           │
│  • Error handling and logging                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     Use Cases Layer                         │
│                    (src/use-cases/)                        │
│  • Business logic implementation                            │
│  • Workflow orchestration                                  │
│  • Cross-cutting concerns (caching, notifications)         │
│  • Domain validation and rules                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Data Access Layer                         │
│                  (src/data-access/)                        │
│  • Database queries and mutations                           │
│  • External API integrations                               │
│  • Data transformation and mapping                         │
│  • Repository pattern implementation                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     Database Layer                          │
│        PostgreSQL + Drizzle ORM (src/db/)                  │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Server Functions Layer (`src/fn/`)

The Server Functions layer acts as the application's entry point for server-side operations, handling HTTP requests and orchestrating responses.

**Key Responsibilities:**

- HTTP request/response handling using TanStack Start's `createServerFn`
- Input validation using Zod schemas
- Authentication and authorization checks
- Error handling and appropriate HTTP status codes
- Request logging and monitoring
- Rate limiting and security middleware

**Current Implementation:**

- Located primarily in `src/utils/posts.tsx` and `src/utils/users.tsx`
- Uses TanStack Start's `createServerFn` for type-safe server functions
- Example: `fetchPosts`, `fetchPost` functions in posts.tsx

**Planned Structure:**

```
src/fn/
├── auth/
│   ├── sign-in.ts
│   ├── sign-up.ts
│   └── refresh-token.ts
├── users/
│   ├── get-user.ts
│   ├── update-profile.ts
│   └── delete-account.ts
├── videos/
│   ├── upload-video.ts
│   ├── get-videos.ts
│   └── update-video.ts
└── shared/
    ├── validation.ts
    └── middleware.ts
```

### 2. Use Cases Layer (`src/use-cases/`)

The Use Cases layer contains the core business logic and orchestrates complex workflows that may involve multiple data sources or external services.

**Key Responsibilities:**

- Business rule enforcement and domain validation
- Workflow orchestration (e.g., video upload pipeline)
- Cross-cutting concerns like caching and notifications
- Integration between multiple data sources
- Transaction management for complex operations

**Planned Structure:**

```
src/use-cases/
├── auth/
│   ├── authenticate-user.ts
│   ├── register-user.ts
│   └── validate-session.ts
├── videos/
│   ├── upload-video-workflow.ts
│   ├── publish-video.ts
│   ├── moderate-content.ts
│   └── generate-recommendations.ts
├── users/
│   ├── manage-profile.ts
│   ├── subscription-management.ts
│   └── user-preferences.ts
└── analytics/
    ├── track-view.ts
    ├── engagement-metrics.ts
    └── creator-analytics.ts
```

**Example Use Case Implementation:**

```typescript
// src/use-cases/videos/upload-video-workflow.ts
export async function uploadVideoWorkflow(
  userId: string,
  videoData: VideoUploadData
) {
  // 1. Validate user permissions
  await validateUserCanUpload(userId);

  // 2. Process video file
  const processedVideo = await processVideoFile(videoData.file);

  // 3. Generate thumbnail
  const thumbnail = await generateThumbnail(processedVideo);

  // 4. Save to database
  const video = await saveVideoMetadata({
    ...videoData,
    userId,
    processedVideoUrl: processedVideo.url,
    thumbnailUrl: thumbnail.url,
  });

  // 5. Trigger post-upload workflows
  await triggerContentModeration(video.id);
  await notifySubscribers(userId, video.id);

  return video;
}
```

### 3. Data Access Layer (`src/data-access/`)

The Data Access layer abstracts database operations and external API calls, providing a clean interface for data operations.

**Key Responsibilities:**

- Database queries using Drizzle ORM
- External API integrations (file storage, analytics services)
- Data transformation and mapping between domain and persistence models
- Connection pooling and query optimization
- Caching strategies implementation

**Planned Structure:**

```
src/data-access/
├── repositories/
│   ├── user-repository.ts
│   ├── video-repository.ts
│   ├── comment-repository.ts
│   └── subscription-repository.ts
├── external/
│   ├── storage-service.ts
│   ├── analytics-service.ts
│   └── notification-service.ts
├── mappers/
│   ├── user-mapper.ts
│   ├── video-mapper.ts
│   └── common-mapper.ts
└── queries/
    ├── user-queries.ts
    ├── video-queries.ts
    └── analytics-queries.ts
```

**Example Repository Implementation:**

```typescript
// src/data-access/repositories/video-repository.ts
export class VideoRepository {
  async findByUserId(userId: string): Promise<Video[]> {
    return await database
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));
  }

  async create(videoData: CreateVideoData): Promise<Video> {
    const [video] = await database.insert(videos).values(videoData).returning();
    return video;
  }

  async updateStatus(id: string, status: VideoStatus): Promise<void> {
    await database
      .update(videos)
      .set({ status, updatedAt: new Date() })
      .where(eq(videos.id, id));
  }
}
```

## Current Implementation Status

### Existing Structure

The codebase currently has the foundational structure but needs organization:

- **Server Functions**: Currently in `src/utils/` files (posts.tsx, users.tsx)
- **Database Schema**: Well-defined in `src/db/schema.ts` with Better Auth integration
- **Routes**: File-based routing in `src/routes/` with API endpoints
- **Components**: React components in `src/components/`

### Migration Plan

1. **Create Layer Directories**: Set up `src/fn/`, `src/use-cases/`, and `src/data-access/`
2. **Move Server Functions**: Migrate existing server functions from utils to `src/fn/`
3. **Extract Business Logic**: Move complex workflows to use cases
4. **Create Repositories**: Abstract database operations into repository pattern
5. **Update Imports**: Refactor existing code to use new layer structure

## Benefits of This Architecture

### Separation of Concerns

Each layer has a single responsibility, making the codebase easier to understand and maintain.

### Testability

Layers can be tested in isolation with proper mocking of dependencies.

### Scalability

New features can be added by implementing the appropriate layer components without affecting others.

### Maintainability

Changes to business logic, data access, or API contracts are isolated to their respective layers.

### Team Collaboration

Different team members can work on different layers simultaneously with minimal conflicts.

## Example Data Flow

**Video Upload Request:**

```
1. Route Handler (Presentation)
   ↓ receives multipart form data
2. Server Function (src/fn/videos/upload-video.ts)
   ↓ validates input, handles file upload
3. Use Case (src/use-cases/videos/upload-video-workflow.ts)
   ↓ orchestrates business logic
4. Data Access (src/data-access/repositories/video-repository.ts)
   ↓ persists to database
5. Database (PostgreSQL + Drizzle ORM)
```

## Links and References

- **Server Functions**: [src/fn/](../src/fn/) - HTTP handlers and API endpoints
- **Use Cases**: [src/use-cases/](../src/use-cases/) - Business logic and workflows
- **Data Access**: [src/data-access/](../src/data-access/) - Database operations and external integrations
- **Database Schema**: [src/db/schema.ts](../src/db/schema.ts) - Drizzle ORM table definitions
- **Routes**: [src/routes/](../src/routes/) - TanStack Router file-based routing
- **Components**: [src/components/](../src/components/) - React UI components

This layered architecture ensures TechTube remains maintainable and scalable as it grows from a simple video sharing platform to a full-featured content creation ecosystem.
