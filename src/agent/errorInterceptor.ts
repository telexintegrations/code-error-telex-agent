import { logger } from "../utils/logger";
import axios from "axios";
import { getConfig } from "../config/config";
import { initializeZeroMqClient, sendZeroMqMessage } from "../zeromqService";
import * as zmq from "zeromq";

/**
 * Error reporting service that collects and batches errors
 * before periodically sending them to a microservice.
 */
class ErrorReporter {
  private static instance: ErrorReporter;
  private zeroMqClient: zmq.Request | null = null;
  private errorQueue: Error[] = [];
  private reportInterval: NodeJS.Timeout | null = null;
  private isReporting = false;

  // Configuration
  private readonly REPORT_INTERVAL = 10000; // 10 seconds
  private readonly MAX_BATCH_SIZE = 100;

  private constructor() {
    // Start the periodic reporting as soon as the instance is created
    this.startPeriodicReporting();
  }

  /**
   * Get the singleton instance of ErrorReporter
   */
  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  /**
   * Start periodic error reporting
   */
  private startPeriodicReporting(): void {
    if (this.reportInterval) return; // Already running

    this.reportInterval = setInterval(() => {
      if (this.errorQueue.length > 0) {
        void this.reportBatch();
      }
    }, this.REPORT_INTERVAL);

    // Prevent the interval from keeping the process alive
    if (this.reportInterval.unref) {
      this.reportInterval.unref();
    }
  }

  /**
   * Stop periodic error reporting
   */
  private stopPeriodicReporting(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
  }

  /**
   * Initialize the ZeroMQ client connection
   */
  public async initializeClient(): Promise<void> {
    if (this.zeroMqClient) return;

    try {
      this.zeroMqClient = await initializeZeroMqClient();
      logger.info("✅ ZeroMQ client successfully initialized");
    } catch (error) {
      logger.warn(
        `⚠️ Failed to initialize ZeroMQ client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // We'll continue without the client and fall back to HTTP when needed
    }
  }

  /**
   * Enrich the error payload with context information
   */
  private enrichError(error: Error) {
    return {
      message: error.message,
      stack: error.stack,
      extra: {
        occurredAt: new Date().toISOString(),
        processUptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    };
  }

  /**
   * Queue an error for batch reporting
   */
  public queueError(error: Error, errorType: string): void {
    this.errorQueue.push(error);

    // Log the error based on type
    if (errorType === "uncaughtException") {
      logger.error(`🔥 Uncaught Exception: ${error.message}`);
    } else if (errorType === "unhandledRejection") {
      logger.error(`❗ Unhandled Rejection: ${error.message}`);
    } else if (errorType === "warning") {
      logger.warn(`⚠️ Warning: ${error.message}`, {
        name: error instanceof Error ? error.name : "Warning",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    // If we hit the batch size limit, trigger an immediate report
    if (this.errorQueue.length >= this.MAX_BATCH_SIZE) {
      void this.reportBatch();
    }
  }

  /**
   * Report the current batch of errors
   */
  private async reportBatch(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) return;

    if (!getConfig().MICRO_SERVICE_URL) {
      logger.warn("⚠️ Skipping error reporting: MICRO_SERVICE_URL is not set.");
      return;
    }

    // Take a snapshot of the current errors and clear the queue
    const errorsBatch = [...this.errorQueue];
    this.errorQueue.length = 0;
    this.isReporting = true;

    try {
      // Initialize the client if not already done
      if (!this.zeroMqClient) {
        await this.initializeClient();
      }

      const errorPayload = {
        channelId: getConfig().CHANNEL_ID,
        type: "errorBatch",
        errors: errorsBatch.map((err) => this.enrichError(err)),
        timestamp: new Date().toISOString(),
      };

      // Try ZeroMQ first, fall back to HTTP if needed
      let reported = false;

      if (this.zeroMqClient) {
        try {
          await sendZeroMqMessage(
            this.zeroMqClient,
            JSON.stringify(errorPayload)
          );
          reported = true;
          logger.info(`✅ Reported ${errorsBatch.length} errors via ZeroMQ`);
        } catch (zmqError) {
          logger.warn(
            `⚠️ ZeroMQ reporting failed, falling back to HTTP: ${
              zmqError instanceof Error ? zmqError.message : "Unknown error"
            }`
          );
        }
      }

      // HTTP fallback if ZeroMQ failed or is not available
      if (!reported) {
        await axios.post(
          `${getConfig().MICRO_SERVICE_URL}api/errors`,
          errorPayload,
          {
            timeout: 5000,
          }
        );
        logger.info(`✅ Reported ${errorsBatch.length} errors via HTTP`);
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`❌ Failed to report errors: ${err.message}`, {
          stack: err.stack,
        });
      } else {
        logger.error(`❌ Failed to report errors: Unknown error`, {
          error: err,
        });
      }

      // Re-queue errors on failure (to try again later)
      this.errorQueue.push(...errorsBatch);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * Force error reporting (used during shutdown)
   */
  public async flushErrors(): Promise<void> {
    logger.info(`Flushing error reports before shutdown...`);

    // Stop the periodic reporting
    this.stopPeriodicReporting();

    // Force a final report if there are any errors
    if (this.errorQueue.length > 0) {
      await this.reportBatch();
    }
  }
}

/**
 * Sets up global error interceptors for:
 * - Uncaught exceptions
 * - Unhandled promise rejections
 * - Process warnings
 * - Process signals (for clean shutdown)
 */
export function setupErrorInterceptor(): void {
  const errorReporter = ErrorReporter.getInstance();

  // Initialize ZeroMQ client
  void errorReporter.initializeClient();

  // Set up error handlers
  process.on("uncaughtException", (error) => {
    errorReporter.queueError(error, "uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorReporter.queueError(error, "unhandledRejection");
  });

  process.on("warning", (warning) => {
    errorReporter.queueError(warning, "warning");
  });

  // Set up shutdown handlers
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal as NodeJS.Signals, async () => {
      logger.info(`Received ${signal}, preparing for shutdown...`);

      try {
        await errorReporter.flushErrors();
      } catch (error) {
        logger.error("Error during shutdown sequence:", error);
      }

      // Exit after giving time for reports to complete
      setTimeout(() => process.exit(0), 1500);
    });
  });
}
