# RepoLens AI

> Intelligent GitHub Repository Analyzer — get a professional health report for any public GitHub repository in seconds.

RepoLens AI performs a comprehensive analysis of code quality, security, dependencies, documentation, testing, and architecture — then generates an AI-powered review with actionable recommendations.

![RepoLens AI](https://img.shields.io/badge/status-production--ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Overview

Paste any public GitHub repository URL and RepoLens AI will:

- Fetch real repository metadata from the GitHub API
- Analyze the repository structure, technologies, and architecture
- Evaluate code quality with a transparent scoring system
- Scan for exposed secrets and security issues
- Review dependencies and detect suspicious patterns
- Score your README and documentation
- Check testing infrastructure and coverage
- Generate an AI-powered executive review
- Produce a final 0–100 repository health score

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🔍 **Repository Metadata** | Stars, forks, languages, license, topics, and more |
| 🏗️ **Architecture Detection** | Identify frontend, backend, database, and deployment technologies |
| 💻 **Code Quality Analysis** | Score based on organization, readability, maintainability, and error handling |
| 🛡️ **Security Scanning** | Detect exposed secrets, unsafe configs, with severity ratings (never exposes actual secret values) |
| 📦 **Dependency Analysis** | Package counts, lockfile presence, suspicious patterns |
| 📖 **Documentation Review** | README quality score with improvement suggestions |
| 🧪 **Testing Analysis** | Detect unit, integration, and E2E tests with framework detection |
| 🤖 **AI-Powered Review** | Executive summary, strengths, weaknesses, and recommendations |
| 📊 **Overall Health Score** | Transparent weighted scoring across 8 categories |

---

## 🏛️ Architecture

```mermaid
flowchart TB
    subgraph Client["Browser (Next.js App Router)"]
        Landing[Landing Page]
        Progress[Progress View]
        Dashboard[Analysis Dashboard]
    end

    subgraph Server["Next.js API Routes"]
        AnalyzeAPI[/api/analyze]
        ProgressAPI[/api/progress/:id]
        HealthAPI[/api/health]
    end

    subgraph Services["Analysis Services"]
        Analyzer[Analyzer Orchestrator]
        GitHubSvc[GitHub Service]
        AISvc[AI Service]
        Scorer[Scorer]
    end

    subgraph Analyzers["Specialized Analyzers"]
        Structure[Structure]
        CodeQual[Code Quality]
        Security[Security]
        Dependencies[Dependencies]
        Readme[README]
        Testing[Testing]
    end

    subgraph Storage["Storage"]
        PostgreSQL[(PostgreSQL)]
    end

    subgraph External["External APIs"]
        GHAPI[GitHub API]
        LLM[OpenAI-compatible LLM]
    end

    Landing --> AnalyzeAPI
    Progress --> ProgressAPI
    Dashboard --> ProgressAPI

    AnalyzeAPI --> Analyzer
    ProgressAPI --> PostgreSQL

    Analyzer --> GitHubSvc
    Analyzer --> AISvc
    Analyzer --> Scorer
    Analyzer --> PostgreSQL

    Analyzer --> Structure
    Analyzer --> CodeQual
    Analyzer --> Security
    Analyzer --> Dependencies
    Analyzer --> Readme
    Analyzer --> Testing

    GitHubSvc --> GHAPI
    AISvc --> LLM
```

---

## 🧰 Tech Stack

| Category | Technology | Why |
|----------|------------|-----|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with server-side rendering |
| **Language** | TypeScript 5.9 | Type safety, better DX, fewer runtime errors |
| **Styling** | Tailwind CSS 4 | Utility-first CSS for rapid UI development |
| **Database** | PostgreSQL | Reliable, production-ready relational database |
| **ORM** | Drizzle ORM | Type-safe SQL with excellent performance |
| **AI** | OpenAI-compatible API | Works with OpenAI, OpenRouter, local models, and more |
| **Validation** | Zod | Runtime type validation for env vars and inputs |
| **Charts** | Custom SVG | Lightweight score visualizations without heavy deps |

---

## 📁 Project Structure

```
repolens-ai/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout with metadata
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles + Tailwind
│   │   ├── analyze/[id]/page.tsx  # Analysis progress & dashboard
│   │   └── api/
│   │       ├── analyze/route.ts   # Start & fetch analysis
│   │       ├── progress/[id]/     # Progress polling
│   │       └── health/route.ts    # Health check endpoint
│   ├── components/
│   │   ├── header.tsx             # Site header
│   │   ├── icons.tsx              # SVG icon components
│   │   └── ui/score-ring.tsx      # Score visualization
│   ├── db/
│   │   ├── index.ts               # Drizzle client
│   │   └── schema.ts              # Database tables
│   ├── lib/
│   │   ├── env.ts                 # Environment validation
│   │   ├── types.ts               # TypeScript types
│   │   ├── utils.ts               # Helpers (cn utility)
│   │   ├── validation.ts          # URL validation
│   │   ├── github.ts              # GitHub API service
│   │   ├── ai.ts                  # AI service
│   │   ├── analyzer.ts            # Main orchestrator
│   │   ├── scorer.ts              # Overall scoring logic
│   │   ├── cache.ts               # DB cache + job runner
│   │   └── analyzers/             # Specialized analyzers
│   │       ├── structure.ts
│   │       ├── code-quality.ts
│   │       ├── security.ts
│   │       ├── dependencies.ts
│   │       ├── readme.ts
│   │       └── testing.ts
├── .env.example                   # Environment variable template
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── drizzle.config.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 📋 Prerequisites

- **Node.js 20+** — [download](https://nodejs.org/)
- **PostgreSQL 14+** — running locally or remote
- **GitHub Token** (optional) — to avoid rate limits, get one [here](https://github.com/settings/tokens)
- **OpenAI API Key** (optional) — for AI-powered reviews, get one [here](https://platform.openai.com/api-keys)

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/repolens-ai.git
cd repolens-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

---

## ⚙️ Environment Variables

All environment variables are documented in `.env.example`. Here's what each one does:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/repolens_db`) |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token to increase API rate limits (without it: 60 req/hr, with it: 5,000 req/hr) |
| `OPENAI_API_KEY` | No | API key for OpenAI or compatible service. Required for AI-powered reviews. If missing, heuristic fallback is used. |
| `OPENAI_BASE_URL` | No | Base URL for OpenAI-compatible API. Default: `https://api.openai.com/v1`. Compatible with OpenRouter, Azure, local Ollama, etc. |
| `OPENAI_MODEL` | No | Model name to use. Default: `gpt-4o-mini`. Use `gpt-4o`, `gpt-4-turbo`, or any compatible model. |
| `NEXT_PUBLIC_APP_URL` | No | Public URL of the app (used in emails/meta). Default: `http://localhost:3000` |

