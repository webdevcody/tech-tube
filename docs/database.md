# Database Schema & Drizzle ORM Usage

## Primary Keys as UUIDs

TechTube uses UUIDs (Universally Unique Identifiers) as primary keys for most tables, including `user`, `video`, `account`, etc. This ensures global uniqueness and is well-suited for distributed systems.

**Example from `src/db/schema.ts`:**
