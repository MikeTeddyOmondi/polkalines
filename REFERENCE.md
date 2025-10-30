# PolkaLines

> A CI/CD platform for Polkadot smart contracts (ink!) and dApps with pipeline orchestration via Dagger Engine.

PolkaLines is an opinionated CI/CD + runtime platform for building, testing, and deploying Polkadot ink! smart contracts and front-end dapps with pipelines orchestration.

## Why PolkaLines?

PolkaLines provides automated build, test, and deployment pipelines for Polkadot ecosystem projects

Sure — here’s a concise **Problem & Solution** section you can drop into your README or pitch deck:

---

## 🧩 Problem Statement

Developers building **Polkadot ink! smart contracts** and **dApps** face fragmented workflows.  
Each stage — compiling contracts, testing, building frontends, and deploying — requires manual setup, non-reproducible environments, and custom CI scripts.  
This slows feedback loops, breaks builds across machines, and makes continuous delivery nearly impossible.

---

## 🚀 Solution — PolkaLines

**PolkaLines** provides a unified CI/CD system for Polkadot projects.  
It automates building, testing, and deploying ink! contracts and connected dApps through **reproducible Dagger pipelines**, **ordered job orchestration via GroupMQ**, and **a simple Express + Svelte dashboard**.  
Developers get a Vercel-like experience — push to GitHub, and PolkaLines handles the rest: deterministic builds, smart contract packaging, and live dApp deployment.

---

## 🎯 Project Overview

PolkaLines provides automated build, test, and deployment pipelines for Polkadot ecosystem projects using:

- **ink!** smart contracts compilation and testing
- **Dagger Engine** for reproducible pipeline execution
- **GroupMQ** for ordered job processing
- **Svelte** frontend with remote functions
- **Express** backend API

## 📋 Table of Contents

