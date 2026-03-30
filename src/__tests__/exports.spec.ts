import assert from 'node:assert/strict';
import { after, afterEach, describe, it } from 'node:test';
import { fastify } from 'fastify';
import { register } from 'prom-client';
import fastifyPlugin from '../';

void describe('exports', () => {
  void it('fastify plugin exported', async () => {
    assert.notStrictEqual(fastifyPlugin, undefined);
  });
});

void describe('plugin', () => {
  afterEach(() => {
    register.clear();
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
});
