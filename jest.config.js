module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': [
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
  // Only ESM-only transitive deps of the sanitizer are transformed (ADR-015).
  // Small pure-JS packages — negligible cost versus the former jsdom chain.
  transformIgnorePatterns: [
    '/node_modules/\\.pnpm/(?!(htmlparser2@|entities@|domhandler@|domelementtype@|domutils@|dom-serializer@|css-select@|css-what@))',
    '/node_modules/(?!\\.pnpm|htmlparser2|entities|domhandler|domelementtype|domutils|dom-serializer|css-select|css-what)',
  ],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
