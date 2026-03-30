import { after, afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fastify } from 'fastify';
import { register } from 'prom-client';
import fastifyPlugin from '../';

describe('exports', () => {
  it('fastify plugin exported', async () => {
    assert.notStrictEqual(fastifyPlugin, undefined);
  });
});

describe('plugin', () => {
  afterEach(() => {
    register.clear();
  });

  describe('registers with default name', () => {
    const app = fastify();

    after(async () => {
      return app.close();
    });

    it('exposes prom-client api', async () => {
      const registered = await app.register(fastifyPlugin);
      assert.notStrictEqual(registered, undefined);
      const ready = await app.ready();
      assert.notStrictEqual(ready, undefined);
      assert.notStrictEqual(app.metrics, undefined);
      assert.notStrictEqual(app.metrics.client, undefined);
    });
  });

  describe('registers with custom name', () => {
    const app = fastify();

    after(async () => {
      return app.close();
    });

    it('exposes prom-client api', async () => {
      const registered = await app.register(fastifyPlugin, {
        name: 'foo',
      });
      assert.notStrictEqual(registered, undefined);
      const ready = await app.ready();
      assert.notStrictEqual(ready, undefined);
      assert.strictEqual(app.metrics, undefined);
      // @ts-ignore
      assert.notStrictEqual(app['foo'], undefined);
      // @ts-ignore
      assert.notStrictEqual(app['foo'].client, undefined);
    });
  });
});
