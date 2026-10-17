# API Reference

All endpoints are prefixed with `/api/v1`. Interactive documentation is available via Swagger at `/api/docs`.

## Implementation Status

- Fully implemented: Auth, Users, Characters, Forums, Health (Phases 1-4).
- Partially implemented: Topics (Phase 5 in progress) — live routes: `GET /topics`,
  `GET /topics/:id`, `POST /topics`. The remaining rows in the Topics table are spec only.
- Planned (spec only, not yet implemented): Posts, Friendships, Reactions, Moderation, Admin
  (Phase 6+). The module tables below describe the full target contract, not the current state.
  Swagger UI reflects only implemented routes.

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `POST /api/v1/auth/login` and refreshed via `POST /api/v1/auth/refresh`.

---

## Auth Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user (email + password) | Public |
| POST | `/auth/login` | Login, returns access + refresh tokens | Public |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| POST | `/auth/logout` | Revoke current refresh token | Bearer |
| POST | `/auth/logout-all` | Revoke all refresh tokens for user | Bearer |

---

## Users Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Bearer |
| PATCH | `/users/me` | Update user email | Bearer |
| PATCH | `/users/me/password` | Change password | Bearer |
| GET | `/users/me/characters` | List user's characters | Bearer |
| GET | `/users/me/sessions` | List active sessions (tokens) | Bearer |
| DELETE | `/users/me` | Delete user account (soft delete) | Bearer |

---

## Characters Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/characters` | Create character (max 3 per user) | Bearer |
| GET | `/characters/:readableId` | Get public character profile | Public |
| PATCH | `/characters/:readableId` | Update character profile | Owner |
| PATCH | `/characters/:readableId/readable-id` | Change readable ID (once) | Owner |
| POST | `/characters/:readableId/set-main` | Set as main character | Owner |
| DELETE | `/characters/:readableId` | Delete character (soft delete) | Owner/Admin |
| GET | `/characters/:readableId/topics` | List character's topics | Public |
| GET | `/characters/:readableId/friends` | List character's friends | Public |
| GET | `/characters/:readableId/posts` | List character's posts | Public |

---

## Forums Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/forums` | Get full category/forum tree | Public |
| GET | `/forums/:id` | Get forum details with sub-forums | Public |
| POST | `/forums/categories` | Create category | Admin |
| POST | `/forums` | Create forum | Admin |
| PATCH | `/forums/:id` | Update forum | Admin |
| PATCH | `/forums/:id/visibility` | Change forum visibility | Admin |
| DELETE | `/forums/:id` | Delete forum | Admin |
| PATCH | `/forums/:id/order` | Reorder forums | Admin |

---

## Topics Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/topics` | List topics (filterable by forum, author, page) | Public/Registered |
| GET | `/topics/:id` | Get topic with paginated posts | Public/Registered |
| POST | `/topics` | Create new topic | Character |
| PATCH | `/topics/:id` | Edit topic | Author/Mod |
| DELETE | `/topics/:id` | Delete topic (soft delete) | Author/Mod |
| PATCH | `/topics/:id/pin` | Pin topic | Mod/Admin |
| PATCH | `/topics/:id/lock` | Lock topic | Mod/Admin |

---

## Posts Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts/:id` | Get single post | Public/Registered |
| POST | `/posts` | Create post/comment | Character |
| PATCH | `/posts/:id` | Edit post | Author/Mod |
| DELETE | `/posts/:id` | Delete post (soft delete) | Author/Mod |

---

## Friendships Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/friendships` | List character's friends | Character |
| POST | `/friendships/request` | Send friend request | Character |
| POST | `/friendships/:id/accept` | Accept friend request | Character |
| POST | `/friendships/:id/reject` | Reject friend request | Character |
| DELETE | `/friendships/:id` | Remove friend | Character |
| POST | `/friendships/:id/block` | Block character | Character |

---

## Reactions Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reactions` | Add reaction to topic/post | Character |
| DELETE | `/reactions/:id` | Remove reaction | Character |

---

## Moderation Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/moderation/ban` | Ban character | Mod/Admin |
| POST | `/moderation/unban` | Unban character | Mod/Admin |
| POST | `/moderation/silence` | Temporarily silence character | Mod/Admin |
| POST | `/moderation/unsilence` | Remove silence | Mod/Admin |
| GET | `/moderation/logs` | View moderation logs | Mod/Admin |

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/topics"
}
```

## Rate Limits

| Endpoint Category | Limit |
|-------------------|-------|
| General | 100 req/min per IP |
| Auth (login, register) | 5 req/min per IP |
| Character creation | 3 req/hour per user |
