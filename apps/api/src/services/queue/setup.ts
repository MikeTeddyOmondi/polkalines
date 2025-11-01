import { Queue } from "groupmq";
import { Redis } from "ioredis";
import { config } from "dotenv";
import { queueLogger } from "../../utils/logger.js";

config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  maxRetriesPerRequest: null,
});

// ============================================
// PIPELINE QUEUES FOR INK! CONTRACTS & DAPPS
// ============================================

// Stage 1: Git Clone and Validation Queue
export const gitQueue = new Queue({
  redis,
  namespace: "polka-git",
  jobTimeoutMs: 120_000, // 2 minutes
  logger: queueLogger,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 2: Build/Compile Queue (ink! contracts or dApps)
export const buildQueue = new Queue({
  redis,
  namespace: "polka-build",
  jobTimeoutMs: 600_000, // 10 minutes
  logger: queueLogger,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 3: Test Queue
export const testQueue = new Queue({
  redis,
  namespace: "polka-test",
  jobTimeoutMs: 300_000, // 5 minutes
  logger: queueLogger,
  keepCompleted: 10,
  keepFailed: 20,
});

// Stage 4: Deploy Queue (to Substrate nodes or IPFS)
export const deployQueue = new Queue({
  redis,
  namespace: "polka-deploy",
  jobTimeoutMs: 180_000, // 3 minutes
  logger: queueLogger,
  keepCompleted: 10,
  keepFailed: 20,
});

// Notifications Queue
export const notifyQueue = new Queue({
  redis,
  namespace: "polka-notify",
  jobTimeoutMs: 30_000,
  logger: true,
});

export { redis };
