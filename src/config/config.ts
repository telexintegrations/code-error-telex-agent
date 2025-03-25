import dotenv from "dotenv";

dotenv.config();

export interface Config {
  MICRO_SERVICE_URL: string;
  LOG_LEVEL: string;
  IS_DEV: boolean;
  CHANNEL_ID: string;
}

let configSetting: Config = {
  MICRO_SERVICE_URL:
    process.env.MICRO_SERVICE_URL ||
    "https://system-integration.staging.telex.im/code-error-integration/",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  IS_DEV: process.env.IS_DEV === "true" ? true : false,
  CHANNEL_ID: "",
};

// update config
export const updateConfig = (payload: Partial<Config>) => {
  configSetting = { ...configSetting, ...payload };
  console.log("configSetting", configSetting);
};

export function getConfig(): Config {
  return configSetting;
}
