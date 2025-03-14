"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("./utils/logger");
const config_1 = require("./config/config");
const errorInterceptor_1 = require("./agent/errorInterceptor");
const axios_1 = __importDefault(require("axios")); // Ensure axios is installed: npm install axios
const app = (0, express_1.default)();
const PORT = config_1.config.PORT || 3001;
const RENDER_HEALTH_CHECK_URL = "https://your-render-app.onrender.com/health"; // Replace with actual URL
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
            if (error instanceof Error) {
                logger_1.logger.error(`❌ Render Ping Failed: ${error.message}`);
            }
            else {
                logger_1.logger.error("❌ Render Ping Failed: Unknown error");
            }
        }
    }, 300000); // 5 minutes
};
const startAgent = () => {
    logger_1.logger.info("🚀 Starting Code Error Detection & Telex Reporting Agent...");
    (0, errorInterceptor_1.setupErrorInterceptor)();
    // Simulate an error after a delay
    setTimeout(() => {
        throw new Error("Test Error: This is a simulated uncaught exception.");
    }, 5000);
    // Start HTTP server
    app.listen(PORT, () => {
        logger_1.logger.info(`⚡ APM Agent running on port ${PORT}`);
    });
    logger_1.logger.info("🛠️ Agent is now monitoring for uncaught errors.");
    // Start keeping Render awake
    keepRenderAwake();
};
startAgent();
