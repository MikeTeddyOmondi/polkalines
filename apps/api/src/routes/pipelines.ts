import express, { type Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { pipelines, projects } from "../db/schema.js";
import { gitQueue } from "../services/queue/setup.js";
import { eq } from "drizzle-orm";

const router: Router = express.Router();

// Create new pipeline run
router.post("/", async (req, res) => {
  const { projectId, type } = req.body;

  try {
    // Verify project exists
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create pipeline record
    const pipelineId = nanoid();
    await db.insert(pipelines).values({
      id: pipelineId,
      projectId,
      status: "pending",
    });

    // Queue the job
    const job = await gitQueue.add({
      groupId: projectId, // Ensures jobs for same project run in order
      data: {
        projectId,
        pipelineId,
        type: project.type,
        framework: project.framework,
        repoUrl: project.repoUrl,
        branch: "main", // Default to main branch
      },
    });

    res.json({
      pipelineId,
      jobId: job.id,
      status: "pending",
    });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// Get pipeline status
router.get("/:id", async (req, res) => {
  try {
    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, req.params.id),
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json(pipeline);
  } catch (error) {
    console.error("Error fetching pipeline:", error);
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});

// Get pipeline logs
router.get("/:id/logs", async (req, res) => {
  try {
    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, req.params.id),
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json({
      logs: pipeline.logs || "",
    });
  } catch (error) {
    console.error("Error fetching pipeline logs:", error);
    res.status(500).json({ error: "Failed to fetch pipeline logs" });
  }
});

// Cancel pipeline
router.post("/:id/cancel", async (req, res) => {
  try {
    const pipeline = await db.query.pipelines.findFirst({
      where: eq(pipelines.id, req.params.id),
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    if (pipeline.status === "completed" || pipeline.status === "failed") {
      return res.status(400).json({ error: "Pipeline already finished" });
    }

    await db
      .update(pipelines)
      .set({
        status: "failed",
        logs: pipeline.logs + "\nPipeline cancelled by user",
        completedAt: new Date(),
      })
      .where(eq(pipelines.id, req.params.id));

    res.json({ message: "Pipeline cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling pipeline:", error);
    res.status(500).json({ error: "Failed to cancel pipeline" });
  }
});

export default router;
