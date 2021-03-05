import fastifyPlugin = require('../index');
import fastify from 'fastify';

const app = fastify();

// Add a couple of routes to test
app.get('/test', async () => {
  return 'get test';
});
app.post('/test', async () => {
  return 'post test';
});

beforeAll(async () => {
  await app.register(fastifyPlugin, {
    endpoint: '/metrics',
    invalidRouteGroup: 'INVALID_GROUP',
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

  it('should register default metrics', async () => {
    await app.inject({
      method: 'GET',
      url: '/test',
    });

    await app.inject({
      method: 'POST',
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
      'http_request_duration_seconds_bucket{le="0.05",method="GET",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_sum{method="GET",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_bucket{le="0.05",method="POST",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_sum{method="POST",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"}'
    );
    expect(metrics.payload).toContain(
      '# HELP http_request_summary_seconds request duration in seconds summary'
    );
    expect(metrics.payload).toContain(
      '# TYPE http_request_summary_seconds summary'
    );
    expect(metrics.payload).toContain(
      'http_request_summary_seconds{quantile="0.5",method="GET",route="/test",status_code="200"'
    );
    expect(metrics.payload).toContain(
      'http_request_summary_seconds{quantile="0.5",method="GET",route="/test",status_code="200"'
    );
  });

  it('should group unrecognised routes', async () => {
    await app.inject({
      method: 'GET',
      url: '/not-exists',
    });
    await app.inject({
      method: 'GET',
      url: '/not-exists-2',
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
      'http_request_duration_seconds_bucket{le="0.05",method="GET",route="INVALID_GROUP",status_code="404"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_sum{method="GET",route="INVALID_GROUP",status_code="404"}'
    );
    expect(metrics.payload).toContain(
      'http_request_duration_seconds_count{method="GET",route="INVALID_GROUP",status_code="404"}'
    );
    expect(metrics.payload).toContain(
      '# HELP http_request_summary_seconds request duration in seconds summary'
    );
    expect(metrics.payload).toContain(
      '# TYPE http_request_summary_seconds summary'
    );
    expect(metrics.payload).toContain(
      'http_request_summary_seconds{quantile="0.5",method="GET",route="INVALID_GROUP",status_code="404"'
    );
    expect(metrics.payload).toContain(
      'http_request_summary_seconds{quantile="0.5",method="GET",route="INVALID_GROUP",status_code="404"'
    );
    expect(metrics.payload).toContain(
      'http_request_summary_seconds_count{method="GET",route="INVALID_GROUP",status_code="404"} 2'
    );
  });
});
