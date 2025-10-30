import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  repoUrl: text("repo_url").notNull(),
  type: text("type").notNull(), // 'ink-contract' | 'dapp'
  framework: text("framework"), // 'vite' | 'nextjs' | 'svelte' | 'sveltekit'
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const pipelines = sqliteTable("pipelines", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  status: text("status").notNull(), // 'pending' | 'running' | 'success' | 'failed'
  jobId: text("job_id"),
  logs: text("logs"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const deployments = sqliteTable("deployments", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id")
    .notNull()
    .references(() => pipelines.id),
  contractAddress: text("contract_address"),
  network: text("network").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
