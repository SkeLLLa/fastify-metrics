import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fastify } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../';

describe('metrics plugin', () => {
  let app = fastify();

  afterEach(async () => {
    await app.close();
  });

  it('uses provided prom-client instance', async () => {
    const testPromClient = {} as unknown as typeof promClient;

    app = fastify();
    await app.register(fastifyPlugin, {
      promClient: testPromClient,
      endpoint: '/metrics',
      defaultMetrics: { enabled: false },
      routeMetrics: { enabled: false },
    });
    await app.ready();

    assert.deepStrictEqual(app.metrics.client, testPromClient);
  });
});
