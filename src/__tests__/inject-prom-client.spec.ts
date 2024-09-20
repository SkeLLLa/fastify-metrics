import { afterEach, describe, expect, test } from '@jest/globals';
import { fastify } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../';

describe('metrics plugin', () => {
  let app = fastify();

  afterEach(async () => {
    await app.close();
  });

  test('uses provided prom-client instance', async () => {
    const testPromClient = {} as unknown as typeof promClient;

    app = fastify();
    await app.register(fastifyPlugin, {
      promClient: testPromClient,
      endpoint: '/metrics',
      defaultMetrics: { enabled: false },
      routeMetrics: { enabled: false },
    });
    await app.ready();

    expect(app.metrics.client).toEqual(testPromClient);
  });
});
