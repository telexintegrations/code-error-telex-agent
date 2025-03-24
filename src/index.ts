import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import { config } from "./config/config";
import { setupErrorInterceptor } from "./agent/errorInterceptor";
import axios from "axios";
import { initializeZeroMqClient } from "./zeromqService";

const app = express();
const PORT: number = config.PORT || 3001;
const RENDER_HEALTH_CHECK_URL: string = "https://system-integration.staging.telex.im/code-error-integration/health";

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "🟢 Running", timestamp: new Date().toISOString() });
});

// Separate the test error simulation into its own function
const simulateTestErrors = () => {
  // First error after 2 seconds
  setTimeout(() => {
    logger.warn("⚠️ [Test] Triggering first test error...");
    throw new Error("Test Error [1]: Simulated uncaught exception.");
  }, 2000);
  // Second error after 4 seconds
  setTimeout(() => {
    logger.warn("⚠️ [Test] Triggering second test error...");
    throw new Error("Test Error [2]: Simulated uncaught exception.");
  }, 4000);
  // Third error after 6 seconds
  setTimeout(() => {
    logger.warn("⚠️ [Test] Triggering third test error...");
    throw new Error("Test Error [3]: Simulated uncaught exception.");
  }, 6000);
  logger.info("🧪 [Setup] Test errors scheduled. Fasten your seatbelts!");
};

const keepRenderAwake = () => {
  setInterval(async () => {
    try {
      const response = await axios.get(RENDER_HEALTH_CHECK_URL);
      logger.info(`✅ Render Ping: ${response.status} ${response.statusText}`);
    } catch (error: unknown) {
      logger.error(`❌ Render Ping Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, 300000);
};

// Main SDK initialization function for external use
export const initializeTelexSDK = async (config: { channelId: string }) => {
  if (!config.channelId) {
    throw new Error("Channel ID is essential for SDK initialization!");
  }
  process.env.CHANNEL_ID = config.channelId;
  logger.info("🚀 [SDK] Initializing Telex SDK...");
  try {
    await startAgent(false); // Don't run test errors when used as SDK
  } catch (error) {
    logger.error("❌ [SDK] Failed to initialize Telex SDK:", error);
    throw error;
  }
};

// Modified startAgent to accept testing parameter
const startAgent = async (isTestMode: boolean = false) => {
  logger.info("🚀 [Agent] Starting Code Error Detection & Telex Reporting Agent...");
  setupErrorInterceptor();
  try {
    const zmqClient = await initializeZeroMqClient();
    logger.info("🔗 [Agent] ZeroMQ Client successfully initialized and connected.");
  } catch (error) {
    logger.error("❌ [Agent] ZeroMQ Client initialization failed:", error);
  }
  if (isTestMode) {
    simulateTestErrors();
  }
  app.listen(PORT, () => {
    logger.info(`⚡ [Agent] APM Agent running on port ${PORT}`);
  });
  logger.info("🛠️ [Agent] Now monitoring for uncaught errors...");
  keepRenderAwake();
};

// If running directly (npm run dev), start in test mode
if (require.main === module) {
  logger.info("🧪 [Mode] Starting in test mode...");
  startAgent(true);
}