import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import projectsRouter from "./routes/projects.js";
import pipelinessRouter from "./routes/pipelines.js";

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
    message: "Serverless Express with TypeScript is running!",
  });
});

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
