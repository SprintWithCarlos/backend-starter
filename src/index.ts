/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */

import {
  createLogger, format, transports,
} from "winston";

const {
  json, combine, timestamp, printf, label, colorize
} = format;
export interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
}
export class LoggerBuilder {
  private LoggerProd = () => {
    const logger = createLogger({
      level: "info",
      format: json(),
      defaultMeta: { service: "user-service" },
      transports: [
        new transports.File({ filename: "./error.log", level: "error" }),

      ],
    });
    return logger;
  };

  private LoggerDev = () => {
    const myFormat = printf(({
      level, message, label, timestamp
    }) => `${timestamp} [${label}] ${level}: ${message}`);

    const logger = createLogger({
      level: "debug",
      format: combine(
        label({ label: "user-service" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        myFormat
      ),
      defaultMeta: { service: "user-service" },
      transports: [
        new transports.Console(),
      ],
    });
    return logger;
  };

  build = (environmentLevel: string) => (environmentLevel === "production" ? this.LoggerProd() : this.LoggerDev());
}
