# codebase.ai

**AI-powered codebase understanding, search, and chat** — import any repository and ask questions in natural language.

Live: [codebaseai-snowy.vercel.app](https://codebaseai-snowy.vercel.app)

---

## Features

### 1. Repository Import
Import codebases via GitHub URL or ZIP upload. The server clones (with `--depth 1` for speed) or extracts the repo to disk.

**Flow:** Submit URL/ZIP → Server clones/extracts → Detects language → Saves to PostgreSQL → Status: `ready`

### 2. AST Code Parsing
Parses every file using language-specific parsers (Babel for JS/TS, regex for Python/Go/Java). Extracts functions, classes, imports, exports, and comments. Each file is split into chunks (~50 lines each) for granular search.

**Flow:** Trigger parse → Walk directory → Skip binaries/images → Read file → Parse AST → Extract metadata → Chunk content → Store in DB → Status: `parsed`

**Supported languages:** JavaScript, TypeScript, JSX/TSX, Python, Go, Java

### 3. RAG Embedding
Converts code chunks into vector embeddings for semantic search.

**Flow:** Trigger embed → Query all chunks from DB → Generate embedding vectors → Store in persistent vector DB → Status: `embedded`

**Embedding methods:**
| Method | Requires | Quality |
|--------|----------|---------|
| Hash-based (default, free) | Nothing | Word-overlap matching |
| Ollama (`AI_PROVIDER=ollama`) | Local Ollama server | Good semantic search |
| OpenAI (`OPENAI_API_KEY`) | Paid API key | Best quality |

### 4. RAG Query (Semantic Search)
Converts your question into an embedding vector, then finds the most similar code chunks using cosine similarity.

**Flow:** Type question → Embed query → Vector search (cosine similarity) → Return top-K chunks with scores → Display citations

### 5. AI Chat
Streaming conversational interface that combines RAG context with an LLM for code-aware answers.

**Flow:** Select repo → Ask question → RAG query for relevant chunks → Build context prompt → Stream AI response (SSE) → Save to chat history

**AI Providers:**
| Provider | Setup | Cost |
|----------|-------|------|
| Mock (default) | None | Free — shows citations without calling AI |
| Ollama | `AI_PROVIDER=ollama` + local Ollama | Free, local |
| Groq | `AI_PROVIDER=groq` + `GROQ_API_KEY` | Free tier available |
| OpenAI | `AI_PROVIDER=openai` + `OPENAI_API_KEY` | Paid |

### 6. Code Explorer
Browse the file tree and get AI-powered explanations for files, functions, or classes.

**Flow:** Select file → Load metadata + chunks → Build context → AI explains purpose, logic, parameters

### 7. Architecture Diagrams
Auto-generated visual diagrams of the codebase structure using Mermaid.js.

| Tab | What it shows |
|-----|--------------|
| Folder Structure | Hierarchical directory tree with file counts |
| Dependencies | Import relationship graph between files |
| API Flow | Backend route structure by group |
| DB Schema | Database table relationships (ER diagram) |

### 8. Vector Store (Free, Persistent)
When Qdrant is unavailable, vectors are stored in-memory AND persisted to `data/vectors.json` on disk. Survives server restarts — no re-embedding needed after deploy.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | UI framework and styling |
| **Backend** | Node.js, Express, TypeScript | REST API server |
| **Database** | PostgreSQL + Drizzle ORM | Relational data (users, repos, chunks, chats) |
| **Vector Store** | Qdrant (optional) + JSON file fallback | Code chunk embeddings |
| **Cache** | Redis (optional, gracefully disabled) | Query result caching |
| **Auth** | JWT (bcryptjs) | User authentication |
| **Diagrams** | Mermaid.js 11 | Architecture visualizations |
| **AI Chat** | OpenAI SDK (supports OpenAI, Groq, Ollama) | Streaming AI responses |
| **Embeddings** | OpenAI SDK (hash-based fallback when no key) | Vector generation |
| **Parsing** | Babel parser, custom extractors | AST analysis |
| **Deployment** | Vercel (frontend), Render (backend) | Hosting |

---

## How AI Processing Works

```
User Question
     │
     ▼
┌─────────────────────┐
│  RAG Query          │
│  ─────────────────  │
│  Embed question →   │
│  Vector search →    │
│  Top 5 chunks       │
└─────────┬───────────┘
          │ citations
          ▼
┌─────────────────────┐
│  Build Context      │
│  ─────────────────  │
│  System prompt +    │
│  Citations +        │
│  Chat history       │
└─────────┬───────────┘
          │ messages
          ▼
┌─────────────────────┐
│  AI Provider        │
│  ─────────────────  │
│  Mock / Ollama /    │
│  Groq / OpenAI      │
│  (streaming SSE)    │
└─────────┬───────────┘
          │ tokens
          ▼
  Response displayed
  in chat UI
```

**Embedding pipeline:**
```
Code chunks → Content hash → Check cache →
  [Cache hit] → Return cached vector
  [Cache miss] → Hash-based embedding (word → md5 → 384-dim vector, normalized)
              → Or: OpenAI/Ollama API → Store in vector DB + cache
```

---

## Quick Start

### Local Development (Free, no API keys)

```bash
# Prerequisites: Node.js 18+, PostgreSQL

# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Set up .env (defaults to free mock mode)
cp .env.example .env

# 3. Run DB migrations
cd server && npm run migrate

# 4. Start both servers
npm run dev           # server on :3001
cd ../client && npm run dev  # client on :5173
```

### With Ollama (Free, local AI)

```bash
# 1. Install Ollama: https://ollama.com
ollama pull llama3.2:1b

# 2. Set in .env
AI_PROVIDER=ollama
```

### With Groq (Free tier, no local setup)

```bash
# 1. Get free key: https://console.groq.com
# 2. Set in .env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant
```

---

## Project Structure

```
codebase.ai/
├── client/                  React SPA (Vite)
│   └── src/
│       ├── components/      UI components (chat, repo, architecture, layout)
│       ├── contexts/        Theme context
│       ├── hooks/           Custom hooks (useChatStream, useAuth)
│       ├── pages/           Route pages (Dashboard, Query, Chat, Settings, etc.)
│       └── services/        API clients (repository, chat, architecture)
│
├── server/                  Express API
│   └── src/
│       ├── controllers/     Request handlers
│       ├── middleware/      Auth, rate limiting, error handling
│       ├── routes/          Route definitions
│       ├── services/        Business logic
│       │   ├── ai.service.ts         AI chat (stream + non-stream)
│       │   ├── rag.service.ts        RAG query + embedding pipeline
│       │   ├── embedding.service.ts  Vector generation (hash + API)
│       │   ├── vector.service.ts     Vector store (Qdrant + file fallback)
│       │   ├── parser.service.ts     Code parsing + chunking
│       │   ├── chat.service.ts       Chat CRUD
│       │   ├── architecture.service.ts  Mermaid diagram generators
│       │   ├── codeUnderstanding.service.ts  File/code explanations
│       │   └── cache.service.ts      Redis caching (graceful fallback)
│       └── database/        Schema (Drizzle ORM)

data/
└── vectors.json             Persisted vector store (survives restarts)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/repos` | List user repos |
| POST | `/api/v1/repos/import/url` | Import repo from GitHub URL |
| POST | `/api/v1/repos/import/zip` | Import repo from ZIP file |
| POST | `/api/v1/repos/:id/parse` | Parse all files (AST + chunking) |
| POST | `/api/v1/repos/:id/embed` | Generate embeddings for all chunks |
| POST | `/api/v1/repos/:id/query` | Semantic search (RAG query) |
| POST | `/api/v1/repos/:id/explain` | AI explanation of code |
| GET | `/api/v1/repos/:id/files` | File tree |
| GET | `/api/v1/repos/:id/architecture/folders` | Folder structure (Mermaid) |
| GET | `/api/v1/repos/:id/architecture/dependencies` | Dependency graph (Mermaid) |
| GET | `/api/v1/repos/:id/architecture/api-flow` | API flow (Mermaid) |
| GET | `/api/v1/repos/:id/architecture/db-schema` | DB schema (Mermaid) |
| GET/POST | `/api/v1/chats` | Chat CRUD |
| POST | `/api/v1/chats/:id/messages` | Send message (SSE stream) |
| DELETE | `/api/v1/chats/:id` | Delete chat |

---

## Keyboard Shortcuts

- `Ctrl+K` — Focus search/query input
- `Ctrl+L` — New chat

---

## Testing

```bash
cd server && npm test
cd client && npm test
```
