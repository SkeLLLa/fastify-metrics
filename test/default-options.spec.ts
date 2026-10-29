import type promClient from '@prometheus-io/client';
import { fastify } from 'fastify';
import assert from 'node:assert/strict';
import { afterEach, before, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import type { IMetricsPluginRegisterOptions } from '../src/types';
import { clientPromise, withClient } from './helper';

let client: typeof promClient;

void describe('explicit undefined options', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void it('{ endpoint: undefined } serves /metrics', async () => {
    const app = fastify();
    try {
      await app.register(
        fastifyPlugin,
        withClient({
          endpoint: undefined,
        } as unknown as Partial<IMetricsPluginRegisterOptions>),
      );
      await app.ready();

      const res = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(res.statusCode, 200);
    } finally {
      await app.close();
    }
  });

  void it('{ routeMetrics: undefined, defaultMetrics: undefined } boots', async () => {
    const app = fastify();
    try {
      await app.register(
        fastifyPlugin,
        withClient({
          routeMetrics: undefined,
          defaultMetrics: undefined,
        } as unknown as Partial<IMetricsPluginRegisterOptions>),
      );
      app.get('/test', async () => 'ok');
      await app.ready();

      await app.inject({ method: 'GET', url: '/test' });
      const res = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(res.statusCode, 200);
      const lines = res.payload.split('\n');
      assert.ok(
        lines.some(
          (l) =>
            l.startsWith('http_request_duration_seconds_count{') &&
            l.includes('method="GET"') &&
            l.includes('route="/test"') &&
            l.includes('status_code="200"') &&
            l.endsWith('} 1'),
        ),
      );
      assert.ok(
        lines.some((l) => l.startsWith('process_cpu_user_seconds_total')),
      );
    } finally {
      await app.close();
    }
  });
});
