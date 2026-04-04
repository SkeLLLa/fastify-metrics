import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it } from 'node:test';
import { fastify } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../src/index';
import { clientPromise } from './helper';

let client: typeof promClient;

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
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
      });
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

  void describe('default labels', () => {
    const app = fastify();

    after(async () => {
      await app.close();
    });

    before(async () => {
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
      });
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
