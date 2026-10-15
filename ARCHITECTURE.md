# Architecture

## Overview

The Pokémon Saga API is a NestJS application following a modular monolith architecture. It uses Drizzle ORM with PostgreSQL for data persistence and Docker Compose for local development and deployment.

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│  ┌─────────────┐         ┌─────────────────────────┐   │
│  │   API       │         │   PostgreSQL 16         │   │
│  │  (NestJS)   │◄───────►│   (internal only)       │   │
│  │  Port 3000  │  DB     │   No exposed ports       │   │
│  └─────────────┘         └─────────────────────────┘   │
│         ▲                                                │
│         │ HTTP (only exposed service)                    │
└─────────┼────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    │  Clients  │
    └───────────┘
```

## Module Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        API Layer (/api/v1)                    │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│   Auth   │  Users   │Characters│  Forums  │  Moderation     │
│  Module  │  Module  │  Module  │  Module  │  Module         │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│  Topics  │  Posts   │Friendship│Reactions │    Admin        │
│  Module  │  Module  │  Module  │  Module  │    Module       │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                     Common Layer                             │
│  Guards │ Interceptors │ Filters │ Pipes │ Decorators        │
├──────────────────────────────────────────────────────────────┤
│                     Database Layer (Drizzle)                  │
│  Schema │ Migrations │ Seeds │ Connection Pool              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Request** hits the API through the global prefix `/api/v1`
2. **Guards** authenticate (JWT) and authorize (roles/ownership)
3. **Pipes** validate and transform incoming DTOs
4. **Controllers** delegate to services
5. **Services** contain business logic and interact with Drizzle
6. **Drizzle** executes typed SQL queries against PostgreSQL
7. **Interceptors** transform responses before sending

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Transport | Helmet headers, CORS whitelist |
| Authentication | JWT access tokens (15 min expiry) |
| Authorization | Role-based guards (`@Roles()` decorator) |
| Rate Limiting | `@nestjs/throttler` — per-IP and per-user limits |
| Input Validation | `class-validator` + `class-transformer` on all DTOs |
| XSS Prevention | DOMPurify sanitization on HTML content |
| Password Storage | bcrypt with 12 salt rounds |
| Token Storage | Refresh tokens stored as hashes, rotation on use |

## State Management

The API is stateless. All session state is carried by JWT tokens. Refresh tokens are stored in the database and rotated on each use.

## Error Handling

- Global exception filter catches all unhandled errors
- Standardized error response format: `{ statusCode, message, error, timestamp, path }`
- Business logic errors use custom exception classes
- Database errors are caught and translated to meaningful messages

## Scalability Considerations

- Stateless design allows horizontal scaling
- Database connection pooling via Drizzle
- Rate limiting prevents abuse
- Soft deletes preserve data integrity for future audit needs
