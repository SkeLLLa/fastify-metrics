import defaultClient from '@prometheus-io/client';
import { fastify } from 'fastify';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import { resolveClient } from '../src/resolve-client';

/** Checks whether the optional package passes the resolver's own checks. */
async function platformaticUsable(): Promise<boolean> {
  return resolveClient('platformatic').then(
    () => true,
    () => false,
  );
}

const quiet = {
  defaultMetrics: { enabled: false },
  routeMetrics: { enabled: false },
};

void describe('promClient selection', () => {
  void it("'prometheus-io' uses @prometheus-io/client", async () => {
    const app = fastify();
    try {
      await app.register(fastifyPlugin, {
        promClient: 'prometheus-io',
        ...quiet,
      });
      await app.ready();
      assert.strictEqual(app.metrics.client, defaultClient);
    } finally {
      await app.close();
    }
  });

  void it("'platformatic' uses the optional package or fails registration", async () => {
    const usable = await platformaticUsable();
    const app = fastify();
    try {
      const registration = app.register(fastifyPlugin, {
        promClient: 'platformatic',
        ...quiet,
      });
      if (usable) {
        await registration;
        await app.ready();
        assert.notStrictEqual(app.metrics.client, defaultClient);
      } else {
        await assert.rejects(
          (async () => {
            await registration;
            await app.ready();
          })(),
          /'platformatic' was requested/,
        );
      }
    } finally {
      await app.close();
    }
  });

  void it("'auto' and null register successfully", async () => {
    for (const promClient of ['auto', null] as const) {
      const app = fastify();
      try {
        await app.register(fastifyPlugin, { promClient, ...quiet });
        await app.ready();
        assert.strictEqual(typeof app.metrics.client.register, 'object');
      } finally {
        await app.close();
      }
    }
  });
});

void describe('relaxed endpoint object', () => {
  void it('registers without method and handler', async () => {
    const app = fastify();
    try {
      await app.register(fastifyPlugin, {
        promClient: 'prometheus-io',
        endpoint: { url: '/relaxed' },
        ...quiet,
      });
      await app.ready();
      const res = await app.inject({ method: 'GET', url: '/relaxed' });
      assert.strictEqual(res.statusCode, 200);
    } finally {
      defaultClient.register.clear();
      await app.close();
    }
  });
});
