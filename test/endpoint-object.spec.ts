import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { fastify, type RouteOptions } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../src/index';
import { clientPromise } from './helper';

let client: typeof promClient;

void describe('endpoint as object', () => {
  const app = fastify();
  let preHandlerCalled = false;

  before(async () => {
    client = await clientPromise;
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

  after(async () => {
    client.register.clear();
    await app.close();
  });

  void it('should not override method', async () => {
    const metrics = await app.inject({
      method: 'POST',
      url: '/custom-endpoint',
    });
    assert.strictEqual(metrics.statusCode, 404);
  });

  void it('endpoint should have custom RouteOptions', async () => {
    const metrics = await app.inject({
      method: 'GET',
      url: '/custom-endpoint',
    });
    assert.strictEqual(preHandlerCalled, true);
    assert.strictEqual(metrics.statusCode, 200);
    assert.strictEqual(typeof metrics.payload, 'string');

    const lines = metrics.payload.split('\n');

    assert.ok(lines.some((l) => /process_cpu_user_seconds_total \d+/.test(l)));
    assert.ok(
      lines.some((l) => /process_cpu_system_seconds_total \d+/.test(l)),
    );
    assert.ok(lines.some((l) => /process_start_time_seconds \d+/.test(l)));
  });
});
