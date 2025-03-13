import { logger } from "../utils/logger";

import axios from "axios";
import { config } from "../config/config";

const reportError = async (error: Error, type: string) => {
    if (!config.MICRO_SERVICE_URL) {
      logger.warn(`Skipping error reporting: MICRO_SERVICE_URL is not set.`);
      return;
    }
  
    logger.info(`Reporting ${type} to ${config.MICRO_SERVICE_URL}/api/errors`);
  
    try {
      await axios.post(`${config.MICRO_SERVICE_URL}/api/errors`, {
        type,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
  
      logger.info(`Reported ${type} to microservice.`);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            logger.error(`Failed to report ${type}: ${err.message}`, {
              status: err.response?.status,
              data: err.response?.data,
              config: err.config,
            });
          } else {
            logger.error(`Failed to report ${type}:`, err);
          }
    }
  };
  
// Function to set up error interception
export const setupErrorInterceptor = () => {
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    reportError(error, "uncaughtException");
  });

  process.on("unhandledRejection", (error) => {
    if (error instanceof Error) {
      logger.error(`Unhandled Rejection: ${error.message}`);
      setImmediate(() => reportError(error, "uncaughtException"));
    } else {
      logger.error(`Unhandled Rejection: ${String(error)}`);
    }
  });
};
