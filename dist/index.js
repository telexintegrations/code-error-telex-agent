"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("./utils/logger");
const config_1 = require("./config/config");
const errorInterceptor_1 = require("./agent/errorInterceptor");
// Initialize Express
const app = (0, express_1.default)();
const PORT = config_1.config.PORT || 3001;
// Middleware for JSON
app.use(express_1.default.json());
// Health Check Route
app.get("/health", (_req, res) => {
    res.json({ status: "running", timestamp: new Date().toISOString() });
});
// Start APM agent
const startAgent = () => {
    logger_1.logger.info("Starting Code Error Detection & Telex Reporting Agent...");
    // Setup error capturing
    (0, errorInterceptor_1.setupErrorInterceptor)();
    // Start HTTP server
    app.listen(PORT, () => {
        logger_1.logger.info(`APM Agent running on port ${PORT}`);
    });
    logger_1.logger.info("Agent is now monitoring for uncaught errors.");
};
// Start the agent
startAgent();