- [Architecture](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#architecture)
- [Prerequisites](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#prerequisites)
- [Project Structure](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#project-structure)
- [Setup Instructions](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#setup-instructions)
- [Development Workflow](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#development-workflow)
- [Pipeline Configuration](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#pipeline-configuration)
- [Deployment](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#deployment)
- [API Reference](https://claude.ai/chat/464b6fe3-a6a2-459f-812a-baf7f813ea75#api-reference)

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

- Node.js 18+ and pnpm
- Docker Desktop
- Rust toolchain with `cargo-contract`
- Redis instance (local or cloud)
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
│       ├── ink-contract.yml
│       └── dapp-deploy.yml
│
├── examples/
│   └── flipper/                # Sample ink! contract
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/polkalines.git
cd polkalines
pnpm install
```

### 2. Configure Environment Variables

Create `.env` files in both `apps/web` and `apps/api`:

**apps/api/.env:**

```env
# Server
PORT=3000
NODE_ENV=development

# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Redis (for GroupMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Dagger
DAGGER_CLOUD_TOKEN=optional-for-cloud-caching

# GitHub
GITHUB_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Polkadot
SUBSTRATE_NODE_URL=ws://localhost:9944
```

**apps/web/.env:**

```env
PUBLIC_API_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

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

**apps/api/src/services/db/schema.ts:**

```typescript
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  repoUrl: text('repo_url').notNull(),
  type: text('type').notNull(), // 'ink-contract' | 'dapp'
  framework: text('framework'), // 'vite' | 'nextjs' | 'svelte' | 'sveltekit'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const pipelines = sqliteTable('pipelines', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  status: text('status').notNull(), // 'pending' | 'running' | 'success' | 'failed'
  jobId: text('job_id'),
  logs: text('logs'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  pipelineId: text('pipeline_id').notNull().references(() => pipelines.id),
  contractAddress: text('contract_address'),
  network: text('network').notNull(),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

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

## 💻 Development Workflow

### Backend Service Setup

**apps/api/src/services/db/client.ts:**

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

**apps/api/src/services/queue/setup.ts:**

```typescript
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: null,
});

// ============================================
// PIPELINE QUEUES FOR INK! CONTRACTS & DAPPS
// ============================================

// Stage 1: Git Clone and Validation Queue
export const gitQueue = new Queue({
  redis,
  namespace: 'polka-git',
  jobTimeoutMs: 120_000, // 2 minutes
  logger: true,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 2: Build/Compile Queue (ink! contracts or dApps)
export const buildQueue = new Queue({
  redis,
  namespace: 'polka-build',
  jobTimeoutMs: 600_000, // 10 minutes
  logger: true,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 3: Test Queue
export const testQueue = new Queue({
  redis,
  namespace: 'polka-test',
  jobTimeoutMs: 300_000, // 5 minutes
  logger: true,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 4: Deploy Queue (to Substrate nodes or IPFS)
export const deployQueue = new Queue({
  redis,
  namespace: 'polka-deploy',
  jobTimeoutMs: 180_000, // 3 minutes
  logger: true,
  keepCompleted: 10,
  keepFailed: 20,
});

// Notifications Queue
export const notifyQueue = new Queue({
  redis,
  namespace: 'polka-notify',
  jobTimeoutMs: 30_000,
  logger: true,
});

export { redis };
```

**apps/api/src/services/dagger/ink-pipeline.ts:**

```typescript
import { connect, Client } from '@dagger.io/dagger';

/**
 * Build an ink! smart contract using Dagger
 */
export async function buildInkContract(
  client: Client,
  repoUrl: string,
  branch: string,
  contractPath: string = '.'
) {
  console.log('[Dagger] Building ink! contract...');

  // Get Git repository
  const repo = client.git(repoUrl).branch(branch).tree();

  // Use Parity's contracts CI image with Rust + cargo-contract
  const container = client
    .container()
    .from('paritytech/contracts-ci-linux:production')
    .withDirectory('/workspace', repo)
    .withWorkdir(`/workspace/${contractPath}`);

  // Build the contract
  const built = container
    .withExec(['cargo', 'contract', 'build', '--release']);

  // Get build artifacts
  const artifactsDir = built.directory('./target/ink');
  const entries = await artifactsDir.entries();

  console.log('[Dagger] Build artifacts:', entries);

  return {
    container: built,
    artifactsDir,
    logs: await built.stdout(),
    artifacts: entries,
  };
}

/**
 * Test an ink! smart contract using Dagger
 */
export async function testInkContract(
  client: Client,
  repoUrl: string,
  branch: string,
  contractPath: string = '.'
) {
  console.log('[Dagger] Testing ink! contract...');

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from('paritytech/contracts-ci-linux:production')
    .withDirectory('/workspace', repo)
    .withWorkdir(`/workspace/${contractPath}`);

  // Run tests
  const tested = container
    .withExec(['cargo', 'test', '--release']);

  const stdout = await tested.stdout();
  const stderr = await tested.stderr();

  return {
    container: tested,
    logs: stdout,
    errors: stderr,
    success: !stderr.includes('FAILED'),
  };
}

/**
 * Build a Vite-based dApp using Dagger
 */
export async function buildViteDapp(
  client: Client,
  repoUrl: string,
  branch: string,
  buildDir: string = '.'
) {
  console.log('[Dagger] Building Vite dApp...');

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from('node:20-alpine')
    .withDirectory('/app', repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(['npm', 'install', '--frozen-lockfile'])
    .withExec(['npm', 'run', 'build']);

  const distDir = container.directory('/app/dist');

  return {
    container,
    distDir,
    logs: await container.stdout(),
  };
}

/**
 * Build a Next.js dApp using Dagger
 */
export async function buildNextDapp(
  client: Client,
  repoUrl: string,
  branch: string,
  buildDir: string = '.'
) {
  console.log('[Dagger] Building Next.js dApp...');

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from('node:20-alpine')
    .withDirectory('/app', repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(['npm', 'install', '--frozen-lockfile'])
    .withExec(['npm', 'run', 'build']);

  const buildOutput = container.directory('/app/.next');

  return {
    container,
    distDir: buildOutput,
    logs: await container.stdout(),
  };
}

/**
 * Build a Svelte/SvelteKit dApp using Dagger
 */
export async function buildSvelteDapp(
  client: Client,
  repoUrl: string,
  branch: string,
  buildDir: string = '.'
) {
  console.log('[Dagger] Building Svelte dApp...');

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from('node:20-alpine')
    .withDirectory('/app', repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(['npm', 'install', '--frozen-lockfile'])
    .withExec(['npm', 'run', 'build']);

  const distDir = container.directory('/app/build');

  return {
    container,
    distDir,
    logs: await container.stdout(),
  };
}

/**
 * Export build artifacts to local directory
 */
export async function exportArtifacts(dir: any, outputPath: string) {
  await dir.export(outputPath);
  console.log(`[Dagger] Exported artifacts to ${outputPath}`);
}
```

**apps/api/src/services/workers/pipeline-workers.ts:**

```typescript
import { Worker } from 'groupmq';
import { connect } from '@dagger.io/dagger';
import { 
  gitQueue, 
  buildQueue, 
  testQueue, 
  deployQueue, 
  notifyQueue 
} from '../queue/setup';
import {
  buildInkContract,
  testInkContract,
  buildViteDapp,
  buildNextDapp,
  buildSvelteDapp,
  exportArtifacts,
} from '../dagger/ink-pipeline';
import { db } from '../db/client';
import { pipelines } from '../db/schema';
import { eq } from 'drizzle-orm';

// ============================================
// WORKER 1: GIT CLONE AND VALIDATION
// ============================================

export const gitWorker = new Worker({
  queue: gitQueue,
  concurrency: 3,
  handler: async (job) => {
    const { repoUrl, branch, projectType, framework, projectId, pipelineId } = job.data;

    console.log(`[Git] Cloning ${repoUrl} (${branch}) for ${pipelineId}`);

    try {
      // Update pipeline status
      await db
        .update(pipelines)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(pipelines.id, pipelineId));

      await connect(
        async (client) => {
          // Test repository access
          const repo = client.git(repoUrl).branch(branch).tree();
          const entries = await repo.entries();

          console.log(`[Git] Found ${entries.length} files in repository`);

          // Validate project structure
          const validationRules = {
            'ink-contract': ['Cargo.toml', 'lib.rs'],
            'dapp-vite': ['package.json', 'vite.config.js', 'vite.config.ts'],
            'dapp-nextjs': ['package.json', 'next.config.js', 'next.config.mjs'],
            'dapp-svelte': ['package.json', 'svelte.config.js'],
          };

          const projectKey = projectType === 'ink-contract' 
            ? 'ink-contract' 
            : `dapp-${framework}`;

          const requiredFiles = validationRules[projectKey] || ['package.json'];
          const hasRequiredFiles = requiredFiles.some(file => 
            entries.includes(file) || entries.some(e => e.includes(file))
          );

          if (!hasRequiredFiles) {
            throw new Error(
              `Repository doesn't appear to be a valid ${projectKey} project`
            );
          }

          // Log progress
          await db
            .update(pipelines)
            .set({ logs: 'Repository validated successfully' })
            .where(eq(pipelines.id, pipelineId));

          // Pass to build stage
          await buildQueue.add({
            groupId: job.groupId,
            data: {
              repoUrl,
              branch,
              projectType,
              framework,
              projectId,
              pipelineId,
              clonedAt: Date.now(),
            },
            orderMs: job.orderMs,
          });

          console.log(`[Git] ✓ Validated and queued for build: ${pipelineId}`);
        },
        { LogOutput: process.stderr }
      );
    } catch (error) {
      console.error(`[Git] ✗ Failed to clone repository:`, error.message);

      await db
        .update(pipelines)
        .set({ 
          status: 'failed', 
          logs: `Git error: ${error.message}`,
          completedAt: new Date() 
        })
        .where(eq(pipelines.id, pipelineId));

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: 'failed',
          stage: 'git',
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// ============================================
// WORKER 2: BUILD/COMPILE
// ============================================

export const buildWorker = new Worker({
  queue: buildQueue,
  concurrency: 2, // CPU/memory intensive
  handler: async (job) => {
    const { repoUrl, branch, projectType, framework, projectId, pipelineId } = job.data;

    console.log(`[Build] Building ${projectType} for ${pipelineId}`);

    try {
      await db
        .update(pipelines)
        .set({ logs: 'Starting build process...' })
        .where(eq(pipelines.id, pipelineId));

      await connect(
        async (client) => {
          let buildResult;
          const outputPath = `/tmp/polkalines/${pipelineId}`;

          // Select build strategy based on project type
          if (projectType === 'ink-contract') {
            // Build ink! smart contract
            buildResult = await buildInkContract(client, repoUrl, branch);
            await exportArtifacts(buildResult.artifactsDir, `${outputPath}/artifacts`);

            await db
              .update(pipelines)
              .set({ 
                logs: `Build completed. Artifacts: ${buildResult.artifacts.join(', ')}` 
              })
              .where(eq(pipelines.id, pipelineId));

          } else if (projectType === 'dapp') {
            // Build dApp based on framework
            switch (framework) {
              case 'vite':
                buildResult = await buildViteDapp(client, repoUrl, branch);
                break;
              case 'nextjs':
                buildResult = await buildNextDapp(client, repoUrl, branch);
                break;
              case 'svelte':
              case 'sveltekit':
                buildResult = await buildSvelteDapp(client, repoUrl, branch);
                break;
              default:
                throw new Error(`Unsupported framework: ${framework}`);
            }

            await exportArtifacts(buildResult.distDir, `${outputPath}/dist`);

            await db
              .update(pipelines)
              .set({ logs: 'dApp build completed successfully' })
              .where(eq(pipelines.id, pipelineId));
          }

          console.log(`[Build] ✓ Build completed for ${pipelineId}`);

          // Pass to test stage
          await testQueue.add({
            groupId: job.groupId,
            data: {
              projectId,
              pipelineId,
              projectType,
              framework,
              repoUrl,
              branch,
              outputPath,
              builtAt: Date.now(),
            },
            orderMs: job.orderMs,
          });
        },
        { LogOutput: process.stderr }
      );
    } catch (error) {
      console.error(`[Build] ✗ Build failed for ${pipelineId}:`, error.message);

      await db
        .update(pipelines)
        .set({ 
          status: 'failed', 
          logs: `Build error: ${error.message}`,
          completedAt: new Date() 
        })
        .where(eq(pipelines.id, pipelineId));

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: 'failed',
          stage: 'build',
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// ============================================
// WORKER 3: TEST
// ============================================

export const testWorker = new Worker({
  queue: testQueue,
  concurrency: 3,
  handler: async (job) => {
    const { projectId, pipelineId, projectType, repoUrl, branch, outputPath } = job.data;

    console.log(`[Test] Testing ${projectType} for ${pipelineId}`);

    try {
      await db
        .update(pipelines)
        .set({ logs: 'Running tests...' })
        .where(eq(pipelines.id, pipelineId));

      if (projectType === 'ink-contract') {
        // Test ink! contract
        await connect(
          async (client) => {
            const testResult = await testInkContract(client, repoUrl, branch);

            if (!testResult.success) {
              throw new Error('Contract tests failed');
            }

            await db
              .update(pipelines)
              .set({ logs: `Tests passed!\n${testResult.logs}` })
              .where(eq(pipelines.id, pipelineId));

            console.log(`[Test] ✓ Tests passed for ${pipelineId}`);
          },
          { LogOutput: process.stderr }
        );
      } else {
        // For dApps, you could run Playwright/Cypress tests here
        console.log(`[Test] Skipping tests for dApp (not implemented)`);
      }

      // Pass to deploy stage
      await deployQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          projectType,
          outputPath,
          repoUrl,
          branch,
          testedAt: Date.now(),
        },
        orderMs: job.orderMs,
      });
    } catch (error) {
      console.error(`[Test] ✗ Tests failed for ${pipelineId}:`, error.message);

      await db
        .update(pipelines)
        .set({ 
          status: 'failed', 
          logs: `Test error: ${error.message}`,
          completedAt: new Date() 
        })
        .where(eq(pipelines.id, pipelineId));

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: 'failed',
          stage: 'test',
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// ============================================
// WORKER 4: DEPLOY
// ============================================

export const deployWorker = new Worker({
  queue: deployQueue,
  concurrency: 4,
  handler: async (job) => {
    const { projectId, pipelineId, projectType, outputPath } = job.data;

    console.log(`[Deploy] Deploying ${projectType} for ${pipelineId}`);

    try {
      await db
        .update(pipelines)
        .set({ logs: 'Deploying...' })
        .where(eq(pipelines.id, pipelineId));

      let deploymentUrl;
      let contractAddress;

      if (projectType === 'ink-contract') {
        // Deploy to Substrate node
        // In real implementation:
        // 1. Connect to Substrate node using Polkadot.js
        // 2. Upload contract code
        // 3. Instantiate contract
        // 4. Get contract address

        // Simulated deployment
        await new Promise(resolve => setTimeout(resolve, 3000));
        contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        deploymentUrl = `${process.env.SUBSTRATE_NODE_URL}/contracts/${contractAddress}`;

        // Store deployment info
        await db
          .update(pipelines)
          .set({ 
            status: 'success',
            logs: `Contract deployed to: ${contractAddress}`,
            completedAt: new Date()
          })
          .where(eq(pipelines.id, pipelineId));

      } else if (projectType === 'dapp') {
        // Deploy dApp to IPFS or CDN
        // In real implementation:
        // 1. Upload to IPFS
        // 2. Pin to Pinata/Web3.Storage
        // 3. Update DNS/CDN

        // Simulated deployment
        await new Promise(resolve => setTimeout(resolve, 2000));
        const ipfsCid = `Qm${Math.random().toString(36).substr(2, 44)}`;
        deploymentUrl = `https://ipfs.io/ipfs/${ipfsCid}`;

        await db
          .update(pipelines)
          .set({ 
            status: 'success',
            logs: `dApp deployed to IPFS: ${ipfsCid}`,
            completedAt: new Date()
          })
          .where(eq(pipelines.id, pipelineId));
      }

      console.log(`[Deploy] ✓ Deployed to ${deploymentUrl || contractAddress}`);

      // Send success notification
      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: 'success',
          stage: 'deploy',
          deploymentUrl,
          contractAddress,
          projectType,
        },
      });
    } catch (error) {
      console.error(`[Deploy] ✗ Deployment failed:`, error.message);

      await db
        .update(pipelines)
        .set({ 
          status: 'failed', 
          logs: `Deploy error: ${error.message}`,
          completedAt: new Date() 
        })
        .where(eq(pipelines.id, pipelineId));

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: 'failed',
          stage: 'deploy',
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// ============================================
// WORKER 5: NOTIFICATIONS
// ============================================

export const notifyWorker = new Worker({
  queue: notifyQueue,
  concurrency: 10,
  handler: async (job) => {
    const { 
      projectId, 
      pipelineId, 
      status, 
      stage, 
      deploymentUrl, 
      contractAddress,
      error 
    } = job.data;

    console.log(`[Notify] Pipeline ${pipelineId} - ${status} at ${stage} stage`);

    // Send webhook, email, Slack notification, etc.
    if (status === 'success') {
      console.log(`   ✓ Deployment: ${deploymentUrl || contractAddress}`);
      // TODO: Send webhook to GitHub, Discord, etc.
    } else {
      console.log(`   ✗ Error: ${error}`);
      // TODO: Send failure notification
    }
  },
});

// Start all workers
export function startWorkers() {
  gitWorker.run();
  buildWorker.run();
  testWorker.run();
  deployWorker.run();
  notifyWorker.run();

  const workers = [
    { name: 'Git', worker: gitWorker },
    { name: 'Build', worker: buildWorker },
    { name: 'Test', worker: testWorker },
    { name: 'Deploy', worker: deployWorker },
    { name: 'Notify', worker: notifyWorker },
  ];

  workers.forEach(({ name, worker }) => {
    worker.on('completed', (job) => {
      console.log(`[${name}] ✓ Completed job ${job.id}`);
    });

    worker.on('failed', (job) => {
      console.error(`[${name}] ✗ Failed job ${job.id}:`, job.failedReason);
    });

    worker.on('error', (error) => {
      console.error(`[${name}] Worker error:`, error);
    });
  });

  console.log('✓ PolkaLines pipeline workers started');
}

// Graceful shutdown
export async function shutdownWorkers() {
  console.log('Shutting down pipeline workers...');

  await Promise.all([
    gitWorker.close(10000),
    buildWorker.close(30000),
    testWorker.close(20000),
    deployWorker.close(10000),
    notifyWorker.close(5000),
  ]);

  console.log('✓ Pipeline workers shut down gracefully');
}
```

```typescript
import express from 'express';
import { nanoid } from 'nanoid';
import { db } from '../services/db/client';
import { pipelines, projects } from '../services/db/schema';
import { pipelineQueue } from '../services/queue/groupmq-client';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Create new pipeline run
router.post('/', async (req, res) => {
  const { projectId, type } = req.body;

  // Verify project exists
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Create pipeline record
  const pipelineId = nanoid();
  await db.insert(pipelines).values({
    id: pipelineId,
    projectId,
    status: 'pending',
  });

  // Queue the job using GroupMQ
  const job = await pipelineQueue.add(
    `pipeline-${pipelineId}`,
    {
      projectId,
      pipelineId,
      type: project.type,
      repoUrl: project.repoUrl,
    },
    {
      group: {
        id: projectId, // Ensures jobs for same project run in order
      },
    }
  );

  res.json({
    pipelineId,
    jobId: job.id,
    status: 'pending',
  });
});

// Get pipeline status
router.get('/:id', async (req, res) => {
  const pipeline = await db.query.pipelines.findFirst({
    where: eq(pipelines.id, req.params.id),
  });

  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  res.json(pipeline);
});

// Get pipeline logs
router.get('/:id/logs', async (req, res) => {
  const pipeline = await db.query.pipelines.findFirst({
    where: eq(pipelines.id, req.params.id),
  });

  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  res.json({
    logs: pipeline.logs || '',
  });
});

export default router;
```

### Frontend Remote Functions

**apps/web/src/lib/remote/api.ts:**

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export async function createProject(data: {
  name: string;
  repoUrl: string;
  type: 'ink-contract' | 'dapp';
}) {
  const response = await fetch(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return response.json();
}

export async function triggerPipeline(projectId: string) {
  const response = await fetch(`${API_URL}/api/pipelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger pipeline');
  }

  return response.json();
}

export async function getPipelineStatus(pipelineId: string) {
  const response = await fetch(`${API_URL}/api/pipelines/${pipelineId}`);

  if (!response.ok) {
    throw new Error('Failed to get pipeline status');
  }

  return response.json();
}

export async function streamPipelineLogs(pipelineId: string) {
  const response = await fetch(`${API_URL}/api/pipelines/${pipelineId}/logs`);
  return response.json();
}
```

**apps/web/src/routes/+page.svelte:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createProject, triggerPipeline, getPipelineStatus } from '$lib/remote/api';

  let projects = [];
  let selectedProject = null;
  let pipelineStatus = null;

  async function handleCreateProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const project = await createProject({
      name: formData.get('name'),
      repoUrl: formData.get('repoUrl'),
      type: formData.get('type'),
    });

    projects = [...projects, project];
  }

  async function handleTriggerPipeline(projectId) {
    const result = await triggerPipeline(projectId);

    // Poll for status
    const interval = setInterval(async () => {
      pipelineStatus = await getPipelineStatus(result.pipelineId);

      if (pipelineStatus.status === 'success' || pipelineStatus.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);
  }
</script>

<main class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">PolkaLines Dashboard</h1>

  <section class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">Create New Project</h2>
    <form on:submit={handleCreateProject} class="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Project Name"
        required
        class="input input-bordered w-full"
      />
      <input
        type="url"
        name="repoUrl"
        placeholder="GitHub Repository URL"
        required
        class="input input-bordered w-full"
      />
      <select name="type" required class="select select-bordered w-full">
        <option value="">Select Type</option>
        <option value="ink-contract">ink! Contract</option>
        <option value="dapp">dApp</option>
      </select>
      <button type="submit" class="btn btn-primary">Create Project</button>
    </form>
  </section>

  <section>
    <h2 class="text-2xl font-semibold mb-4">Projects</h2>
    <div class="grid gap-4">
      {#each projects as project}
        <div class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title">{project.name}</h3>
            <p class="text-sm opacity-70">{project.repoUrl}</p>
            <div class="card-actions">
              <button
                class="btn btn-sm btn-primary"
                on:click={() => handleTriggerPipeline(project.id)}
              >
                Run Pipeline
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  {#if pipelineStatus}
    <section class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Pipeline Status</h2>
      <div class="alert">
        <span>Status: {pipelineStatus.status}</span>
      </div>
    </section>
  {/if}
</main>
```

## 🔧 Pipeline Configuration

### GitHub Actions Workflow

**.github/workflows/ink-contract.yml:**

```yaml
name: Build ink! Contract

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      pipeline_id:
        description: 'PolkaLines Pipeline ID'
        required: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install cargo-contract
        run: cargo install cargo-contract --force

      - name: Notify PolkaLines Start
        if: github.event_name == 'workflow_dispatch'
        run: |
          curl -X POST ${{ secrets.POLKALINES_API_URL }}/api/pipelines/${{ github.event.inputs.pipeline_id }}/status \
            -H "Authorization: Bearer ${{ secrets.POLKALINES_TOKEN }}" \
            -d '{"status":"running"}'

      - name: Build Contract
        run: cargo contract build --release

      - name: Test Contract
        run: cargo test

      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: contract-artifacts
          path: target/ink/

      - name: Notify PolkaLines Complete
        if: github.event_name == 'workflow_dispatch' && always()
        run: |
          curl -X POST ${{ secrets.POLKALINES_API_URL }}/api/pipelines/${{ github.event.inputs.pipeline_id }}/status \
            -H "Authorization: Bearer ${{ secrets.POLKALINES_TOKEN }}" \
            -d '{"status":"${{ job.status }}"}'
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

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `REDIS_HOST` (use Upstash Redis)
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

## 🧪 Example ink! Contract

**examples/flipper/lib.rs:**

```rust
#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod flipper {
    #[ink(storage)]
    pub struct Flipper {
        value: bool,
    }

    impl Flipper {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            Self { value: init_value }
        }

        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new(Default::default())
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn default_works() {
            let flipper = Flipper::default();
            assert_eq!(flipper.get(), false);
        }

        #[ink::test]
        fn it_works() {
            let mut flipper = Flipper::new(false);
            assert_eq!(flipper.get(), false);
            flipper.flip();
            assert_eq!(flipper.get(), true);
        }
    }
}
```

**examples/flipper/Cargo.toml:**

```toml
[package]
name = "flipper"
version = "0.1.0"
edition = "2021"

[dependencies]
ink = { version = "5.0.0", default-features = false }

[dev-dependencies]
ink_e2e = "5.0.0"

[lib]
path = "lib.rs"

[features]
default = ["std"]
std = [
    "ink/std",
]
ink-as-dependency = []
```

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

## 🎯 MVP Checklist

### Backend (Express + TypeScript)

- [ ] Express API server with CORS and error handling
- [ ] GroupMQ multi-stage pipeline (Git → Build → Test → Deploy)
- [ ] Redis connection with ioredis
- [ ] 5 workers with concurrency limits:
  - [ ] Git Clone Worker (concurrency: 3)
  - [ ] Build Worker (concurrency: 2)
  - [ ] Test Worker (concurrency: 3)
  - [ ] Deploy Worker (concurrency: 4)
  - [ ] Notification Worker (concurrency: 10)

### Database (Turso + Drizzle ORM)

- [ ] Turso SQLite database setup
- [ ] Drizzle ORM schema with 3 tables (projects, pipelines, deployments)
- [ ] Database migrations
- [ ] Real-time status updates

### Dagger Pipelines (TypeScript SDK)

- [ ] ink! contract build pipeline with cargo-contract
- [ ] ink! contract test pipeline
- [ ] Vite dApp build pipeline
- [ ] Next.js dApp build pipeline
- [ ] SvelteKit dApp build pipeline
- [ ] Artifact export functionality

### Frontend (Svelte UI)

- [ ] Remote API functions module
- [ ] Project creation form
- [ ] Project list view
- [ ] Pipeline trigger button
- [ ] Real-time pipeline status display
- [ ] Log viewer component
- [ ] Responsive layout

### GitHub Integration

- [ ] GitHub Actions workflow template for ink! contracts
- [ ] GitHub Actions workflow template for dApps
- [ ] Webhook receiver for push events
- [ ] Status check integration

### Pipeline Features

- [ ] Ordered job execution per project (using GroupMQ groups)
- [ ] Job retry logic with exponential backoff
- [ ] Pipeline cancellation
- [ ] Build artifact storage
- [ ] Deployment to Substrate nodes (ink! contracts)
- [ ] Deployment to IPFS (dApps)

### Testing & Examples

- [ ] Flipper contract example with Cargo.toml
- [ ] Example dApp project
- [ ] API endpoint tests
- [ ] Pipeline integration tests

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

---
