import { logger } from "../utils/logger";
import axios from "axios";
import { config } from "../config/config";
import { initializeZeroMqClient, sendZeroMqMessage } from "../zeromqService";
import * as zmq from 'zeromq';

let zeroMqClient: zmq.Request;

const reportError = async (error: Error[], type: string): Promise<void> => {
  if (!config.MICRO_SERVICE_URL) {
    logger.warn("⚠️ Skipping error reporting: MICRO_SERVICE_URL is not set.");
    return;
  }

  logger.info(`🔔 Reporting ${type} to ${config.MICRO_SERVICE_URL}/api/errors`);

  try {
    if (!zeroMqClient) {
      zeroMqClient = await initializeZeroMqClient();
    }

    const errorPayload = {
      channelId: config.CHANNEL_ID,
      type,
      message: JSON.stringify(error),
      stack: error[0].stack,
      timestamp: new Date().toISOString(),
    };

    await axios.post(`${config.MICRO_SERVICE_URL}/api/errors`, errorPayload);

    await sendZeroMqMessage(zeroMqClient, JSON.stringify(errorPayload));

    logger.info(`✅ Successfully reported ${type} to microservice.`);
  } catch (err: unknown) {
    handleReportingError(err, type);
  }
};

const handleReportingError = (err: unknown, type: string): void => {
  if (err instanceof Error) {
    logger.error(`❌ Failed to report ${type}: ${err.message}`, {
      stack: err.stack,
    });
  } else {
    logger.error(`❌ Failed to report ${type}: Unknown error`, { error: err });
  }
};


export const setupErrorInterceptor = (): void => {

  const errors: Error[] = [];
  process.on("uncaughtException", (error) => {
    logger.error(`🔥 Uncaught Exception: ${error.message}`);
    errors.push(error);
    // reportError(error, "uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    //   if (reason instanceof Error) {
    //     logger.error(`⚡ Unhandled Rejection: ${reason.message}`);
    //     setImmediate(() => reportError(reason, "unhandledRejection"));
    //   } else {
    //     logger.error(`⚡ Unhandled Rejection: ${String(reason)}`);
    //   }
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled Rejection:', error);
    errors.push(error);
  });

  reportError(errors, 'Errors')

};
