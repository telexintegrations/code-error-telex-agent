"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureError = exports.initializeTelexSDK = void 0;
const errorHandlerService_1 = require("./errorHandlerService");
const telexService_1 = require("./telexService");
Object.defineProperty(exports, "captureError", { enumerable: true, get: function () { return telexService_1.captureError; } });
const logger_1 = require("./utils/logger");
const initializeTelexSDK = async (options) => {
    try {
        await (0, telexService_1.initializeTelex)(options);
        (0, errorHandlerService_1.setupErrorHandlers)();
        logger_1.logger.info('Telex SDK ready to capture errors');
        return { captureError: telexService_1.captureError };
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Telex SDK:', error);
        throw error;
    }
};
exports.initializeTelexSDK = initializeTelexSDK;
// Example usage in user's code:
// import { initializeTelexSDK, captureError } from 'telex-error-sdk';
//
// await initializeTelexSDK({
//   channelId: 'your-channel-id',
//   tags: { environment: 'production' }
// });
//
// try {
//   // User's code
// } catch (error) {
//   captureError(error);
// }
