import mock from 'mock-fs';
import { faker } from "@faker-js/faker";
import { Logger } from 'winston';
import path from 'path';
import { readFileSync } from 'fs';
import { LoggerBuilder } from "./index";

const generateRandomLogMessage = () => faker.hacker.phrase();
let logMessage: string;
const buildLogger = (
  env: string
):
Logger => {
  const loggerBuilder = new LoggerBuilder();
  const logger = loggerBuilder.build(env);
  return logger;
};
let jsonString: string = "";
describe("Test LoggerBuilder", () => {
  beforeEach(() => {
    logMessage = generateRandomLogMessage();
    jsonString += `{"level":"error","message":"${logMessage}","service":"user-service"}\n`;
    mock({
      node_modules: mock.load(path.resolve(__dirname, '../node_modules')),
    });
  });

  afterAll(() => {
    mock.restore();
  });
  it("should log to console", async () => {
    const logger = buildLogger("development");
    const spy = jest.spyOn(logger, 'info');
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
    const logger = buildLogger("production");
    logger.error(logMessage);
    mock({ "error.log": jsonString });
    const file = `${process.cwd()}/error.log`;
    const content = readFileSync(file, "utf-8");
    const array = JSON.parse(`[${content.replace(/\n/g, ",").slice(0, -1)}]`);
    expect(array).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: logMessage }),
      ])
    );
  });
  it("should include only error messages in error log", async () => {
    const logger = buildLogger("production");
    logger.info(logMessage);
    mock({ "error.log": jsonString, });
    const file = `${process.cwd()}/error.log`;
    const content = readFileSync(file, "utf-8");
    const array = JSON.parse(`[${content.replace(/\n/g, ",").slice(0, -1)}]`);
    expect(array).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: logMessage }),
      ])
    );
  });
});
