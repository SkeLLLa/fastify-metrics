import type promClient from '@prometheus-io/client';
import { fastify } from 'fastify';
import assert from 'node:assert/strict';
import { afterEach, before, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import { clientPromise } from './helper';

let client: typeof promClient;

/** Finds the value of the sample line with the given prefix and labels. */
function sampleValue(
  payload: string,
  metric: string,
  suffix: string,
): number | undefined {
  const line = payload
    .split('\n')
    .find(
      (l) =>
        l.startsWith(`${metric}_${suffix}{`) &&
        l.includes('route="/test"') &&
        l.includes('status_code="200"'),
    );
  return line === undefined ? undefined : Number(line.split(' ').pop());
}

void describe('routeMetrics.timing', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  void it('uses timers when routeMetrics is an empty object', async () => {
    const app = fastify();
    try {
      await app.register(fastifyPlugin, {
        routeMetrics: {},
      });
      app.get('/test', async () => 'ok');
      await app.ready();

      // Timers are only started in the onRequest hook
      let timerStarts = 0;
      const histogram = (
        app.metrics as unknown as {
          routeMetrics: { routeHist: { startTimer: () => unknown } };
        }
      ).routeMetrics.routeHist;
      const originalStartTimer = histogram.startTimer;
      const original = originalStartTimer.bind(histogram);
      histogram.startTimer = () => {
        timerStarts++;
        return original();
      };

      try {
        await app.inject({ method: 'GET', url: '/test' });
        assert.strictEqual(timerStarts, 1);
      } finally {
        histogram.startTimer = originalStartTimer;
      }
    } finally {
      await app.close();
    }
  });

  void it('elapsedTime starts no timers and records a plausible duration', async () => {
    const app = fastify();
    try {
      await app.register(fastifyPlugin, {
        routeMetrics: { timing: 'elapsedTime' },
      });
      app.get('/test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'ok';
      });
      await app.ready();

      const instruments = (
        app.metrics as unknown as {
          routeMetrics: {
            routeHist: { startTimer: () => unknown };
            routeSum: { startTimer: () => unknown };
          };
        }
      ).routeMetrics;
      const originalHist = instruments.routeHist.startTimer;
      const originalSum = instruments.routeSum.startTimer;
      let timerStarts = 0;
      const count = (): never => {
        timerStarts++;
        throw new Error('timer must not be used');
      };
      instruments.routeHist.startTimer = count;
      instruments.routeSum.startTimer = count;

      let res;
      try {
        await app.inject({ method: 'GET', url: '/test' });
        res = await app.inject({ method: 'GET', url: '/metrics' });
      } finally {
        instruments.routeHist.startTimer = originalHist;
        instruments.routeSum.startTimer = originalSum;
      }

      assert.strictEqual(timerStarts, 0);
      for (const metric of [
        'http_request_duration_seconds',
        'http_request_summary_seconds',
      ]) {
        assert.strictEqual(sampleValue(res.payload, metric, 'count'), 1);
        const sum = sampleValue(res.payload, metric, 'sum');
        assert.ok(
          sum !== undefined && sum > 0 && sum < 5,
          `plausible ${metric}`,
        );
      }
    } finally {
      await app.close();
    }
  });

  void it('elapsedTime ignores routes that are excluded', async () => {
    const app = fastify();
    try {
      await app.register(fastifyPlugin, {
        routeMetrics: { timing: 'elapsedTime', routeBlacklist: ['/test'] },
      });
      app.get('/test', async () => 'ok');
      await app.ready();

      await app.inject({ method: 'GET', url: '/test' });
      const res = await app.inject({ method: 'GET', url: '/metrics' });
      assert.strictEqual(
        sampleValue(res.payload, 'http_request_duration_seconds', 'count'),
        undefined,
      );
    } finally {
      await app.close();
    }
  });
});
