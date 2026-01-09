module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: false,
  silent: true,
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};
