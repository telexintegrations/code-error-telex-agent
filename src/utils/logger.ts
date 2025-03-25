import winston from "winston";
import {  getConfig } from "../config/config";

const logger = winston.createLogger({
  level: getConfig().LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

export { logger };
