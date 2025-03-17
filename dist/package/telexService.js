"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureError = exports.initializeTelex = void 0;
const logger_1 = require("./utils/logger");
const zeromqService_1 = require("./zeromqService");
let currentConfig = null;
let zmqClient = null;
/**
 * This function initializes the Telex SDK with the provided configuration.
 * @param config[channelId] - The unique identifier for the Telex channel.
 * @param config[enableConsoleCapture] - Whether to capture console logs. Defaults to true.
 * @param config[tags] - Additional tags to be associated with the logs. Defaults to an empty object.
 * @returns Promise<void]
 */
const initializeTelex = async (config) => {
    if (!config.channelId) {
        throw new Error('Telex initialization failed: channelId is required');
    }
    currentConfig = {
        enableConsoleCapture: true,
        ...config
    };
    try {
        zmqClient = await (0, zeromqService_1.initializeZeroMqClient)();
        logger_1.logger.info('Telex SDK initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Telex SDK:', error);
        throw error;
    }
};
exports.initializeTelex = initializeTelex;
const captureError = async (error, context) => {
    if (!currentConfig || !zmqClient) {
        logger_1.logger.warn('Telex not initialized. Call initializeTelex first.');
        return;
    }
    const errorPayload = {
        channelId: currentConfig.channelId,
        type: error.name,
        message: error.message,
        stack: error.stack,
        context,
        tags: currentConfig.tags,
        timestamp: new Date().toISOString(),
    };
    try {
        await (0, zeromqService_1.sendZeroMqMessage)(zmqClient, JSON.stringify(errorPayload));
        logger_1.logger.info('Error captured and sent to Telex');
    }
    catch (err) {
        logger_1.logger.error('Failed to send error to Telex:', err);
    }
};
exports.captureError = captureError;
