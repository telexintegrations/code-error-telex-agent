"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorInterceptor = void 0;
const logger_1 = require("../utils/logger");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
// Function to send error details to the microservice
const reportError = async (error, type) => {
    try {
        await axios_1.default.post(`${config_1.config.MICRO_SERVICE_URL}/errors`, {
            type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });
        logger_1.logger.info(`Reported ${type} to microservice.`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to report ${type}: ${err}`);
    }
};
// Function to set up error interception
const setupErrorInterceptor = () => {
    process.on("uncaughtException", (error) => {
        logger_1.logger.error(`Uncaught Exception: ${error.message}`);
        reportError(error, "uncaughtException");
    });
    process.on("unhandledRejection", (reason) => {
        if (reason instanceof Error) {
            logger_1.logger.error(`Unhandled Rejection: ${reason.message}`);
            reportError(reason, "unhandledRejection");
        }
        else {
            logger_1.logger.error(`Unhandled Rejection: ${String(reason)}`);
        }
    });
};
exports.setupErrorInterceptor = setupErrorInterceptor;
