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
import fastifyPlugin from '../';

describe('basic auth', () => {
  afterEach(() => {
    promClient.register.clear();
  });

  describe('disabled', () => {
    const app = fastify();

    beforeAll(async () => {
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterAll(async () => {
      await app.close();
    });

    test('expose metrics', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/process_cpu_user_seconds_total \d+/),
          expect.stringMatching(/process_cpu_system_seconds_total \d+/),
          expect.stringMatching(/process_start_time_seconds \d+/),
        ])
      );
    });
  });

  describe('enabled', () => {
    const app = fastify();

    beforeAll(async () => {
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
        routeMetrics: {
          enabled: false,
        },
        basicAuth: {
          username: 'foo',
          password: 'bar',
        },
      });
      await app.ready();
    });

    afterAll(async () => {
      await app.close();
    });

    test('expose metrics', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
        headers: {
          Authorization: `Basic ${Buffer.from('foo:bar').toString('base64')}`,
        },
      });

      expect(metrics.statusCode).toEqual(200);
      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/process_cpu_user_seconds_total \d+/),
          expect.stringMatching(/process_cpu_system_seconds_total \d+/),
          expect.stringMatching(/process_start_time_seconds \d+/),
        ])
      );
    });

    test('not expose metrics with bad credentials', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
        headers: {
          Authorization: `Basic ${Buffer.from('john:doe').toString('base64')}`,
        },
      });

      expect(metrics.statusCode).toEqual(401);
      expect(metrics.headers['content-type']).toMatch(/^application\/json/);
      expect(JSON.parse(metrics.payload).message).toEqual(
        'Bad credentials provided.'
      );
    });
  });
});
