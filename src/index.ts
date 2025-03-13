import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import { config } from "./config/config";
import { setupErrorInterceptor } from "./agent/errorInterceptor";
import axios from "axios"; // Ensure axios is installed: npm install axios

const app = express();
const PORT: number = config.PORT || 3001;
const RENDER_HEALTH_CHECK_URL: string = "https://your-render-app.onrender.com/health"; // Replace with actual URL

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
      if (error instanceof Error) {
        logger.error(`❌ Render Ping Failed: ${error.message}`);
      } else {
        logger.error("❌ Render Ping Failed: Unknown error");
      }
    }
  }, 300000); // 5 minutes
};

const startAgent = () => {
  logger.info("🚀 Starting Code Error Detection & Telex Reporting Agent...");

  setupErrorInterceptor();

  // Simulate an error after a delay
  setTimeout(() => {
    throw new Error("Test Error: This is a simulated uncaught exception.");
  }, 5000);

  // Start HTTP server
  app.listen(PORT, () => {
    logger.info(`⚡ APM Agent running on port ${PORT}`);
  });

  logger.info("🛠️ Agent is now monitoring for uncaught errors.");

  // Start keeping Render awake
  keepRenderAwake();
};

startAgent();
