# Pokémon Saga API

A REST API for an online role-playing forum set in the Pokémon universe. Users register with email and password, create up to 3 characters, and interact in forums with full moderation, social features, and role-based permissions.

## Tech Stack

- **Framework**: NestJS + Express
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Auth**: JWT with refresh token rotation
- **Package Manager**: pnpm
- **Containerization**: Docker Compose
- **API Docs**: Swagger / OpenAPI

## Prerequisites

- Node.js 20 (pinned in CI and Docker — dev must match; newer local Node hides incompatibilities)
- pnpm >= 9
- Docker & Docker Compose

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start database + API with Docker Compose
docker compose up -d

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000` and Swagger docs at `http://localhost:3000/api/docs`.

## Project Structure

```
src/
├── modules/          # Feature modules (auth, users, characters, forums, ...)
├── database/         # Drizzle config, schema, migrations, seeds
├── common/           # Shared utilities (guards, interceptors, filters, pipes)
├── config/           # Environment configuration
└── main.ts           # Application entry point
```

## Documentation

- [Architecture](ARCHITECTURE.md) — System design and module breakdown
- [API Reference](API.md) — Endpoint documentation overview
- [Database](DB.md) — Schema, migrations, and data model
- [Tasks](TASKS.md) — Implementation phases and task tracking
- [Testing](TESTING.md) — Testing strategy and guidelines
- [Decisions](DECISIONS.md) — Architecture Decision Records (ADRs)
- [Git Workflow](AGENTS.md) — Branching strategy and commit conventions

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot-reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate Drizzle migrations from schema |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes directly (dev only) |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## License

This project is released into the public domain under [The Unlicense](LICENSE).
