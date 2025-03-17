"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandlers = void 0;
const telexService_1 = require("./telexService");
const logger_1 = require("./utils/logger");
const setupErrorHandlers = () => {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught Exception:', error);
        (0, telexService_1.captureError)(error, { handled: false, type: 'uncaughtException' });
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        logger_1.logger.error('Unhandled Rejection:', error);
        (0, telexService_1.captureError)(error, { handled: false, type: 'unhandledRejection' });
    });
    // Optionally capture console.error calls
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const error = args[0] instanceof Error ? args[0] : new Error(args.join(' '));
        (0, telexService_1.captureError)(error, { handled: true, type: 'consoleError' });
        originalConsoleError.apply(console, args);
    };
};
exports.setupErrorHandlers = setupErrorHandlers;
