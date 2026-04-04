import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it } from 'node:test';
import { fastify } from 'fastify';
import type promClient from 'prom-client';
import fastifyPlugin from '../src/index';
import { clientPromise } from './helper';

let client: typeof promClient;

void describe('default metrics', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void describe('{ clearRegisterOnInit = false }', () => {
    const app = fastify();
    before(async () => {
      const c = new client.Counter({
        name: 'test_counter',
        help: 'Example of a counter',
        labelNames: ['code'],
      });
      c.inc(100);
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: false,
        },
        routeMetrics: {
          enabled: false,
        },
        clearRegisterOnInit: false,
      });
      await app.ready();
    });

    after(async () => {
      await app.close();
    });

    void it('register is not cleared', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');
      assert.ok(
        lines.some((l) =>
          l.includes('# HELP test_counter Example of a counter'),
        ),
      );
      assert.ok(lines.some((l) => l.includes('# TYPE test_counter counter')));
      assert.ok(lines.some((l) => l.includes('test_counter 100')));
    });
  });

  void describe('{ clearRegisterOnInit = true }', () => {
    const app = fastify();
    before(async () => {
      const c = new client.Counter({
        name: 'test_counter',
        help: 'Example of a counter',
        labelNames: ['code'],
      });
      c.inc(100);
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: false,
        },
        routeMetrics: {
          enabled: false,
        },
        clearRegisterOnInit: true,
      });
      await app.ready();
    });

    after(async () => {
      await app.close();
    });

    void it('register is cleared', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n').filter((line) => line !== '');
      assert.strictEqual(lines.length, 0);
    });
  });
});
