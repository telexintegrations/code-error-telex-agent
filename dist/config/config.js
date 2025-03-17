"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const configFilePath = path_1.default.resolve(__dirname, "../../config.json");
let fileConfig = {};
if (fs_1.default.existsSync(configFilePath)) {
    try {
        const fileContent = fs_1.default.readFileSync(configFilePath, "utf-8");
        fileConfig = JSON.parse(fileContent);
    }
    catch (error) {
        console.error("❌ Error reading config file:", error);
    }
}
exports.config = {
    PORT: Number(process.env.PORT) || fileConfig.PORT || 3000,
    CHANNEL_ID: loadChannelIdFromConfig() || process.env.CHANNEL_ID || "",
    MICRO_SERVICE_URL: process.env.MICRO_SERVICE_URL ||
        fileConfig.MICRO_SERVICE_URL ||
        "https://code-error-microservice.onrender.com",
    LOG_LEVEL: process.env.LOG_LEVEL || fileConfig.LOG_LEVEL || "info",
};
function loadChannelIdFromConfig() {
    const configPath = path_1.default.join(process.cwd(), '.code-error-telex-agent', 'config.json');
    if (!fs_1.default.existsSync(configPath)) {
        console.warn('⚠️ Config file not found for Channel ID. Using empty string.');
        return '';
    }
    try {
        const fileContent = fs_1.default.readFileSync(configPath, 'utf8');
        const fileConfig = JSON.parse(fileContent);
        return fileConfig.channelId || '';
    }
    catch (err) {
        console.warn('⚠️ Could not load channel ID from config file:', err);
        return '';
    }
}
