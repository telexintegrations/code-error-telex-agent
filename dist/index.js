"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("./utils/logger");
const config_1 = require("./config/config");
const errorInterceptor_1 = require("./agent/errorInterceptor");
const axios_1 = __importDefault(require("axios"));
const zeromqService_1 = require("./zeromqService");
const app = (0, express_1.default)();
const PORT = config_1.config.PORT || 3001;
const RENDER_HEALTH_CHECK_URL = "https://your-render-app.onrender.com/health";
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "running", timestamp: new Date().toISOString() });
});
const keepRenderAwake = () => {
    setInterval(async () => {
        try {
            const response = await axios_1.default.get(RENDER_HEALTH_CHECK_URL);
            logger_1.logger.info(`✅ Render Ping Successful: ${response.status} ${response.statusText}`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Render Ping Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }, 300000);
};
const startAgent = (async () => {
    logger_1.logger.info("🚀 Starting Code Error Detection & Telex Reporting Agent...");
    (0, errorInterceptor_1.setupErrorInterceptor)();
    try {
        const zmqClient = await (0, zeromqService_1.initializeZeroMqClient)();
        logger_1.logger.info("🔗 ZeroMQ Client initialized and connected.");
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to initialize ZeroMQ Client:", error);
    }
    setTimeout(() => {
        logger_1.logger.warn("⚠️ Triggering test error...");
        throw new Error("Test Error: This is 1st simulated uncaught exception.");
    }, 200);
    setTimeout(() => {
        logger_1.logger.warn("⚠️ Triggering test error...");
        throw new Error("Test Error: This 4th simulated uncaught exception.");
    }, 100);
    setTimeout(() => {
        logger_1.logger.warn("⚠️ Triggering test error...");
        throw new Error("second Error: This is the 3rd simulated uncaught exception.");
    }, 100);
    app.listen(PORT, () => {
        logger_1.logger.info(`⚡ APM Agent running on port ${PORT}`);
    });
    logger_1.logger.info("🛠️ Agent is now monitoring for uncaught errors.");
    keepRenderAwake();
})();
