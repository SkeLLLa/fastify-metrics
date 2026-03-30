import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fastify, type FastifyRequest } from 'fastify';
import { register } from 'prom-client';
import fastifyPlugin from '../';

/** Helper: assert lines contain all expected exact strings */
function assertLinesContain(lines: string[], expected: string[]): void {
  for (const e of expected) {
    assert.ok(lines.includes(e), `Expected lines to contain: ${e}`);
  }
}

/** Helper: assert lines do NOT contain any of the given exact strings */
function assertLinesNotContain(lines: string[], unexpected: string[]): void {
  for (const u of unexpected) {
    assert.ok(!lines.includes(u), `Expected lines NOT to contain: ${u}`);
  }
}

describe('route metrics', () => {
  afterEach(() => {
    register.clear();
  });

  describe('{ }', () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.get('/hidden', { config: { disableMetrics: true } }, async () => {
        return 'get test';
      });
      app.get('/custom', { config: { statsId: '__custom__' } }, async () => {
        return 'get test';
      });
      app.post('/test', async () => {
        return 'post test';
      });
      await app.ready();
    });

    it('metrics exposed for known routes', async () => {
      await app.inject({ method: 'GET', url: '/test' });
      await app.inject({ method: 'POST', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
      ]);
    });

    it('metrics not exposed for unknown routes', async () => {
      await app.inject({ method: 'GET', url: '/unknown' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/unknown",status_code="404"} 1',
        'http_request_summary_seconds_count{method="GET",route="/unknown",status_code="404"} 1',
      ]);
    });

    it('metrics not exposed for routes with disabledMetrics in config', async () => {
      await app.inject({ method: 'GET', url: '/hidden' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/hidden",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/hidden",status_code="200"} 1',
      ]);
    });

    it('metrics exposed with custom route name in config', async () => {
      await app.inject({ method: 'GET', url: '/custom' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="__custom__",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="__custom__",status_code="200"} 1',
      ]);
    });
  });

  describe('{ enabled = false }', () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: false,
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.post('/test', async () => {
        return 'post test';
      });
      await app.ready();
    });

    it('metrics not exposed', async () => {
      await app.inject({ method: 'GET', url: '/test' });
      await app.inject({ method: 'POST', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe('{ enabled = {} }', () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: {},
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.post('/test', async () => {
        return 'post test';
      });
      await app.ready();
    });

    it('metrics exposed', async () => {
      await app.inject({ method: 'GET', url: '/test' });
      await app.inject({ method: 'POST', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe('{ registeredRoutesOnly = false }', () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          registeredRoutesOnly: false,
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.post('/test', async () => {
        return 'post test';
      });
      await app.ready();
    });

    it('metrics exposed for unknown routes', async () => {
      await app.inject({ method: 'GET', url: '/unknown' });
      await app.inject({ method: 'POST', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="__unknown__",status_code="404"} 1',
        'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="__unknown__",status_code="404"} 1',
        'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe(`{ registeredRoutesOnly = false, invalidRouteGroup = 'foo' }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          registeredRoutesOnly: false,
          invalidRouteGroup: 'foo',
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.post('/test', async () => {
        return 'post test';
      });
      await app.ready();
    });

    it('metrics exposed for unknwon routes with custom name', async () => {
      await app.inject({ method: 'GET', url: '/unknown' });
      await app.inject({ method: 'POST', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="foo",status_code="404"} 1',
        'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="foo",status_code="404"} 1',
        'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe(`{ routeBlacklist = ['/test'] }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          routeBlacklist: ['/test'],
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      app.get('/test-1', async () => {
        return 'get test';
      });
      await app.ready();
    });

    it('metrics for routes in blacklist not exposed', async () => {
      await app.inject({ method: 'GET', url: '/test' });
      await app.inject({ method: 'GET', url: '/test-1' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
      ]);
      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test-1",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test-1",status_code="200"} 1',
      ]);
    });
  });

  describe(`{ routeBlacklist = [/^\\/api\\/documentation(\\/|$)/] }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          routeBlacklist: [/^\/api\/documentation(\/|$)/],
        },
      });
      app.get('/api/documentation', async () => {
        return 'Base documentation';
      });
      app.get('/api/documentation/json', async () => {
        return 'JSON documentation';
      });
      app.get('/api/documentation/yaml', async () => {
        return 'YAML documentation';
      });
      app.get('/api/other', async () => {
        return 'Other API endpoint';
      });
      await app.ready();
    });

    it('metrics for regex matched routes in blacklist not exposed', async () => {
      await app.inject({ method: 'GET', url: '/api/documentation' });
      await app.inject({ method: 'GET', url: '/api/documentation/json' });
      await app.inject({ method: 'GET', url: '/api/documentation/yaml' });
      await app.inject({ method: 'GET', url: '/api/other' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      // No lines should contain documentation routes
      assert.ok(
        !lines.some((l) => l.includes('route="/api/documentation"')),
        'Should not contain /api/documentation',
      );
      assert.ok(
        !lines.some((l) => l.includes('route="/api/documentation/json"')),
        'Should not contain /api/documentation/json',
      );
      assert.ok(
        !lines.some((l) => l.includes('route="/api/documentation/yaml"')),
        'Should not contain /api/documentation/yaml',
      );
      // Should contain /api/other
      assert.ok(
        lines.some((l) => l.includes('route="/api/other"')),
        'Should contain /api/other',
      );
    });
  });

  describe(`{ methodBlacklist = ['GET'] }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          methodBlacklist: ['GET'],
        },
      });
      app.get('/test', async () => {
        return 'get test';
      });
      await app.ready();
    });

    it('metrics for methods in blacklist not exposed', async () => {
      await app.inject({ method: 'GET', url: '/test' });
      await app.inject({ method: 'HEAD', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
      ]);
      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe(`{ groupStatusCodes = true }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          groupStatusCodes: true,
        },
      });
      app.get(
        '/test',
        {
          schema: {
            querystring: {
              type: 'object',
              properties: {
                r: { type: 'string' },
              },
            },
          },
        },
        async (request, reply) => {
          await reply
            .code(parseInt((request.query as { r: string }).r))
            .send('foo');
        },
      );
      await app.ready();
    });

    it('metrics has grouped codes', async () => {
      await app.inject({ method: 'GET', url: '/test', query: { r: '200' } });
      await app.inject({ method: 'GET', url: '/test', query: { r: '201' } });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="2xx"} 2',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="2xx"} 2',
      ]);
      assertLinesNotContain(lines, [
        'http_request_duration_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe(`getRouteLabel is defined`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          overrides: {
            labels: {
              getRouteLabel: (request: FastifyRequest) => request.url,
            },
          },
        },
      });
      app.get('*', async (_request, reply) => {
        await reply.send('foo');
      });
      await app.ready();
    });

    it('metric has url as route instead of *', async () => {
      await app.inject({ method: 'GET', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
      ]);
    });
  });

  describe(`customMetrics is defined`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: true,
          customLabels: {
            foo: 'bar',
            url: (request: FastifyRequest) => request.url,
          },
        },
      });
      app.get('*', async (_request, reply) => {
        await reply.send('foo');
      });
      await app.ready();
    });

    it('metric has custom labels', async () => {
      await app.inject({ method: 'GET', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="*",status_code="200",foo="bar",url="/test"} 1',
        'http_request_summary_seconds_count{method="GET",route="*",status_code="200",foo="bar",url="/test"} 1',
      ]);
    });
  });

  describe(`{ routeMetrics: { enable: { summary: false } } }`, () => {
    let app = fastify();

    afterEach(async () => {
      await app.close();
    });

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        routeMetrics: {
          enabled: {
            summary: false,
          },
          customLabels: {
            url: (request: FastifyRequest) => request.url,
          },
        },
      });
      app.get('*', async (_request, reply) => {
        await reply.send('foo');
      });
      await app.ready();
    });

    it('summaries are not collected', async () => {
      await app.inject({ method: 'GET', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');
      const lines = metrics.payload.split('\n');

      assertLinesContain(lines, [
        'http_request_duration_seconds_count{method="GET",route="*",status_code="200",url="/test"} 1',
      ]);

      assertLinesNotContain(lines, [
        'http_request_summary_seconds_count{method="GET",route="*",status_code="200",url="/test"} 1',
      ]);
    });
  });
});
