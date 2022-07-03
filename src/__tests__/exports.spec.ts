import { afterAll, afterEach, describe, expect, test } from '@jest/globals';
import fastify from 'fastify';
import promClient from 'prom-client';
import fastifyPlugin from '../';

describe('exports', () => {
  test('fastify plugin exported', async () => {
    expect(fastifyPlugin).toBeDefined();
  });
});

describe('plugin', () => {
  afterEach(() => {
    promClient.register.clear();
  });

  describe('registers with default name', () => {
    const app = fastify();

    afterAll(async () => {
      return app.close();
    });

    test('exposes prom-client api', async () => {
      await expect(app.register(fastifyPlugin)).resolves.toBeDefined();
      await expect(app.ready()).resolves.toBeDefined();
      expect(app.metrics).toBeDefined();
      expect(app.metrics.client).toBeDefined();
    });
  });

  describe('registers with custom name', () => {
    const app = fastify();

    afterAll(async () => {
      return app.close();
    });

    test('exposes prom-client api', async () => {
      await expect(
        app.register(fastifyPlugin, {
          name: 'foo',
        })
      ).resolves.toBeDefined();
      await expect(app.ready()).resolves.toBeDefined();
      expect(app.metrics).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(app['foo']).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(app['foo'].client).toBeDefined();
    });
  });
});
