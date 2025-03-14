import { logger } from "../utils/logger";
import axios from "axios";
import { config } from "../config/config";
import { initializeZeroMqClient, sendZeroMqMessage } from "../zeromqService";
import * as zmq from 'zeromq'

let zeroMqClient: zmq.Request;

const reportError = async (error: Error, type: string): Promise<void> => {
  if (!config.MICRO_SERVICE_URL) {
    logger.warn("Skipping error reporting: MICRO_SERVICE_URL is not set.");
    return;
  }

  logger.info(`Reporting ${type} to ${config.MICRO_SERVICE_URL}/api/errors`);

  try {
    if (!zeroMqClient) {
      zeroMqClient = await initializeZeroMqClient();
    }

    await axios.post(`${config.MICRO_SERVICE_URL}/api/errors`, {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    console.log(config.CHANNEL_ID)
    await sendZeroMqMessage(zeroMqClient, JSON.stringify({
      channelId: config.CHANNEL_ID,
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }));

    logger.info(`Reported ${type} to microservice.`);
  } catch (err: unknown) {

    if (err instanceof Error) {
      logger.error(`Failed to report ${type}: ${err.message}`, {
        stack: err.stack,
      });
    } else {
      logger.error(`Failed to report ${type}: Unknown error`, err);
    }

  }
};

export const setupErrorInterceptor = (): void => {
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    reportError(error, "uncaughtException");
  });

  process.on("unhandledRejection", (error) => {
    if (error instanceof Error) {
      logger.error(`Unhandled Rejection: ${error.message}`);
      setImmediate(() => reportError(error, "unhandledRejection"));
    } else {
      logger.error(`Unhandled Rejection: ${String(error)}`);
    }
  });
};
