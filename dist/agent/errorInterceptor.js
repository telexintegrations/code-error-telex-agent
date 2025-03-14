"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorInterceptor = void 0;
const logger_1 = require("../utils/logger");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const reportError = async (error, type) => {
    if (!config_1.config.MICRO_SERVICE_URL) {
        logger_1.logger.warn(`Skipping error reporting: MICRO_SERVICE_URL is not set.`);
        return;
    }
    logger_1.logger.info(`Reporting ${type} to ${config_1.config.MICRO_SERVICE_URL}/api/errors`);
    try {
        await axios_1.default.post(`${config_1.config.MICRO_SERVICE_URL}/api/errors`, {
            type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });
        logger_1.logger.info(`Reported ${type} to microservice.`);
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err)) {
            logger_1.logger.error(`Failed to report ${type}: ${err.message}`, {
                status: err.response?.status,
                data: err.response?.data,
                config: err.config,
            });
        }
        else {
            logger_1.logger.error(`Failed to report ${type}:`, err);
        }
    }
};
// Function to set up error interception
const setupErrorInterceptor = () => {
    process.on("uncaughtException", (error) => {
        logger_1.logger.error(`Uncaught Exception: ${error.message}`);
        reportError(error, "uncaughtException");
    });
    process.on("unhandledRejection", (error) => {
        if (error instanceof Error) {
            logger_1.logger.error(`Unhandled Rejection: ${error.message}`);
            setImmediate(() => reportError(error, "uncaughtException"));
        }
        else {
            logger_1.logger.error(`Unhandled Rejection: ${String(error)}`);
        }
    });
};
exports.setupErrorInterceptor = setupErrorInterceptor;
