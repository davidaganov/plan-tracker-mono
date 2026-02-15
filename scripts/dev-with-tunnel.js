import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const BACKEND_ENV_PATH = path.resolve(__dirname, "../backend/.env");
const TUNNEL_CMD = "cloudflared";
const TUNNEL_ARGS = ["tunnel", "--url", "http://localhost:5173", "--protocol", "http2"];

/**
 * Determines the correct npm command based on the operating system.
 * Windows requires 'npm.cmd', while Unix-like systems use 'npm'.
 */
const NPM_CMD = process.platform === "win32" ? "npm.cmd" : "npm";
const DEV_CMD_ARGS = ["run", "dev:all"];

/** @type {import('child_process').ChildProcess | null} */
let tunnelProcess = null;

/** @type {import('child_process').ChildProcess | null} */
let devProcess = null;

/**
 * Updates the BOT_WEBAPP_URL in the backend .env file.
 * If the variable exists, it updates it; otherwise, it appends it.
 *
 * @param {string} url - The tunnel URL to set in the environment file
 * @throws {Error} When the .env file cannot be read or written
 */
const updateBackendEnv = (url) => {
  try {
    let envContent = fs.readFileSync(BACKEND_ENV_PATH, "utf8");
    const updateRegex = /^BOT_WEBAPP_URL=.*$/m;

    if (updateRegex.test(envContent)) {
      envContent = envContent.replace(updateRegex, `BOT_WEBAPP_URL=${url}`);
      console.log(`[Script] Updated BOT_WEBAPP_URL to ${url}`);
    } else {
      const prefix = envContent.endsWith("\n") ? "" : "\n";
      envContent += `${prefix}BOT_WEBAPP_URL=${url}\n`;
      console.log(`[Script] Appended BOT_WEBAPP_URL=${url}`);
    }

    fs.writeFileSync(BACKEND_ENV_PATH, envContent, "utf8");
  } catch (err) {
    console.error("[Script] Error updating .env:", err);
    cleanup();
    process.exit(1);
  }
};

/**
 * Starts the development servers (backend and frontend) using npm-run-all.
 * Spawns the process in a cross-platform compatible way using shell mode.
 *
 * @returns {void}
 */
const startDev = () => {
  if (devProcess) return;

  console.log("[Script] Starting dev servers...");

  devProcess = spawn(NPM_CMD, DEV_CMD_ARGS, {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    shell: true, // Cross-platform shell execution
  });

  devProcess.on("exit", (code) => {
    console.log(`[Script] Dev process exited with code ${code}`);
    cleanup();
  });

  devProcess.on("error", (err) => {
    console.error("[Script] Failed to start dev servers:", err);
    cleanup();
    process.exit(1);
  });
};

/**
 * Starts the Cloudflare Tunnel and monitors its output for the tunnel URL.
 * When a URL is detected, it updates the backend .env and starts dev servers.
 *
 * @returns {void}
 */
const startTunnel = () => {
  console.log("[Script] Starting Cloudflare Tunnel...");

  tunnelProcess = spawn(TUNNEL_CMD, TUNNEL_ARGS, {
    shell: process.platform === "win32", // Windows may need shell for cloudflared
  });

  // Monitor stderr for tunnel URL (cloudflared outputs to stderr)
  tunnelProcess.stderr.on("data", (data) => {
    const output = data.toString();

    // Extract the tunnel URL from cloudflared output
    const urlMatch = output.match(
      /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/,
    );

    if (urlMatch) {
      const url = urlMatch[0];
      console.log(`[Script] Tunnel URL found: ${url}`);

      // Only update env and start dev once
      if (!devProcess) {
        updateBackendEnv(url);
        startDev();
      }
    }
  });

  // Also monitor stdout just in case
  tunnelProcess.stdout.on("data", (data) => {
    const output = data.toString();
    const urlMatch = output.match(
      /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/,
    );

    if (urlMatch && !devProcess) {
      const url = urlMatch[0];
      console.log(`[Script] Tunnel URL found: ${url}`);
      updateBackendEnv(url);
      startDev();
    }
  });

  tunnelProcess.on("error", (err) => {
    console.error("[Script] Failed to start tunnel:", err);
    console.error(
      "[Script] Make sure 'cloudflared' is installed and in your PATH",
    );
    process.exit(1);
  });

  tunnelProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[Script] Tunnel exited with code ${code}`);
    }
    cleanup();
  });
};

/**
 * Gracefully terminates all child processes and exits the script.
 * Handles proper cleanup on both Unix-like systems and Windows.
 *
 * @returns {void}
 */
const cleanup = () => {
  console.log("[Script] Cleaning up...");

  // Kill processes with cross-platform compatibility
  if (devProcess && !devProcess.killed) {
    if (process.platform === "win32") {
      // Windows needs taskkill for proper tree termination
      spawn("taskkill", ["/pid", devProcess.pid.toString(), "/f", "/t"]);
    } else {
      devProcess.kill("SIGTERM");
    }
    devProcess = null;
  }

  if (tunnelProcess && !tunnelProcess.killed) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", tunnelProcess.pid.toString(), "/f", "/t"]);
    } else {
      tunnelProcess.kill("SIGTERM");
    }
    tunnelProcess = null;
  }

  process.exit();
};

// Handle graceful shutdown on termination signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Windows doesn't support SIGINT/SIGTERM well, so also handle beforeExit
if (process.platform === "win32") {
  process.on("beforeExit", cleanup);
}

// Start the tunnel
startTunnel();
