export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '9000', 10),
    globalPrefix: process.env.GLOBAL_PREFIX ?? 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },
});
