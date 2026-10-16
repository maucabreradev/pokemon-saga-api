module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.m?js$': [
      'babel-jest',
      {
        configFile: false,
        babelrc: false,
        plugins: [
          '@babel/plugin-transform-modules-commonjs',
          '@babel/plugin-transform-export-namespace-from',
        ],
      },
    ],
  },
  // Mirrors tests/jest-e2e.json (ADR-009, extended by ADR-014): ESM-only
  // transitive deps (e.g. html-encoding-sniffer via jsdom for DOMPurify)
  // must be transformed to CJS in unit tests as well.
  transformIgnorePatterns: [],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
