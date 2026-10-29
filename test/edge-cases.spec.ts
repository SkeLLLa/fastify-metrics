import type promClient from '@prometheus-io/client';
import { fastify } from 'fastify';
import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import { clientPromise, withClient } from './helper';

let client: typeof promClient;

const hasCountOne = (payload: string, metric: string): boolean =>
  payload.split('\n').some((line) => {
    if (!line.startsWith(`${metric}_count{`)) return false;
    return (
      line.includes('method="GET"') &&
      line.includes('route="/test"') &&
      line.includes('status_code="200"') &&
      line.endsWith('} 1')
    );
  });

void describe('edge cases', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void describe('registry clear problem', () => {
    const app = fastify();

    after(async () => {
      await app.close();
    });

    before(async () => {
      await app.register(
        fastifyPlugin,
        withClient({
          endpoint: '/metrics',
        }),
      );
      app.get('/test', async () => {
        return 'get test';
      });
      await app.ready();
    });

    void it('metrics are initialized after register clear call', async () => {
      const testResult = await app.inject({
        method: 'GET',
        url: '/test',
      });
      assert.notStrictEqual(testResult, undefined);

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assert.ok(
        lines.includes(
          'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"} 1',
        ),
      );
      assert.ok(
        lines.includes(
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"} 1',
        ),
      );

      app.metrics.client.register.clear();

      const testResult2 = await app.inject({
        method: 'GET',
        url: '/test',
      });
      assert.notStrictEqual(testResult2, undefined);

      const metricsAfterClear = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metricsAfterClear.payload, 'string');

      const linesAfterClear = metricsAfterClear.payload
        .split('\n')
        .filter((line) => line !== '');
      assert.strictEqual(linesAfterClear.length, 0);

      // Reinit metrics in registry
      app.metrics.initMetricsInRegistry();

      const testResult3 = await app.inject({
        method: 'GET',
        url: '/test',
      });
      assert.notStrictEqual(testResult3, undefined);

      const metricsAfterReinit = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metricsAfterReinit.payload, 'string');
    });
  });

  void describe('re-init after registry clear', () => {
    const scenarios: Array<{
      title: string;
      routeMetrics?: Record<string, unknown>;
      hist: boolean;
      sum: boolean;
    }> = [
      { title: 'default config', hist: true, sum: true },
      {
        title: 'enabled flags omitted',
        routeMetrics: { enabled: {} },
        hist: true,
        sum: true,
      },
      {
        title: 'histogram only',
        routeMetrics: { enabled: { histogram: true, summary: false } },
        hist: true,
        sum: false,
      },
      {
        title: 'summary only',
        routeMetrics: { enabled: { histogram: false, summary: true } },
        hist: false,
        sum: true,
      },
      {
        title: 'both disabled',
        routeMetrics: { enabled: { histogram: false, summary: false } },
        hist: false,
        sum: false,
      },
    ];

    for (const timing of ['timers', 'elapsedTime'] as const)
      for (const scenario of scenarios) {
        void it(`records new requests to re-registered metrics (${scenario.title}, timing: ${timing})`, async () => {
          const app = fastify();
          try {
            await app.register(
              fastifyPlugin,
              withClient({
                endpoint: '/metrics',
                routeMetrics: { ...scenario.routeMetrics, timing },
              }),
            );
            app.get('/test', async () => 'get test');
            await app.ready();

            await app.inject({ method: 'GET', url: '/test' });

            app.metrics.client.register.clear();
            app.metrics.initMetricsInRegistry();

            const res = await app.inject({ method: 'GET', url: '/test' });
            assert.strictEqual(res.statusCode, 200);

            const metrics = await app.inject({
              method: 'GET',
              url: '/metrics',
            });
            assert.strictEqual(metrics.statusCode, 200);

            assert.strictEqual(
              hasCountOne(metrics.payload, 'http_request_duration_seconds'),
              scenario.hist,
            );
            assert.strictEqual(
              hasCountOne(metrics.payload, 'http_request_summary_seconds'),
              scenario.sum,
            );
          } finally {
            await app.close();
          }
        });
      }
  });

  void describe('default labels', () => {
    const app = fastify();

    after(async () => {
      await app.close();
    });

    before(async () => {
      await app.register(
        fastifyPlugin,
        withClient({
          endpoint: '/metrics',
        }),
      );
      app.metrics.client.register.setDefaultLabels({ foo: 'bar' });
      app.get('/test', async () => {
        return 'get test';
      });
      await app.ready();
    });

    void it('added labels present in metrics', async () => {
      const testResult = await app.inject({
        method: 'GET',
        url: '/test',
      });
      assert.notStrictEqual(testResult, undefined);

      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assert.ok(
        lines.some((l) =>
          /process_cpu_user_seconds_total\{foo="bar"\} \d+/.test(l),
        ),
      );
      assert.ok(
        lines.includes(
          'http_request_duration_seconds_count{foo="bar",method="GET",route="/test",status_code="200"} 1',
        ),
      );
      assert.ok(
        lines.includes(
          'http_request_summary_seconds_count{method="GET",route="/test",status_code="200",foo="bar"} 1',
        ),
      );
    });
  });
});
