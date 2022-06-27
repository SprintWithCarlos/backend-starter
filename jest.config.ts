import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  // collectCoverage: true,
  testTimeout: 20000,
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 100,
      lines: 100,
    },
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
export default config;
