const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json"
    }
  }
};

module.exports = config;