**Where to put them:** Copy `.env.example` to `.env` in the project root and fill in your values. Never commit `.env` to version control.

---

## 🏃 Running Locally

```bash
# 1. Start the development server
npm run dev

# 2. Open http://localhost:3000 in your browser
```

On first run, the database tables are created automatically by Drizzle.

---

## 🧪 Testing

The project includes tests for core functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test coverage includes:**
- GitHub URL validation
- Repository URL parsing
- Error handling for invalid inputs
- Environment variable validation
- Core analyzer logic (structure, scoring)
- API response handling

---

## 🔨 Production Build

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🚢 Deployment

### Option A: Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add GITHUB_TOKEN
vercel env add OPENAI_API_KEY
```

### Option B: Docker

A `Dockerfile` is provided. Build and run:

```bash
docker build -t repolens-ai .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e GITHUB_TOKEN=... \
  -e OPENAI_API_KEY=... \
  repolens-ai
```

### Option C: Any Node.js host

Run `npm run build` then `npm run start` on any Node.js host (Render, Railway, Fly.io, etc.). Configure environment variables through the host's dashboard.

---

## ⚠️ API Limitations

- **GitHub API rate limits:** 60 requests/hour unauthenticated, 5,000 requests/hour with a token.
- **Public repositories only:** Private repositories cannot be analyzed.
- **File content sampling:** Large repositories are sampled (up to 15 source files for security scanning, 10 for code quality) to stay within reasonable API usage.
- **Tree size limit:** GitHub returns at most 100,000 files per tree.
- **AI context window:** Repository content is filtered and summarized before being sent to the AI model.

---

## 🤖 AI Usage

The AI review feature uses an OpenAI-compatible API. You can configure:

- **OpenAI** (`https://api.openai.com/v1`)
- **OpenRouter** (`https://openrouter.ai/api/v1`)
- **Azure OpenAI** (custom endpoint)
- **Local models** via Ollama (`http://localhost:11434/v1`)

If no `OPENAI_API_KEY` is configured, the app falls back to a heuristic-based review that still produces meaningful output.

---

## 🛡️ Security

- **No hardcoded secrets** — all sensitive configuration via environment variables
- **Secrets are masked** — if a potential secret is detected in a repository, only a prefix is shown (e.g., `sk-********`)
- **Input validation** — all user input (URLs, IDs) is validated before use
- **No arbitrary code execution** — repositories are analyzed via the GitHub API, never cloned
- **`.env` is gitignored** — secrets are never committed
- **Rate limiting** — GitHub API calls are batched to avoid abuse
- **No secrets in logs** — error messages are sanitized before being sent to clients

---

## 🧩 Known Limitations

- Cannot analyze private repositories (GitHub API limitation)
- Dependency vulnerability checking requires a separate security advisory database (not included)
- Large monorepos (>100k files) may be truncated by the GitHub tree API
- AI review quality depends on the model and context window
- Binary files are excluded from analysis
- No authentication/authorization for the web UI (add your own if deploying publicly)

---

## 🔮 Future Improvements

- [ ] Repository comparison (compare two repos side-by-side)
- [ ] Dependency vulnerability scanning with OSV database
- [ ] Historical analysis tracking (watch how a repo evolves)
- [ ] Export reports as PDF
- [ ] User accounts and saved analyses
- [ ] Webhook support for automatic analysis on push
- [ ] Multi-language README support
- [ ] Custom analyzer plugins

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run `npm run typecheck && npm run lint && npm run build && npm test`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com)
- Powered by the [GitHub API](https://docs.github.com/en/rest)
- AI reviews by [OpenAI](https://openai.com) (or compatible providers)

---

<div align="center">
  <sub>Built with ❤️ for developers who want to understand codebases quickly.</sub>
</div>
