import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "turso",
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL || "libsql://127.0.0.1:8080?tls=0",
    authToken: process.env.AUTH_TOKEN,
  },
});
