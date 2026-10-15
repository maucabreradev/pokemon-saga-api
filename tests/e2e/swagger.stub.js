// Test-only stub for `@nestjs/swagger` under Jest's CommonJS runtime.
// The real package ships ESM files using `import.meta`, which Jest cannot
// parse, and has no CJS build. e2e tests boot AppModule directly and never
// call `SwaggerModule.setup()`, so only the inert metadata decorators are
// needed here. Any current or future named import resolves to a no-op
// decorator factory, keeping HTTP-behavior assertions faithful.
function noopDecoratorFactory() {
  return (target, propertyKey, descriptor) => descriptor ?? target;
}

module.exports = new Proxy(
  { __esModule: true },
  {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return {};
      if (prop === 'then') return undefined;
      if (typeof prop === 'symbol') return undefined;
      return noopDecoratorFactory;
    },
  },
);
