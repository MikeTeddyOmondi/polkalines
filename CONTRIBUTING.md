# Contributing Guide

## 🚀 Setup 

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