import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import fastify, { RouteOptions } from 'fastify';
import promClient from 'prom-client';
import fastifyPlugin from '../';

describe('endpoint as object', () => {
  const app = fastify();
  let preHandlerCalled = false;
  beforeAll(async () => {
    await app.register(fastifyPlugin, {
      endpoint: {
        url: '/custom-endpoint',
        method: 'POST',
        preHandler: (_, __, done) => {
          preHandlerCalled = true;
          done();
        },
      } as RouteOptions,
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
    promClient.register.clear();
    await app.close();
  });

  test('should not override method', async () => {
    const metrics = await app.inject({
      method: 'POST',
      url: '/custom-endpoint',
    });
    expect(metrics.statusCode).toEqual(404);
  });

  test('endpoint should have custom RouteOptions', async () => {
    const metrics = await app.inject({
      method: 'GET',
      url: '/custom-endpoint',
    });
    expect(preHandlerCalled).toBe(true);
    expect(metrics.statusCode).toBe(200);
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
