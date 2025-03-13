"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables from .env file
dotenv_1.default.config();
// Optionally, load additional configuration from a JSON file (if needed)
const configFilePath = path_1.default.resolve(__dirname, "../../config.json");
let fileConfig = {};
if (fs_1.default.existsSync(configFilePath)) {
    try {
        fileConfig = JSON.parse(fs_1.default.readFileSync(configFilePath, "utf-8"));
    }
    catch (error) {
        console.error("Error reading config file:", error);
    }
}
exports.config = {
    PORT: Number(process.env.PORT) || fileConfig.PORT || 3000,
    MICRO_SERVICE_URL: process.env.MICRO_SERVICE_URL ||
        fileConfig.MICRO_SERVICE_URL ||
        "http://localhost:4000",
    LOG_LEVEL: process.env.LOG_LEVEL || fileConfig.LOG_LEVEL || "info",
};
