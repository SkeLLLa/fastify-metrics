import type promClient from '@prometheus-io/client';
import { fastify, type FastifyInstance } from 'fastify';
import assert from 'node:assert/strict';
import { afterEach, before, describe, it } from 'node:test';
import { setImmediate as tick } from 'node:timers/promises';

import fastifyPlugin from '../src/index';
import type { IMetricsPluginOptions } from '../src/types';
import { clientPromise } from './helper';

let client: typeof promClient;

type RouteMetricsOptions = NonNullable<IMetricsPluginOptions['routeMetrics']>;

interface ILogEntry {
  level: number;
  msg: string;
  err?: { message: string };
}

/** Builds an app whose route metrics options can fail on every response. */
async function buildApp(
  routeMetrics: RouteMetricsOptions,
  logs: ILogEntry[] = [],
): Promise<{ app: FastifyInstance; hookCalls: () => number }> {
  const app = fastify({
    logger: {
      level: 'error',
      stream: {
        write: (line: string) => {
          logs.push(JSON.parse(line) as ILogEntry);
        },
      },
    },
  });
  let calls = 0;
  await app.register(fastifyPlugin, {
    endpoint: '/metrics',
    routeMetrics: { enabled: true, ...routeMetrics },
  });
  app.addHook('onResponse', (_, __, done) => {
    calls++;
    done();
  });
  app.get('/test', async () => 'ok');
  await app.ready();
  return { app, hookCalls: () => calls };
}

const failingOptions: [string, RouteMetricsOptions][] = [
  [
    'customLabels function throws',
    {
      customLabels: {
        broken: () => {
          throw new Error('label failure');
        },
      },
    },
  ],
  [
    'getRouteLabel throws',
    {
      overrides: {
        labels: {
          getRouteLabel: () => {
            throw new Error('label failure');
          },
        },
      },
    },
  ],
];

void describe('routeMetrics.onError', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  for (const [title, options] of failingOptions) {
    void describe(title, () => {
      void it('keeps the response intact and runs later hooks once', async () => {
        const { app, hookCalls } = await buildApp(options);
        try {
          const res = await app.inject({ method: 'GET', url: '/test' });
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(res.payload, 'ok');
          assert.strictEqual(hookCalls(), 1);
        } finally {
          await app.close();
        }
      });

      void it('logs at error level by default', async () => {
        const logs: ILogEntry[] = [];
        const { app } = await buildApp(options, logs);
        try {
          await app.inject({ method: 'GET', url: '/test' });
          const entry = logs.find(
            (l) => l.msg === 'fastify-metrics: failed to record route metrics',
          );
          assert.ok(entry, 'expected an error log entry');
          assert.strictEqual(entry.level, 50);
          assert.strictEqual(entry.err?.message, 'label failure');
        } finally {
          await app.close();
        }
      });

      void it('passes the error to a custom onError', async () => {
        const received: unknown[] = [];
        const logs: ILogEntry[] = [];
        const { app, hookCalls } = await buildApp(
          {
            ...options,
            onError: (error, request, reply) => {
              received.push(error, request.url, reply.statusCode);
            },
          },
          logs,
        );
        try {
          const res = await app.inject({ method: 'GET', url: '/test' });
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(hookCalls(), 1);
          assert.ok(received[0] instanceof Error);
          assert.strictEqual(received[0].message, 'label failure');
          assert.strictEqual(received[1], '/test');
          assert.strictEqual(received[2], 200);
          assert.strictEqual(logs.length, 0, 'default logger not used');
        } finally {
          await app.close();
        }
      });

      void it('ignores a throwing onError', async () => {
        const { app, hookCalls } = await buildApp({
          ...options,
          onError: () => {
            throw new Error('handler failure');
          },
        });
        try {
          const res = await app.inject({ method: 'GET', url: '/test' });
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(hookCalls(), 1);
        } finally {
          await app.close();
        }
      });

      void it('ignores a rejected promise returned by onError', async () => {
        const unhandled: unknown[] = [];
        const listener = (reason: unknown): void => {
          unhandled.push(reason);
        };
        process.on('unhandledRejection', listener);
        const { app, hookCalls } = await buildApp({
          ...options,
          onError: () => Promise.reject(new Error('async failure')),
        });
        try {
          const res = await app.inject({ method: 'GET', url: '/test' });
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(hookCalls(), 1);
          await tick();
          await tick();
          assert.deepStrictEqual(unhandled, []);
        } finally {
          process.off('unhandledRejection', listener);
          await app.close();
        }
      });

      void it('handles a rejection from a thenable returned by onError', async () => {
        let rejectionHandled = false;
        const thenable = {
          // A non-Promise thenable is the point of this test.
          // oxlint-disable-next-line unicorn/no-thenable
          then(_onFulfilled?: unknown, onRejected?: unknown): void {
            if (typeof onRejected === 'function') {
              rejectionHandled = true;
              onRejected(new Error('async failure'));
            }
          },
        };
        const { app, hookCalls } = await buildApp({
          ...options,
          onError: () => thenable as unknown as void,
        });
        try {
          const res = await app.inject({ method: 'GET', url: '/test' });
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(hookCalls(), 1);
          assert.strictEqual(rejectionHandled, true);
        } finally {
          await app.close();
        }
      });
    });
  }
});
