module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.js$",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
