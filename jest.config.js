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
  // Only ESM-only transitive deps are transformed (ADR-014). Everything else
  // in node_modules keeps the default ignore for speed and memory.
  // The first pattern covers pnpm's .pnpm layout, the second plain layouts.
  transformIgnorePatterns: [
    '/node_modules/\\.pnpm/(?!(parse5@|html-encoding-sniffer@|jsdom@|isomorphic-dompurify@|entities@|cssstyle@|@csstools\\+|@exodus\\+|@asamuzakjp\\+|data-urls@|decimal\\.js@|whatwg-encoding@))',
    '/node_modules/(?!\\.pnpm|isomorphic-dompurify|jsdom|parse5|entities|cssstyle|html-encoding-sniffer|@csstools|@exodus|@asamuzakjp|data-urls|decimal\\.js|whatwg-encoding)',
  ],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
