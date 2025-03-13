import express from "express";
import { logger } from "./utils/logger";
import { config } from "./config/config";
import { setupErrorInterceptor } from "./agent/errorInterceptor";

const app = express();
const PORT = config.PORT || 3001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "running", timestamp: new Date().toISOString() });
});

const startAgent = () => {
  logger.info("Starting Code Error Detection & Telex Reporting Agent...");

  setupErrorInterceptor();

  // Simulate an error after a delay
    setTimeout(() => {
        throw new Error("Test Error: This is a simulated uncaught exception.");
  }, 5000);

  // Start HTTP server
  app.listen(PORT, () => {
    logger.info(`APM Agent running on port ${PORT}`);
  });

  logger.info("Agent is now monitoring for uncaught errors.");
};

startAgent();
