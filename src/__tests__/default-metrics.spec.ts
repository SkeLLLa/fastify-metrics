import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from '@jest/globals';
import fastify from 'fastify';
import promClient, { Registry } from 'prom-client';
import fastifyPlugin from '../';

describe('default metrics', () => {
  afterEach(() => {
    promClient.register.clear();
  });

  describe('{ }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();
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

  describe('{ enabled = true; register = new Registry() }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: true,
          register: new Registry(),
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    test('metrics exposed', async () => {
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

  describe('{ enabled = true; endoint = null }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: null,
        defaultMetrics: {
          enabled: true,
        },
        routeMetrics: {
          enabled: true,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    test('metrics not exposed via route', async () => {
      await expect(
        app.inject({
          method: 'GET',
          url: '/metrics',
        })
      ).resolves.toMatchObject({
        body: JSON.stringify({
          message: 'Route GET:/metrics not found',
          error: 'Not Found',
          statusCode: 404,
        }),
      });

      const data = await app.metrics.client.register.metrics();

      const lines = data.split('\n');

      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/process_cpu_user_seconds_total \d+/),
          expect.stringMatching(/process_cpu_system_seconds_total \d+/),
          expect.stringMatching(/process_start_time_seconds \d+/),
        ])
      );
    });
  });

  describe('{ enabled = false }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: false,
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    test('metrics not exposed', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');

      expect(lines).not.toEqual(
        expect.arrayContaining([
          expect.stringMatching(/process_cpu_user_seconds_total \d+/),
          expect.stringMatching(/process_cpu_system_seconds_total \d+/),
          expect.stringMatching(/process_start_time_seconds \d+/),
        ])
      );
    });
  });
});
