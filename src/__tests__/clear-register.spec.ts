import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from '@jest/globals';
import fastify from 'fastify';
import promClient from 'prom-client';
import fastifyPlugin from '../';

describe('default metrics', () => {
  afterEach(() => {
    promClient.register.clear();
  });

  describe('{ clearRegisterOnInit = false }', () => {
    const app = fastify();
    beforeAll(async () => {
      const c = new promClient.Counter({
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

    afterAll(async () => {
      await app.close();
    });

    test('register is not cleared', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n');
      expect(lines).toEqual(
        expect.arrayContaining([
          expect.stringContaining('# HELP test_counter Example of a counter'),
          expect.stringContaining('# TYPE test_counter counter'),
          expect.stringContaining('test_counter 100'),
        ])
      );
    });
  });

  describe('{ clearRegisterOnInit = true }', () => {
    const app = fastify();
    beforeAll(async () => {
      const c = new promClient.Counter({
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

    afterAll(async () => {
      await app.close();
    });

    test('register is cleared', async () => {
      const metrics = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(typeof metrics.payload).toBe('string');

      const lines = metrics.payload.split('\n').filter((line) => line !== '');
      expect(lines.length).toEqual(0);
    });
  });
});
