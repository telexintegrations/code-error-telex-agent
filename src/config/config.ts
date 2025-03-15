import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

export interface Config {
  PORT: number;
  MICRO_SERVICE_URL: string;
  CHANNEL_ID: string;
  LOG_LEVEL: string;
}

const configFilePath = path.resolve(__dirname, "../../config.json");
let fileConfig: Partial<Config> = {};

if (fs.existsSync(configFilePath)) {
  try {
    const fileContent = fs.readFileSync(configFilePath, "utf-8");
    fileConfig = JSON.parse(fileContent);
  } catch (error) {
    console.error("❌ Error reading config file:", error);
  }
}

export const config: Config = {
  PORT: Number(process.env.PORT) || fileConfig.PORT || 3000,
  CHANNEL_ID: loadChannelIdFromConfig() || process.env.CHANNEL_ID || "",
  MICRO_SERVICE_URL:
    process.env.MICRO_SERVICE_URL ||
    fileConfig.MICRO_SERVICE_URL ||
    "http://localhost:4000",
  LOG_LEVEL: process.env.LOG_LEVEL || fileConfig.LOG_LEVEL || "info",
};

function loadChannelIdFromConfig(): string {
  const configPath = path.join(process.cwd(), '.code-error-telex-agent', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.warn('⚠️ Config file not found for Channel ID. Using empty string.');
    return '';
  }

  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const fileConfig = JSON.parse(fileContent);
    return fileConfig.channelId || '';
  } catch (err) {
    console.warn('⚠️ Could not load channel ID from config file:', err);
    return '';
  }
}
