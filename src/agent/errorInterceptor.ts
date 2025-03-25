import { logger } from "../utils/logger";
import axios from "axios";
import { config } from "../config/config";
import { initializeZeroMqClient, sendZeroMqMessage } from "../zeromqService";
import * as zmq from 'zeromq';

// State management
let zeroMqClient: zmq.Request;
const errors: Error[] = [];
let reportTimeout: NodeJS.Timeout | null = null;
let isReporting = false;
const REPORT_INTERVAL = 1000; // 10 seconds
// const REPORT_INTERVAL = 10000; // 10 seconds
const MAX_BATCH_SIZE = 100;

/**
 * Enrich the error payload with extra context (uptime, node version, etc.)
 */
function enrichError(error: Error) {
  return {
    message: error.message,
    stack: error.stack,
    extra: {
      occurredAt: new Date().toISOString(),
      processUptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development"
    }
  };
}

/**
 * Reports a batch of collected errors to the error-tracking microservice.
 * It uses ZeroMQ first, then falls back to HTTP if needed.
 */
async function reportErrorBatch(type: string): Promise<void> {
  console.log('reporting error in batch');

  if (isReporting) return; // Prevent concurrent reporting

  if (!config.MICRO_SERVICE_URL) {
    logger.warn("⚠️ Skipping error reporting: MICRO_SERVICE_URL is not set.");
    return;
  }

  // Clone errors to prevent race conditions.
  const errorsBatch = [...errors];
  if (errorsBatch.length === 0) return;

  // Clear the batched errors after copying.
  errors.length = 0;
  isReporting = true;

  try {
    // Initialize ZeroMQ client if not already done.
    if (!zeroMqClient) {
      try {
        zeroMqClient = await initializeZeroMqClient();
      } catch (initError) {
        logger.error(`❌ Failed to initialize ZeroMQ client: ${
          initError instanceof Error ? initError.message : "Unknown error"
        }`);
        // Continue with HTTP fallback.
      }
    }

    // Build the enriched payload.
    const errorPayload = {
      channelId: config.CHANNEL_ID,
      type,
      errors: errorsBatch.map(err => enrichError(err)),
      timestamp: new Date().toISOString()
    };

    // Try ZeroMQ first, fall back to HTTP.
    let reported = false;
    if (zeroMqClient) {
      try {
        await sendZeroMqMessage(zeroMqClient, JSON.stringify(errorPayload));
        reported = true;
        logger.info(`✅ Successfully reported ${errorsBatch.length} errors via ZeroMQ`);
      } catch (zmqError) {
        logger.warn(`⚠️ ZeroMQ reporting failed, falling back to HTTP: ${
          zmqError instanceof Error ? zmqError.message : "Unknown error"
        }`);
      }
    }

    // HTTP fallback.
    if (!reported) {
      await axios.post(`${config.MICRO_SERVICE_URL}api/errors`, errorPayload, {
        timeout: 5000
      });
      logger.info(`✅ Successfully reported ${errorsBatch.length} errors via HTTP`);
    }
  } catch (err: unknown) {
    handleReportingError(err, type);
  } finally {
    isReporting = false;
    reportTimeout = null;
  }
}

/**
 * Handles errors that occur during the reporting process.
 */
function handleReportingError(err: unknown, type: string): void {
  if (err instanceof Error) {
    logger.error(`❌ Failed to report ${type}: ${err.message}`, {
      stack: err.stack
    });
  } else {
    logger.error(`❌ Failed to report ${type}: Unknown error`, { error: err });
  }
}

/**
 * Schedules a batch error report using a timeout.
 */
function scheduleErrorReport(type: string): void {
  console.log('start schedule error reporting');

  if (errors.length >= MAX_BATCH_SIZE) {
    if (reportTimeout) {
      clearTimeout(reportTimeout);
      reportTimeout = null;
    }
    void reportErrorBatch(type);
    return;
  }

  if (reportTimeout) {
    clearTimeout(reportTimeout);
  }
  
  reportTimeout = setTimeout(() => {
    if (errors.length > 0) {
      void reportErrorBatch(type);
    }
  }, REPORT_INTERVAL);
}

/**
 * Sets up global error interceptors for:
 * - Uncaught exceptions.
 * - Unhandled promise rejections.
 * - Process warnings.
 * - Process signals to flush errors on shutdown.
 */
export function setupErrorInterceptor(): void {
  process.on("uncaughtException", (error) => {
    logger.error(`🔥 Uncaught Exception: ${error.message}`);
    errors.push(error);
    scheduleErrorReport("uncaughtExceptionBatch");
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error("❗ Unhandled Rejection:", error);
    errors.push(error);
    scheduleErrorReport("unhandledRejectionBatch");
  });
  
  process.on("warning", (warning) => {
    logger.warn(`⚠️ Warning: ${warning.message}`, {
      name: warning.name,
      stack: warning.stack
    });
    errors.push(warning);
    scheduleErrorReport("warningBatch");
  });
  
  // Flush errors on shutdown signals.
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal as NodeJS.Signals, () => {
      logger.info(`Received ${signal}, flushing error reports before shutdown...`);
      
      if (errors.length > 0) {
        void reportErrorBatch("shutdownBatch");
      }
      
      setTimeout(() => process.exit(0), 1500);
    });
  });
}