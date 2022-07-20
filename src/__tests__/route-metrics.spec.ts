import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import fastify from 'fastify';
import promClient from 'prom-client';
import fastifyPlugin from '../';

describe('route metrics', () => {
  afterEach(() => {
    promClient.register.clear();
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

    test('metrics exposed for known routes', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'POST',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
        ])
      );
    });

    test('metrics not exposed for unknown routes', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/unknown',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/unknown",status_code="404"} 1',
          'http_request_summary_seconds_count{method="GET",route="/unknown",status_code="404"} 1',
        ])
      );
    });

    test('metrics not exposed for routes with disabledMetrics in config', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/hidden',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/hidden",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/hidden",status_code="200"} 1',
        ])
      );
    });

    test('metrics exposed with custom route name in config', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/custom',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="__custom__",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="__custom__",status_code="200"} 1',
        ])
      );
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

    test('metrics not exposed', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'POST',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
        ])
      );
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

    test('metrics exposed for unknown routes', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/unknown',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'POST',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="__unknown__",status_code="404"} 1',
          'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="__unknown__",status_code="404"} 1',
          'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
        ])
      );
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

    test('metrics exposed for unknwon routes with custom name', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/unknown',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'POST',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="foo",status_code="404"} 1',
          'http_request_duration_seconds_count{method="POST",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="foo",status_code="404"} 1',
          'http_request_summary_seconds_count{method="POST",route="/test",status_code="200"} 1',
        ])
      );
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

    test('metrics for routes in blacklist not exposed', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'GET',
          url: '/test-1',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        ])
      );
      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test-1",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test-1",status_code="200"} 1',
        ])
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

    test('metrics for methods in blacklist not exposed', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      await expect(
        app.inject({
          method: 'HEAD',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        ])
      );
      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
        ])
      );
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
        { schema: { querystring: { r: { type: 'string' } } } },
        async (request, reply) => {
          await reply
            .code(parseInt((request.query as { r: string }).r))
            .send('foo');
        }
      );
      await app.ready();
    });

    test('metrics has grouped codes', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
          query: { r: '200' },
        })
      ).resolves.toBeDefined();
      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
          query: { r: '201' },
        })
      ).resolves.toBeDefined();

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="2xx"} 2',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="2xx"} 2',
        ])
      );
      expect(lines).toEqual(
        expect.not.arrayContaining([
          'http_request_duration_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
          'http_request_summary_seconds_count{method="HEAD",route="/test",status_code="200"} 1',
        ])
      );
    });
  });
});
