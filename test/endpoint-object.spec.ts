import type promClient from '@prometheus-io/client';
import { fastify, type RouteOptions } from 'fastify';
import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import { clientPromise, withClient } from './helper';

let client: typeof promClient;

void describe('endpoint as object', () => {
  const app = fastify();
  let preHandlerCalled = false;

  before(async () => {
    client = await clientPromise;
    await app.register(
      fastifyPlugin,
      withClient({
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
      }),
    );
    await app.ready();
  });

  after(async () => {
    client.register.clear();
    await app.close();
  });

  void it('should enforce GET method (POST is not served)', async () => {
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

const preHandler: RouteOptions['preHandler'] = (_, __, done) => done();

void describe('endpoint as object: input is not mutated', () => {
  let app = fastify();

  beforeEach(() => {
    app = fastify();
  });

  afterEach(async () => {
    client.register.clear();
    await app.close();
  });

  void it('does not modify the provided object', async () => {
    client = await clientPromise;
    const endpoint = {
      url: '/custom-endpoint',
      method: 'POST',
      preHandler,
    } as RouteOptions;
    const snapshot = { ...endpoint };

    await app.register(
      fastifyPlugin,
      withClient({
        endpoint,
        routeMetrics: { enabled: false },
      }),
    );
    await app.ready();

    assert.deepStrictEqual({ ...endpoint }, snapshot);
    assert.strictEqual(endpoint.method, 'POST');
    assert.strictEqual(endpoint.handler, undefined);
    const res = await app.inject({ method: 'GET', url: '/custom-endpoint' });
    assert.strictEqual(res.statusCode, 200);
  });

  void it('accepts a frozen object', async () => {
    client = await clientPromise;
    const endpoint = Object.freeze({
      url: '/frozen-endpoint',
      method: 'POST',
    }) as RouteOptions;

    await app.register(
      fastifyPlugin,
      withClient({
        endpoint,
        routeMetrics: { enabled: false },
      }),
    );
    await app.ready();

    assert.strictEqual(endpoint.method, 'POST');
    const res = await app.inject({ method: 'GET', url: '/frozen-endpoint' });
    assert.strictEqual(res.statusCode, 200);
  });
});
