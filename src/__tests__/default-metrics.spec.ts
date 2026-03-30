import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fastify } from 'fastify';
import { register, Registry } from 'prom-client';
import fastifyPlugin from '../';

/** Helper: assert that at least one line matches a regex */
function assertLineMatches(lines: string[], regex: RegExp): void {
  assert.ok(
    lines.some((l) => regex.test(l)),
    `Expected some line to match ${regex}`,
  );
}

/** Helper: assert that no line matches a regex */
function assertNoLineMatches(lines: string[], regex: RegExp): void {
  assert.ok(
    !lines.some((l) => regex.test(l)),
    `Expected no line to match ${regex}`,
  );
}

describe('default metrics', () => {
  afterEach(() => {
    register.clear();
  });

  describe('{ }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();
      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: true,
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    it('expose metrics', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assertLineMatches(lines, /process_cpu_user_seconds_total \d+/);
      assertLineMatches(lines, /process_cpu_system_seconds_total \d+/);
      assertLineMatches(lines, /process_start_time_seconds \d+/);
    });
  });

  describe('{ enabled = true; register = new Registry() }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: true,
          register: new Registry(),
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    it('metrics exposed', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assertLineMatches(lines, /process_cpu_user_seconds_total \d+/);
      assertLineMatches(lines, /process_cpu_system_seconds_total \d+/);
      assertLineMatches(lines, /process_start_time_seconds \d+/);
    });
  });

  describe('{ enabled = true; endoint = null }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: null,
        defaultMetrics: {
          enabled: true,
        },
        routeMetrics: {
          enabled: true,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    it('metrics not exposed via route', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.deepStrictEqual(JSON.parse(result.body), {
        message: 'Route GET:/metrics not found',
        error: 'Not Found',
        statusCode: 404,
      });

      const data = await app.metrics.client.register.metrics();

      const lines = data.split('\n');

      assertLineMatches(lines, /process_cpu_user_seconds_total \d+/);
      assertLineMatches(lines, /process_cpu_system_seconds_total \d+/);
      assertLineMatches(lines, /process_start_time_seconds \d+/);
    });
  });

  describe('{ enabled = false }', () => {
    let app = fastify();

    beforeEach(async () => {
      app = fastify();

      await app.register(fastifyPlugin, {
        endpoint: '/metrics',
        defaultMetrics: {
          enabled: false,
        },
        routeMetrics: {
          enabled: false,
        },
      });
      await app.ready();
    });

    afterEach(async () => {
      await app.close();
    });

    it('metrics not exposed', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      assert.strictEqual(typeof metrics.payload, 'string');

      const lines = metrics.payload.split('\n');

      assertNoLineMatches(lines, /process_cpu_user_seconds_total \d+/);
      assertNoLineMatches(lines, /process_cpu_system_seconds_total \d+/);
      assertNoLineMatches(lines, /process_start_time_seconds \d+/);
    });
  });
});
