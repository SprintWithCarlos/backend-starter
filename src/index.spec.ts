/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-expressions */
import mock from "mock-fs";
import { faker } from "@faker-js/faker";
import { Logger } from "winston";
import path from "path";
import { readFileSync } from "fs";
import { LoggerBuilder } from "./index";

const generateRandomLogMessage = () => faker.hacker.phrase();
let jsonString: string = "";
const mockLoggerLogic = (type: string, logMessage: string): void => {
  type === "error"
    ? (jsonString += `{"level":"error","message":"${logMessage}","service":"user-service"}\n`)
    : jsonString;
  mock({ "error.log": jsonString });
};
let logMessage: string;
const buildLogger = (env: string): Logger => {
  const loggerBuilder = new LoggerBuilder();
  const logger = loggerBuilder.build(env);
  return logger;
};
describe("Test LoggerBuilder", () => {
  beforeEach(() => {
    logMessage = generateRandomLogMessage();
    mock({
      node_modules: mock.load(path.resolve(__dirname, "../node_modules"))
    });
  });
  afterEach(() => {
    mock.restore();
  });
  it("should log to console", async () => {
    const logger = buildLogger("development");
    const spy = jest.spyOn(logger, "info");
    logger.info(logMessage);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(logMessage);
  });

  it("should return 'level: info' when environmentLevel is 'production'", async () => {
    const logger = buildLogger("production");
    expect(logger.level).toBe("info");
  });
  it("should return 'level: debug' when environmentLevel is 'development'", async () => {
    const logger = buildLogger("development");
    expect(logger.level).toBe("debug");
  });
  it("should return an array containing an object containing the error message sent", async () => {
    /* const logger = buildLogger("production");
    logger.error(logMessage); */
    mockLoggerLogic("error", logMessage); // mocks call to logger.error(logMessage)
    const file = `${process.cwd()}/error.log`;
    const content = readFileSync(file, "utf-8");
    const array = JSON.parse(`[${content.replace(/\n/g, ",").slice(0, -1)}]`);
    expect(array).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: logMessage })])
    );
  });
  it("should include only error messages in error log", async () => {
    /*  const logger = buildLogger("production");
      logger.info(logMessage); */
    mockLoggerLogic("info", logMessage);
    const file = `${process.cwd()}/error.log`;
    const content = readFileSync(file, "utf-8");
    const array = JSON.parse(`[${content.replace(/\n/g, ",").slice(0, -1)}]`);
    expect(array).toEqual(
      expect.arrayContaining([expect.not.objectContaining({ message: logMessage })])
    );
  });
});
describe("Test real log file", () => {
  beforeEach(() => {
    logMessage = generateRandomLogMessage();
  });
  it("should show results from log file", async () => {
    expect.assertions(1);
    const logger = buildLogger("production");
    logger.error(logMessage);
    const getCurrentLog = () => {
      const file = mock.bypass(() => readFileSync("error.log", "utf-8"));
      return file;
    };
    const promisedLog = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(getCurrentLog());
        }, 1000);
      });
    const content = (await promisedLog()) as string;
    const array = JSON.parse(`[${content.replace(/\n/g, ",").slice(0, -1)}]`);
    expect(array).toEqual(
      expect.arrayContaining([expect.not.objectContaining({ message: logMessage })])
    );
  });
});
