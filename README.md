# PolkaLines

PolkaLines is an opinionated CI/CD + runtime platform for building, testing, and deploying Polkadot ink! smart contracts and front-end dapps with pipelines orchestration.

## Why PolkaLines?

PolkaLines provides automated build, test, and deployment pipelines for Polkadot ecosystem projects

Sure — here’s a concise **Problem & Solution** section you can drop into your README or pitch deck:

## 🧩 Problem Statement

Developers building **Polkadot ink! smart contracts** and **dApps** face fragmented workflows.  
Each stage — compiling contracts, testing, building frontends, and deploying — requires manual setup, non-reproducible environments, and custom CI scripts.  
This slows feedback loops, breaks builds across machines, and makes continuous delivery nearly impossible.

## 🚀 Solution — PolkaLines

**PolkaLines** provides a unified CI/CD system for Polkadot projects.  
It automates building, testing, and deploying ink! contracts and connected dApps through **reproducible Dagger pipelines**, **ordered job orchestration via GroupMQ**, and **a simple Express + Svelte dashboard**.  
Developers get a Vercel-like experience — push to GitHub, and PolkaLines handles the rest: deterministic builds, smart contract packaging, and live dApp deployment.

## 🎯 Project Overview

PolkaLines provides automated build, test, and deployment pipelines for Polkadot ecosystem projects using:

- **Svelte** frontend with remote functions
- **Express** backend API
- **GroupMQ** for ordered job processing
- **Dagger Engine** for reproducible pipeline execution
- **ink!** smart contracts compilation and testing

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Pipeline Configuration](#pipeline-configuration)
- [Deployment](#deployment)
- [API Reference](#api-reference)

## 🏗️ Architecture

```
┌─────────────┐
│   Svelte    │ ← User Interface
│     UI      │
└──────┬──────┘
       │ Remote Functions
       ↓
┌─────────────┐
│   Express   │ ← API Backend
│   Backend   │
└──────┬──────┘
       │
       ├→ Turso (SQLite) ← Project metadata
       │
       ├→ Redis + GroupMQ ← Job queue
       │
       └→ Dagger Engine ← Pipeline execution
              │
              └→ Pipelines ← CI/CD triggers
```

## ✅ Prerequisites

- Node.js 20+ and pnpm
- Docker Desktop (or a running Docker Engine with its CLI setup)
- Rust toolchain with `cargo-contract`
- Redis instance (local or cloud - Render)
- Turso database account
- GitHub account with Actions enabled
- Dagger CLI installed

```bash
# Install Dagger CLI
curl -L https://dl.dagger.io/dagger/install.sh | sh

# Install cargo-contract
cargo install cargo-contract --force

# Install pnpm globally
npm install -g pnpm
```

## 📁 Project Structure

```
polkalines/
├── apps/
│   ├── web/                    # Svelte frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   └── remote/     # Remote function calls
│   │   │   ├── routes/
│   │   │   └── app.html
│   │   ├── svelte.config.js
│   │   └── package.json
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   │   ├── dagger/     # Dagger pipelines
│       │   │   ├── queue/      # GroupMQ jobs
│       │   │   └── db/         # Drizzle ORM
│       │   ├── middleware/
│       │   └── index.ts
│       ├── drizzle/            # Database migrations
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared types
│   └── pipelines/              # Reusable Dagger functions
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── examples/
│   └── flipper/                # Sample ink! contract for our pipelines
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/MikeTeddyOmondi/polkalines.git
cd polkalines
pnpm install
```

### 2. Configure Environment Variables

Create `.env` files in both `apps/web` and `apps/api`

### 3. Setup Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create polkalines

# Get connection string
turso db show polkalines --url

# Create auth token
turso db tokens create polkalines
```

### 4. Setup Database Schema

Run migrations:

```bash
cd apps/api
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using local installation
redis-server
```

### 6. Start Development Servers

```bash
# Terminal 1: API Server
cd apps/api
pnpm dev

# Terminal 2: Web UI
cd apps/web
pnpm dev
```

## 🚢 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Build API
cd apps/api
pnpm build

# Build Web
cd apps/web
pnpm build
```

### Deploy to Vercel (using your template)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy API (serverless)
cd apps/api
vercel --prod

# Deploy Web
cd apps/web
vercel --prod
```

### Environment Variables on Vercel

Set these in your Vercel project settings:

- `DATABASE_URL`
- `AUTH_TOKEN`
- `REDIS_HOST` (use Render Managed Redis)
- `REDIS_PASSWORD`
- `GITHUB_TOKEN`

## 📚 API Reference

### Endpoints

#### Projects

- `POST /api/projects` - Create a new project
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete a project

#### Pipelines

- `POST /api/pipelines` - Trigger a pipeline
- `GET /api/pipelines/:id` - Get pipeline status
- `GET /api/pipelines/:id/logs` - Get pipeline logs
- `POST /api/pipelines/:id/cancel` - Cancel a pipeline

#### Deployments

- `GET /api/deployments` - List deployments
- `GET /api/deployments/:id` - Get deployment details

## 🧪 Testing Your Setup

### 1. Test ink! Contract Build

```bash
# Create a test project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Flipper Contract",
    "repoUrl": "https://github.com/paritytech/ink-examples",
    "type": "ink-contract"
  }'

# Trigger pipeline (use projectId from response)
curl -X POST http://localhost:3000/api/pipelines/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "repoUrl": "https://github.com/paritytech/ink-examples",
    "branch": "main",
    "projectType": "ink-contract"
  }'

# Check pipeline status
curl http://localhost:3000/api/pipelines/YOUR_PIPELINE_ID

# View logs
curl http://localhost:3000/api/pipelines/YOUR_PIPELINE_ID/logs
```

### 2. Test dApp Build

```bash
# Create dApp project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Polkadot dApp",
    "repoUrl": "https://github.com/yourusername/polkadot-dapp",
    "type": "dapp",
    "framework": "vite"
  }'

# Trigger dApp pipeline
curl -X POST http://localhost:3000/api/pipelines/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "repoUrl": "https://github.com/yourusername/polkadot-dapp",
    "branch": "main",
    "projectType": "dapp",
    "framework": "vite"
  }'
```

### 3. Monitor Pipeline Status

```bash
# Get overall pipeline status
curl http://localhost:3000/api/pipelines/status/overview

# Get all pipelines for a project
curl http://localhost:3000/api/pipelines/project/PROJECT_ID

# Cancel a running pipeline
curl -X POST http://localhost:3000/api/pipelines/PIPELINE_ID/cancel
```

## 📖 Resources

- [ink! Documentation](https://use.ink/docs/v6/basics/contract-template/)
- [Dagger TypeScript SDK](https://docs.dagger.io/getting-started/api/sdk/)
- [GroupMQ Documentation](https://openpanel-dev.github.io/groupmq/)
- [Drizzle ORM with Turso](https://orm.drizzle.team/docs/connect-turso)
- [Serverless Express Template](https://github.com/MikeTeddyOmondi/serverless-express)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Built with ❤️ for the Polkadot ecosystem

