import { Client, Container } from "@dagger.io/dagger";
import { applogger as log } from "../../utils/logger.js";

/**
 * Build an ink! smart contract using Dagger
 */
export async function buildInkContract(
  client: Client,
  repoUrl: string,
  branch: string,
  contractPath: string = "."
) {
  log.info("[Dagger] Building ink! contract...");

  // Get Git repository
  const repo = client.git(repoUrl).branch(branch).tree();

  // Use Parity's contracts CI image with Rust + cargo-contract
  const container = client
    .container()
    .from("paritytech/contracts-ci-linux:production")
    .withDirectory("/workspace", repo)
    .withWorkdir(`/workspace/${contractPath}`);

  // Build the contract
  const built = container.withExec(["cargo", "contract", "build", "--release"]);

  // Get build artifacts
  const artifactsDir = built.directory("./target/ink");
  const entries = await artifactsDir.entries();

  log.info(`[Dagger] Build artifacts: ${entries}`);

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
  contractPath: string = "."
) {
  log.info("[Dagger] Testing ink! contract...");

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from("paritytech/contracts-ci-linux:production")
    .withDirectory("/workspace", repo)
    .withWorkdir(`/workspace/${contractPath}`);

  // Run tests
  const tested = container.withExec(["cargo", "test", "--release"]);

  const stdout = await tested.stdout();
  const stderr = await tested.stderr();

  return {
    container: tested,
    logs: stdout,
    errors: stderr,
    success: !stderr.includes("FAILED"),
  };
}

/**
 * Build a Vite-based dApp using Dagger
 */
export async function buildViteDapp(
  client: Client,
  repoUrl: string,
  branch: string,
  buildDir: string = "."
) {
  log.info("[Dagger] Building Vite dApp...");

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(["npm", "install", "--frozen-lockfile"])
    .withExec(["npm", "run", "build"]);

  const distDir = container.directory("/app/dist");

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
  buildDir: string = "."
) {
  log.info("[Dagger] Building Next.js dApp...");

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(["npm", "install", "--frozen-lockfile"])
    .withExec(["npm", "run", "build"]);

  const buildOutput = container.directory("/app/.next");

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
  buildDir: string = "."
) {
  log.info("[Dagger] Building Svelte dApp...");

  const repo = client.git(repoUrl).branch(branch).tree();

  const container = client
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", repo)
    .withWorkdir(`/app/${buildDir}`)
    .withExec(["npm", "install", "--frozen-lockfile"])
    .withExec(["npm", "run", "build"]);

  const distDir = container.directory("/app/build");

  return {
    container,
    distDir,
    logs: await container.stdout(),
  };
}

/**
 * Export build artifacts to local directory
 */
export async function exportArtifacts(
  container: Container,
  outputPath: string
) {
  await container.export(outputPath);
  log.info(`[Dagger] Exported artifacts to ${outputPath}`);
}
