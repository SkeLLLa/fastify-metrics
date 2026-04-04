import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it } from 'node:test';
import { fastify } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../src/index';
import { clientPromise } from './helper';

let client: typeof promClient;

void describe('exports', () => {
  void it('fastify plugin exported', async () => {
    assert.notStrictEqual(fastifyPlugin, undefined);
  });
});

void describe('plugin', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void describe('registers with default name', () => {
    const app = fastify();

    after(async () => {
      await app.close();
    });

    void it('exposes prom-client api', async () => {
      await app.register(fastifyPlugin);
      await app.ready();
      assert.notStrictEqual(app.metrics, undefined);
      assert.notStrictEqual(app.metrics.client, undefined);
    });
  });

  void describe('registers with custom name', () => {
    const app = fastify();

    after(async () => {
      await app.close();
    });

    void it('exposes prom-client api', async () => {
      await app.register(fastifyPlugin, {
        name: 'foo',
      });
      await app.ready();
      assert.strictEqual(app.metrics, undefined);
      // @ts-expect-error accessing dynamic property
      assert.notStrictEqual(app.foo, undefined);
      // @ts-expect-error accessing dynamic property
      assert.notStrictEqual(app.foo.client, undefined);
    });
  });

  void describe('default options end-to-end', () => {
    let app = fastify();

    afterEach(async () => {
      client.register.clear();
      await app.close();
    });

    void it('collects default and route metrics with no options', async () => {
      app = fastify();
      await app.register(fastifyPlugin);
      app.get('/test', async () => 'get test');
      await app.ready();

      await app.inject({ method: 'GET', url: '/test' });

      const metrics = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assert.ok(
        lines.some((l) => l.includes('process_cpu_user_seconds_total')),
        'Should contain default process metrics',
      );
      assert.ok(
        lines.some((l) =>
          l.includes(
            'http_request_duration_seconds_count{method="GET",route="/test",status_code="200"}',
          ),
        ),
        'Should contain route histogram metrics',
      );
      assert.ok(
        lines.some((l) =>
          l.includes(
            'http_request_summary_seconds_count{method="GET",route="/test",status_code="200"}',
          ),
        ),
        'Should contain route summary metrics',
      );
    });
  });
});
