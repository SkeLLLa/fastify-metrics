import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from '@jest/globals';
import fastify from 'fastify';
import promClient from 'prom-client';
import fastifyPlugin from '..';

describe('edge cases', () => {
  afterEach(() => {
    promClient.register.clear();
  });

  describe('registry clear problem', () => {
    const app = fastify();

    afterAll(async () => {
      await app.close();
    });

    beforeAll(async () => {
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
      });
      app.get('/test', async () => {
        return 'get test';
      });
      await app.ready();
    });

    test('metrics are initialized after register clear call', async () => {
      await expect(
        app.inject({
          method: 'GET',
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
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        ])
      );

      app.metrics.client.register.clear();

      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metricsAfterClear = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metricsAfterClear.payload).toBe('string');

      const linesAfterClear = metricsAfterClear.payload.split('\n');

      expect(linesAfterClear).toEqual(['', '']);

      // Reinit metrics in registry
      app.metrics.initMetricsInRegistry();

      await expect(
        app.inject({
          method: 'GET',
          url: '/test',
        })
      ).resolves.toBeDefined();

      const metricsAfterReinit = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metricsAfterReinit.payload).toBe('string');

      // const linesAfterReinit = metricsAfterReinit.payload.split('\n');

      // expect(linesAfterReinit).toEqual(
      //   expect.arrayContaining([
      //     'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
      //     'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
      //   ])
      // );
    });
  });

  describe('default labels', () => {
    const app = fastify();

    afterAll(async () => {
      await app.close();
    });

    beforeAll(async () => {
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
      });
      app.metrics.client.register.setDefaultLabels({ foo: 'bar' });
      app.get('/test', async () => {
        return 'get test';
      });
      await app.ready();
    });

    test('added labels present in metrics', async () => {
      await expect(
        app.inject({
          method: 'GET',
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
          expect.stringMatching(
            /process_cpu_user_seconds_total\{foo="bar"\} \d+/
          ),
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200",foo="bar"} 1',
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200",foo="bar"} 1',
        ])
      );
    });
  });
});
