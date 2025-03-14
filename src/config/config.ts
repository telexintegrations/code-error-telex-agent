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
    fileConfig = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
  } catch (error) {
    console.error("Error reading config file:", error);
  }
}

export const config: Config = {
  PORT: Number(process.env.PORT) || fileConfig.PORT || 3000,
  CHANNEL_ID: loadChannelIdFromConfig(),
  MICRO_SERVICE_URL:
    process.env.MICRO_SERVICE_URL ||
    fileConfig.MICRO_SERVICE_URL ||
    "http://localhost:4000",
  LOG_LEVEL: process.env.LOG_LEVEL || fileConfig.LOG_LEVEL || "info",
};

function loadChannelIdFromConfig(): string {
  try {
    const configPath = path.join(process.cwd(), '.code-error-telex-agent', 'config.json');
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return fileConfig.channelId || '';
  } catch (err) {
    console.warn('Could not load channel ID from config file. Using empty string.');
    return '';
  }
}