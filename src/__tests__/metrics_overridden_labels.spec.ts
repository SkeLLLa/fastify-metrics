import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import fastifyPlugin = require('../index');
import fastify from 'fastify';

const app = fastify();

// Add a couple of routes to test
app.get('/test', async () => {
  return 'get test';
});

const METHOD_LABEL = 'http_method';
const ROUTE_LABEL = 'path';
const STATUS_LABEL = 'status_class';

beforeAll(async () => {
  await app.register(fastifyPlugin, {
    endpoint: '/metrics',
    labelOverrides: {
      method: METHOD_LABEL,
      route: ROUTE_LABEL,
      status: STATUS_LABEL,
    },
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

  test('should allow for labels to be overridden', async () => {
    await app.inject({
      method: 'GET',
      url: '/test',
    });

    const metrics = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(metrics.payload).toContain(
      '# HELP http_request_duration_seconds request duration in seconds'
    );
    expect(metrics.payload).toContain(
      '# TYPE http_request_duration_seconds histogram'
    );
    expect(metrics.payload).toContain(
      `http_request_duration_seconds_bucket{le="0.05",${METHOD_LABEL}="GET",${ROUTE_LABEL}="/test",${STATUS_LABEL}="200"}`
    );
    expect(metrics.payload).toContain(
      `http_request_duration_seconds_sum{${METHOD_LABEL}="GET",${ROUTE_LABEL}="/test",${STATUS_LABEL}="200"}`
    );
    expect(metrics.payload).toContain(
      `http_request_duration_seconds_count{${METHOD_LABEL}="GET",${ROUTE_LABEL}="/test",${STATUS_LABEL}="200"}`
    );
    expect(metrics.payload).toContain(
      '# HELP http_request_summary_seconds request duration in seconds summary'
    );
    expect(metrics.payload).toContain(
      '# TYPE http_request_summary_seconds summary'
    );
    expect(metrics.payload).toContain(
      `http_request_summary_seconds{quantile="0.5",${METHOD_LABEL}="GET",${ROUTE_LABEL}="/test",${STATUS_LABEL}="200"`
    );
    expect(metrics.payload).toContain(
      `http_request_summary_seconds{quantile="0.5",${METHOD_LABEL}="GET",${ROUTE_LABEL}="/test",${STATUS_LABEL}="200"`
    );
  });
});
