import express, { type Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { projects } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router: Router = express.Router();

// Create new project
router.post("/", async (req, res) => {
  const { name, repoUrl, type, framework } = req.body;

  try {
    const projectId = nanoid();
    await db.insert(projects).values({
      id: projectId,
      name,
      repoUrl,
      type,
      framework,
    });

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// List all projects
router.get("/", async (_, res) => {
  try {
    const allProjects = await db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });
    res.json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  const { name, repoUrl, framework } = req.body;

  try {
    await db
      .update(projects)
      .set({ name, repoUrl, framework, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id));

    const updated = await db.query.projects.findFirst({
      where: eq(projects.id, req.params.id),
    });

    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, req.params.id))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
