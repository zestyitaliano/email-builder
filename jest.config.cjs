const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json"
    }
  }
};

module.exports = config;
