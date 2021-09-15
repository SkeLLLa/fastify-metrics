import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from '@jest/globals';
import fastify from 'fastify';
import fastifyPlugin = require('../index');

const app = fastify();

// Add a couple of routes to test
app.get('/test', async () => {
  return 'get test';
});

beforeAll(async () => {
  await app.register(fastifyPlugin, {
    endpoint: '/metrics',
    enableRouteMetrics: true,
    ignoreHeadRequests: true,
  });
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('metrics plugin', () => {
  afterEach(async () => {
    // Reset metrics after each test
    app.metrics.client.register.resetMetrics();
  });

  test('should not register route metrics when enableRouteMetrics is false', async () => {
    await app.inject({
      method: 'HEAD',
      url: '/test',
    });

    await app.inject({
      method: 'head',
      url: '/test',
    });

    const metrics = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(metrics.payload).toContain('');
  });
});
