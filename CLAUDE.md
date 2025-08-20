# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: TanStack Start (full-stack React framework)
- **Frontend**: React 19.0.0 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth with database adapter
- **Styling**: Tailwind CSS with dark mode support

## Essential Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Build & Production
npm run build            # Build for production with TypeScript check
npm run start            # Start production server

# Database Management
npm run db:up            # Start PostgreSQL Docker container
npm run db:down          # Stop database container
npm run db:generate      # Generate Drizzle migrations from schema changes
npm run db:migrate       # Apply migrations to database
npm run db:studio        # Open Drizzle Studio GUI for database management
```

## Architecture Overview

### File-Based Routing

Routes are defined in `src/routes/` using TanStack Router's file-based routing:

- `__root.tsx` - Root layout with global providers
- `index.tsx` - Home page
- `api/auth/$.ts` - Authentication API endpoint (Better Auth)

### Database Layer

- **Schema**: `src/db/schema.ts` - Drizzle ORM schema definitions
- **Connection**: `src/db/index.ts` - Database client setup
- **Migrations**: `drizzle/` directory contains SQL migrations
- Uses PostgreSQL running in Docker (`docker-compose.yml`)

### Authentication

- **Server**: `src/utils/auth.ts` - Better Auth server configuration
- **Client**: `src/lib/auth-client.ts` - Auth client for React components
- Database-backed sessions with user, session, account, and verification tables

### Key Patterns

1. **Server Functions**: Use TanStack Start's server functions for API logic
2. **Type Safety**: Drizzle provides type-safe database queries from schema
3. **Component Structure**: Components in `src/components/` with error boundaries
4. **Environment Variables**: Required vars in `.env` (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)

## Development Workflow

1. Ensure PostgreSQL is running: `npm run db:up`
2. Run migrations if needed: `npm run db:migrate`
3. Start dev server: `npm run dev`
4. Access app at http://localhost:3000

When modifying database schema:

1. Edit `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

## ESM Imports

Remember to use the ~ typescript alias for doing imports

```typescript
// my tsconfig.json configuration you should always follow
"paths": {
  "~/*": ["./src/*"]
},
```

## Remember

- use react-hook-form for form validation `docs/forms.md`
- use the correct tanstack syntax for routes and server functions `docs/tanstack.md`
- use the app theme and reference other routes and components `docs/design.md`
- re-use components if possible found in `src/components`
- always add authentication middleware to server functions that need it
- follow the defined architecture `docs/architecture.md`
- always have placeholder sections when no data is found `docs/placeholder.md`
- always show skeleton loaders and display them at a fine grained level `docs/loaders.md`
- when invoking a server function, always remember it requires theServerFn({ data: PAYLOAD })
