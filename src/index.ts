import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import { config } from "./config/config";
import { setupErrorInterceptor } from "./agent/errorInterceptor";
import axios from "axios";
import { initializeZeroMqClient } from "./zeromqService";

const app = express();
const PORT: number = config.PORT || 3001;
const RENDER_HEALTH_CHECK_URL: string = "https://your-render-app.onrender.com/health";

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "running", timestamp: new Date().toISOString() });
});

const keepRenderAwake = () => {
  setInterval(async () => {
    try {
      const response = await axios.get(RENDER_HEALTH_CHECK_URL);
      logger.info(`✅ Render Ping Successful: ${response.status} ${response.statusText}`);
    } catch (error: unknown) {
      logger.error(`❌ Render Ping Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, 300000); 
};

const startAgent = (async () => {
  logger.info("🚀 Starting Code Error Detection & Telex Reporting Agent...");

  setupErrorInterceptor();

  try {
    const zmqClient = await initializeZeroMqClient();
    logger.info("🔗 ZeroMQ Client initialized and connected.");
  } catch (error) {
    logger.error("❌ Failed to initialize ZeroMQ Client:", error);
  }

  setTimeout(() => {
    logger.warn("⚠️ Triggering test error...");
    throw new Error("Test Error: This is 1st simulated uncaught exception.");
  }, 200);

  setTimeout(() => {
    logger.warn("⚠️ Triggering test error...");
    throw new Error("Test Error: This 4th simulated uncaught exception.");
  }, 100);

  setTimeout(() => {
    logger.warn("⚠️ Triggering test error...");
    throw new Error("second Error: This is the 3rd simulated uncaught exception.");
  }, 100);
  
  app.listen(PORT, () => {
    logger.info(`⚡ APM Agent running on port ${PORT}`);
  });

  logger.info("🛠️ Agent is now monitoring for uncaught errors.");

  keepRenderAwake();
})();
