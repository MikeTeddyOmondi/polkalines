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

- [ ] Webhook receiver for push events

### Database (Turso (or local LibSQL instance) + Drizzle ORM)

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

### GitHub Actions Pipelines

- [ ] GitHub Actions workflow template for backend
- [ ] GitHub Actions workflow template for frontend

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