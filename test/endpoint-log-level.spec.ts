import type promClient from '@prometheus-io/client';
import { fastify, type RouteOptions } from 'fastify';
import assert from 'node:assert/strict';
import { afterEach, before, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import type { IMetricsPluginOptions } from '../src/types';
import { clientPromise, withClient } from './helper';

let client: typeof promClient;

/** Registers the plugin and returns the log level of the `/metrics` route. */
async function getEndpointLogLevel(
  options: Partial<IMetricsPluginOptions>,
  url = '/metrics',
): Promise<RouteOptions['logLevel']> {
  const app = fastify();
  let logLevel: RouteOptions['logLevel'];
  try {
    app.addHook('onRoute', (route) => {
      if (route.url === url) {
        logLevel = route.logLevel;
      }
    });
    await app.register(
      fastifyPlugin,
      withClient({
        routeMetrics: { enabled: false },
        ...options,
      }),
    );
    await app.ready();
    return logLevel;
  } finally {
    client.register.clear();
    await app.close();
  }
}

void describe('endpointLogLevel', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void it('defaults to fatal', async () => {
    assert.strictEqual(await getEndpointLogLevel({}), 'fatal');
  });

  void it('falls back to the default when undefined', async () => {
    assert.strictEqual(
      await getEndpointLogLevel({
        endpointLogLevel: undefined,
      } as unknown as Partial<IMetricsPluginOptions>),
      'fatal',
    );
  });

  void it('applies a custom level to the string endpoint', async () => {
    assert.strictEqual(
      await getEndpointLogLevel(
        {
          endpoint: '/custom',
          endpointLogLevel: 'error',
        },
        '/custom',
      ),
      'error',
    );
  });

  void it('does not affect the object endpoint', async () => {
    assert.notStrictEqual(
      await getEndpointLogLevel({
        endpoint: { url: '/metrics' } as RouteOptions,
        endpointLogLevel: 'error',
      }),
      'error',
    );
    assert.strictEqual(
      await getEndpointLogLevel({
        endpoint: { url: '/metrics', logLevel: 'warn' } as RouteOptions,
        endpointLogLevel: 'error',
      }),
      'warn',
    );
  });
});
