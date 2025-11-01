import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "groupmq";
import { connect } from "@dagger.io/dagger";
import { applogger as log } from "./utils/logger.js";

import {
  buildInkContract,
  buildNextDapp,
  buildSvelteDapp,
  buildViteDapp,
  exportArtifacts,
} from "./services/dagger/ink-pipeline.js";
import projectsRouter from "./routes/projects.js";
import pipelinessRouter from "./routes/pipelines.js";
import {
  buildQueue,
  deployQueue,
  gitQueue,
  notifyQueue,
  redis,
} from "./services/queue/setup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers

  if (req.method === "OPTIONS") {
    res.status(200).end(); // Handle preflight requests
    return;
  }

  next();
});

app.use("/api/projects", projectsRouter);
app.use("/api/pipelines", pipelinessRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Polkalines service is running!",
  });
});

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// PIPELINE WORKERS
// ============================================

// Worker 1: Git Clone and Validation
const gitWorker = new Worker({
  queue: gitQueue,
  concurrency: 3,
  handler: async (job) => {
    // @ts-ignore
    const { repoUrl, branch, type, framework, projectId, pipelineId } =
      job.data;

    log.info(`[Git] Cloning ${repoUrl} (${branch}) for project ${projectId}`);

    try {
      // Connect to Dagger
      await connect(
        async (client) => {
          // Test repository access
          const repo = client.git(repoUrl).branch(branch).tree();
          const entries = await repo.entries();

          log.info(`[Git] Found ${entries.length} files in repository`);

          // Validate framework-specific files exist
          const expectedDappFiles = {
            ink: ["Cargo.toml"],
            vite: ["package.json", "vite.config.js", "vite.config.ts"],
            nextjs: ["package.json", "next.config.js", "next.config.mjs"],
            sveltekit: ["package.json", "svelte.config.js"],
          };

          // @ts-ignore
          const frameworkFiles = expectedDappFiles[framework] || ["Cargo.toml"];
          const hasRequiredFiles = frameworkFiles.some((file: string) =>
            entries.includes(file)
          );

          if (!hasRequiredFiles) {
            log.error(`Repository doesn't appear to be a ${framework} project`);
            throw new Error(
              `Repository doesn't appear to be a ${framework} project`
            );
          }

          // Pass to build stage
          await buildQueue.add({
            groupId: job.groupId,
            data: {
              repoUrl,
              branch,
              type,
              framework,
              projectId,
              pipelineId,
              clonedAt: Date.now(),
            },
            orderMs: job.orderMs,
          });

          log.info(`[Git] ✓ Validated and queued for build: ${pipelineId}`);
        },
        { LogOutput: process.stderr }
      );
    } catch (error: any) {
      log.error(`[Git] ✗ Failed to clone repository:`, error.message);

      // Send failure notification
      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: "failed",
          stage: "git",
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// Worker 2: Build Application
const buildWorker = new Worker({
  queue: buildQueue,
  concurrency: 2, // CPU/memory intensive
  handler: async (job) => {
    const { repoUrl, branch, type, framework, projectId, pipelineId } =
      job.data;

    log.info(`[Build] Building ${framework} app for ${pipelineId}`);

    try {
      await connect(
        async (client) => {
          let buildResult;

          if (type === "ink-contract") {
            // Build ink! contracts
            buildResult = await buildInkContract(client, repoUrl, branch);
          } else {
            // Build Dapps
            switch (framework) {
              case "vite":
                buildResult = await buildViteDapp(client, repoUrl, branch);
                break;
              case "nextjs":
                buildResult = await buildNextDapp(client, repoUrl, branch);
                break;
              case "svelte":
                buildResult = await buildSvelteDapp(client, repoUrl, branch);
                break;
              default:
                throw new Error(`Unsupported framework: ${framework}`);
            }
          }

          log.info(`[Build] ✓ Build completed for ${pipelineId}`);
          log.info(`[Build] Logs: ${buildResult.logs}`);

          // Export artifacts to temporary directory
          const outputPath = `/tmp/builds/${pipelineId}`;
          await exportArtifacts(buildResult.container, outputPath);

          // Pass to deploy stage
          await deployQueue.add({
            groupId: job.groupId,
            data: {
              projectId,
              pipelineId,
              type,
              framework,
              outputPath,
              repoUrl,
              branch,
              builtAt: Date.now(),
            },
            orderMs: job.orderMs,
          });
        },
        { LogOutput: process.stderr }
      );
    } catch (error: any) {
      log.error(
        `[Build] ✗ Build failed for ${pipelineId}: with error: ${error.message}`
      );

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          pipelineId,
          status: "failed",
          stage: "build",
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// Worker 3: Deploy/Upload Artifacts
const deployWorker = new Worker({
  queue: deployQueue,
  concurrency: 4,
  handler: async (job) => {
    const { projectId, buildId, framework, outputPath } = job.data;

    log.info(`[Deploy] Deploying ${buildId}`);

    try {
      // In a real scenario, you would:
      // 1. Upload to S3/CDN
      // 2. Update DNS records
      // 3. Invalidate CDN cache
      // 4. Update database with deployment info

      // Simulated deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const deploymentUrl = `https://${projectId}.locci.cloud`;

      log.info(`[Deploy] ✓ Deployed to ${deploymentUrl}`);

      // Send success notification
      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          buildId,
          status: "success",
          stage: "deploy",
          deploymentUrl,
          framework,
        },
      });
    } catch (error: any) {
      log.error(`[Deploy] ✗ Deployment failed:`, error.message);

      await notifyQueue.add({
        groupId: job.groupId,
        data: {
          projectId,
          buildId,
          status: "failed",
          stage: "deploy",
          error: error.message,
        },
      });

      throw error;
    }
  },
});

// Worker 4: Notifications
const notifyWorker = new Worker({
  queue: notifyQueue,
  concurrency: 10,
  handler: async (job) => {
    const { projectId, pipelineId, status, stage, deploymentUrl, error } =
      job.data;

    log.info(
      `[Notify] Pipeline ${pipelineId} for project #${projectId} - ${status} at ${stage} stage`
    );

    // Send webhook, email, Slack notification, etc.
    // For demo, just log
    if (status === "success") {
      log.info(`   ✓ Deployment URL: ${deploymentUrl}`);
    } else {
      log.error(`   ✗ Error: ${error}`);
    }
  },
});

// ============================================
// START PIPELINE
// ============================================

async function startPipeline() {
  // Start all workers
  gitWorker.run();
  buildWorker.run();
  deployWorker.run();
  notifyWorker.run();

  const workers = [
    { name: "Git", worker: gitWorker },
    { name: "Build", worker: buildWorker },
    { name: "Deploy", worker: deployWorker },
    { name: "Notify", worker: notifyWorker },
  ];

  workers.forEach(({ name, worker }) => {
    worker.on("completed", (job) => {
      log.info(`[${name}] ✓ Completed job ${job.id}`);
    });

    worker.on("failed", (job) => {
      log.error(`[${name}] ✗ Failed job ${job.id}: ${job.failedReason}`);
    });

    worker.on("error", (error) => {
      log.error(`[${name}] Worker error: ${error.message}`);
    });
  });

  log.info("CI/CD Build pipeline workers started");
}

// Graceful shutdown
async function shutdown() {
  log.warn("Shutting down build pipeline...");

  await Promise.all([
    gitWorker.close(10000),
    buildWorker.close(30000), // Give more time for builds
    deployWorker.close(10000),
    notifyWorker.close(5000),
  ]);

  await redis.quit();
  log.info("Build pipeline shut down gracefully");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server
const PORT = process.env.PORT || 3001;

// Error Middleware
// @ts-ignore
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  log.error(`Error: ${err.message}`);
  return res.status(errorStatus).json({
    success: false,
    data: {
      message: errorMessage,
    },
    stack: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

app.listen(PORT, () => {
  log.info(`Polkalines Build Pipelines Service listening on port ${PORT}`);
  startPipeline().catch(console.error);
});

export default app;
