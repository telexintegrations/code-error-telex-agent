"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorInterceptor = void 0;
const logger_1 = require("../utils/logger");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const zeromqService_1 = require("../zeromqService");
let zeroMqClient;
const reportError = async (error, type) => {
    if (!config_1.config.MICRO_SERVICE_URL) {
        logger_1.logger.warn("⚠️ Skipping error reporting: MICRO_SERVICE_URL is not set.");
        return;
    }
    logger_1.logger.info(`🔔 Reporting ${type} to ${config_1.config.MICRO_SERVICE_URL}/api/errors`);
    try {
        if (!zeroMqClient) {
            zeroMqClient = await (0, zeromqService_1.initializeZeroMqClient)();
        }
        const errorPayload = {
            channelId: config_1.config.CHANNEL_ID,
            type,
            message: JSON.stringify(error),
            stack: error[0].stack,
            timestamp: new Date().toISOString(),
        };
        await axios_1.default.post(`${config_1.config.MICRO_SERVICE_URL}/api/errors`, errorPayload);
        await (0, zeromqService_1.sendZeroMqMessage)(zeroMqClient, JSON.stringify(errorPayload));
        logger_1.logger.info(`✅ Successfully reported ${type} to microservice.`);
    }
    catch (err) {
        handleReportingError(err, type);
    }
};
const handleReportingError = (err, type) => {
    if (err instanceof Error) {
        logger_1.logger.error(`❌ Failed to report ${type}: ${err.message}`, {
            stack: err.stack,
        });
    }
    else {
        logger_1.logger.error(`❌ Failed to report ${type}: Unknown error`, { error: err });
    }
};
const setupErrorInterceptor = () => {
    const errors = [];
    process.on("uncaughtException", (error) => {
        logger_1.logger.error(`🔥 Uncaught Exception: ${error.message}`);
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
        logger_1.logger.error('Unhandled Rejection:', error);
        errors.push(error);
    });
    reportError(errors, 'Errors');
};
exports.setupErrorInterceptor = setupErrorInterceptor;
