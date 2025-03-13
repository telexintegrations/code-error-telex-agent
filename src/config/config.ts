import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

export interface Config {
  PORT: number;
  MICRO_SERVICE_URL: string;
  LOG_LEVEL: string;
  // Add more configuration options as needed.
}

// Optionally, load additional configuration from a JSON file (if needed)
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
  MICRO_SERVICE_URL:
    process.env.MICRO_SERVICE_URL ||
    fileConfig.MICRO_SERVICE_URL ||
    "http://localhost:4000",
  LOG_LEVEL: process.env.LOG_LEVEL || fileConfig.LOG_LEVEL || "info",
};
