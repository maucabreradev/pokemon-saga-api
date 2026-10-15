# Database

## Technology

- **Engine**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Migration Tool**: drizzle-kit

## Connection

The database runs inside Docker and is only accessible from the API service via the internal Docker network. No ports are exposed to the host.

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/pokemon_saga
```

## Schema Overview

### Entity Relationship Diagram

```
users ──────────────┐
  │                 │
  │ 1:N            │ 1:1
  ▼                 ▼
characters ────── characters_profile
  │
  │ 1:N (author)
  ▼
topics ─────────────┐
  │                 │
  │ 1:N            │ 1:N (self-ref)
  ▼                 ▼
posts ◄────────────┘

categories ─────────► forums (self-ref parent)
                         │
                         │ 1:N
                         ▼
                       topics

characters ◄──────► characters (friendships, self-ref)

characters ───────► reactions (polymorphic: topic|post)

characters ───────► moderation_logs
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Main user accounts (email + password) |
| `characters` | User characters (max 3 per user) |
| `characters_profile` | Extended character profile info |
| `refresh_tokens` | Hashed refresh tokens for auth rotation |
| `categories` | Top-level forum categories |
| `forums` | Forums with unlimited nesting (parent_id) |
| `topics` | Discussion topics within forums |
| `posts` | Comments/replies within topics (nested) |
| `friendships` | Character-to-character relationships |
| `reactions` | Likes/reactions on topics and posts |
| `moderation_logs` | Audit log for moderation actions |
| `silences` | Active temporary silences |

## Key Constraints

- `characters.readable_id` — globally unique, human-readable
- `characters.user_id` — max 3 active characters per user (enforced in service layer)
- `reactions` — unique constraint on (character_id, target_type, target_id, reaction_type)
- `friendships` — unique constraint on (requester_character_id, addressee_character_id)

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `email` (unique) | Fast login lookup |
| `characters` | `readable_id` (unique) | Fast profile lookup |
| `characters` | `user_id` | List user's characters |
| `characters` | `status` | Filter active/banned/deleted |
| `topics` | `forum_id` | List topics in forum |
| `topics` | `author_character_id` | List user's topics |
| `topics` | `created_at` | Sort by date |
| `posts` | `topic_id` | List posts in topic |
| `posts` | `author_character_id` | List user's posts |
| `posts` | `parent_post_id` | Fetch nested replies |
| `friendships` | `requester_character_id, addressee_character_id` (unique) | Prevent duplicate requests |
| `friendships` | `requester_character_id` | List user's friendships |
| `friendships` | `addressee_character_id` | List incoming requests |
| `refresh_tokens` | `token_hash` | Look up session by token hash |
| `refresh_tokens` | `user_id` | Revoke all user sessions |
| `reactions` | `target_type, target_id` | Count reactions on target |

## Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Run pending migrations
pnpm db:migrate

# Push schema directly (development only, no migration file)
pnpm db:push
```

## Soft Deletes

Characters, topics, and posts use soft deletes:

- `deleted_at` timestamp set on deletion
- Queries filter `WHERE deleted_at IS NULL` by default
- Admin can restore by clearing `deleted_at`
- Banned characters also use soft delete with `status = 'banned'`

## Connection Pooling

Drizzle uses a connection pool configured via `DATABASE_URL`. Default pool size is 10 connections, configurable via `DB_POOL_SIZE` environment variable.
