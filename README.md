# codebase.ai

An AI-powered tool for understanding, querying, and exploring codebases using RAG (Retrieval-Augmented Generation).

## Features

- **Repository Import** — Clone from GitHub or upload ZIP files
- **AST Code Parsing** — Extracts functions, classes, imports from JS/TS/Python/Go/Java
- **RAG Search** — Semantic code search using vector embeddings
- **AI Chat** — Conversational interface with streaming responses
- **Code Explorer** — Browse file tree and get AI explanations
- **Architecture Diagrams** — Auto-generated folder structure, dependency graphs, API flow, DB schema
- **Caching** — Redis-backed caching with 22x query speedup
- **Rate Limiting** — Per-route rate limits (embed, query, chat)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Mermaid.js |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Drizzle ORM), Redis, Qdrant |
| AI | OpenAI embeddings + chat (with hash fallback) |
| Auth | JWT (bcryptjs) |
| Infra | Docker Compose (postgres, redis, qdrant, nginx) |

## Quick Start

### Development

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Run migrations & seed
cd server && npm run migrate && npm run seed

# 4. Start servers
npm run dev  # server on :3001
cd ../client && npm run dev  # client on :5173
```

### Production

```bash
export JWT_SECRET=your-secret
export OPENAI_API_KEY=sk-...
docker compose -f docker-compose.prod.yml up -d
```

## Architecture

```
client/          React SPA (Vite)
├── src/
│   ├── components/    UI components
│   ├── hooks/         Custom hooks
│   ├── pages/         Route pages
│   └── services/      API clients

server/          Express API
├── src/
│   ├── controllers/   Request handlers
│   ├── middleware/     Auth, rate limit, logging
│   ├── routes/        API route definitions
│   ├── services/      Business logic
│   └── database/      Drizzle schema & migrations
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/repos` | List repos |
| POST | `/api/v1/repos/import/url` | Import from URL |
| POST | `/api/v1/repos/:id/parse` | Parse files |
| POST | `/api/v1/repos/:id/embed` | Generate embeddings |
| POST | `/api/v1/repos/:id/query` | Semantic search |
| POST | `/api/v1/repos/:id/explain` | AI explanation |
| GET | `/api/v1/repos/:id/files` | File tree |
| GET | `/api/v1/repos/:id/architecture/*` | Diagrams |
| GET/POST | `/api/v1/chats` | Chat CRUD |
| POST | `/api/v1/chats/:id/messages` | Stream chat (SSE) |

Full docs: `GET /api/v1/docs`

## Keyboard Shortcuts

- `Ctrl+K` — Focus search input
- `Ctrl+L` — New chat

## Testing

```bash
cd server && npm test   # 16 tests
cd client && npm test   # 15 tests
```
