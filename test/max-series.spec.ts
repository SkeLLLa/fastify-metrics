import type promClient from '@prometheus-io/client';
import { fastify, type FastifyInstance, type FastifyRequest } from 'fastify';
import assert from 'node:assert/strict';
import { afterEach, before, describe, it } from 'node:test';

import fastifyPlugin from '../src/index';
import type { IMetricsPluginOptions } from '../src/types';
import { clientPromise } from './helper';

let client: typeof promClient;

type RouteMetricsOptions = NonNullable<IMetricsPluginOptions['routeMetrics']>;

interface ILogEntry {
  level: number;
  msg: string;
}

interface Series {
  route?: string;
  tenant?: string;
  region?: string;
  method?: string;
  status_code?: string;
}

interface IQuery {
  t?: string;
  r?: string;
}

/** Builds an app with `tenant` and `region` custom labels read from the query. */
async function buildApp(
  routeMetrics: RouteMetricsOptions,
  logs: ILogEntry[] = [],
): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: 'warn',
      stream: {
        write: (line: string) => {
          logs.push(JSON.parse(line) as ILogEntry);
        },
      },
    },
  });
  await app.register(fastifyPlugin, {
    endpoint: '/metrics',
    defaultMetrics: { enabled: false },
    routeMetrics: {
      enabled: true,
      customLabels: {
        tenant: (request: FastifyRequest) => (request.query as IQuery).t ?? '',
        region: (request: FastifyRequest) => (request.query as IQuery).r ?? '',
      },
      ...routeMetrics,
    },
  });
  app.get('/test', async () => 'ok');
  await app.ready();
  return app;
}

/** Parses the histogram count lines into label maps with their counts. */
function parseCounts(payload: string): { labels: Series; count: number }[] {
  const result: { labels: Series; count: number }[] = [];
  for (const line of payload.split('\n')) {
    if (!line.startsWith('http_request_duration_seconds_count{')) continue;
    const labels: Series = {};
    for (const m of line.matchAll(/(\w+)="((?:[^"\\]|\\.)*)"/g)) {
      (labels as Record<string, string>)[m[1] ?? ''] = (m[2] ?? '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    result.push({
      labels,
      count: Number(line.split(' ').pop()),
    });
  }
  return result;
}

const find = (
  series: { labels: Series; count: number }[],
  match: Series,
): { labels: Series; count: number } | undefined =>
  series.find((s) =>
    Object.entries(match).every(
      ([k, v]) => (s.labels as Record<string, string>)[k] === v,
    ),
  );

const isOverflow = (s: { labels: Series }): boolean =>
  s.labels.route === '__overflow__';

const warnings = (logs: ILogEntry[]): ILogEntry[] =>
  logs.filter((l) => l.msg.includes('maxSeries'));

void describe('routeMetrics.maxSeries', () => {
  before(async () => {
    client = await clientPromise;
  });

  afterEach(() => {
    client.register.clear();
  });

  for (const timing of ['timers', 'elapsedTime'] as const) {
    void describe(`timing: ${timing}`, () => {
      void it('bounds distinct tuples and keeps admitted ones recording', async () => {
        const logs: ILogEntry[] = [];
        const app = await buildApp({ maxSeries: 2, timing }, logs);
        try {
          for (const t of ['a', 'b', 'c', 'd', 'a']) {
            await app.inject({ method: 'GET', url: '/test', query: { t } });
          }
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload).filter(
            (s) => s.labels.route !== '/metrics',
          );

          const regular = series.filter((s) => !isOverflow(s));
          assert.strictEqual(regular.length, 2);
          assert.strictEqual(find(series, { tenant: 'a' })?.count, 2);
          assert.strictEqual(find(series, { tenant: 'b' })?.count, 1);
          const overflow = series.filter(isOverflow);
          assert.strictEqual(overflow.length, 1);
          assert.strictEqual(overflow[0]?.count, 2);
          assert.strictEqual(overflow[0]?.labels.tenant, '__overflow__');
          assert.strictEqual(overflow[0]?.labels.region, '__overflow__');
          assert.strictEqual(overflow[0]?.labels.method, 'GET');
          assert.strictEqual(overflow[0]?.labels.status_code, '200');
          assert.strictEqual(warnings(logs).length, 1);
        } finally {
          await app.close();
        }
      });

      void it('is unlimited when maxSeries is not set', async () => {
        const logs: ILogEntry[] = [];
        const app = await buildApp({ timing }, logs);
        try {
          for (const t of ['a', 'b', 'c', 'd']) {
            await app.inject({ method: 'GET', url: '/test', query: { t } });
          }
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload);
          assert.strictEqual(series.filter(isOverflow).length, 0);
          assert.strictEqual(warnings(logs).length, 0);
        } finally {
          await app.close();
        }
      });

      void it('keeps the grouped status code on overflow tuples', async () => {
        const app = await buildApp({
          maxSeries: 1,
          groupStatusCodes: true,
          timing,
        });
        try {
          for (const t of ['a', 'b']) {
            await app.inject({ method: 'GET', url: '/test', query: { t } });
          }
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload);
          assert.strictEqual(
            find(series, { tenant: 'a' })?.labels.status_code,
            '2xx',
          );
          const overflow = series.find(isOverflow);
          assert.strictEqual(overflow?.labels.status_code, '2xx');
          assert.strictEqual(overflow?.count, 1);
        } finally {
          await app.close();
        }
      });

      void it('does not treat a real __overflow__ value as admitted', async () => {
        const app = await buildApp({ maxSeries: 1, timing });
        try {
          for (const t of ['x', '__overflow__']) {
            await app.inject({ method: 'GET', url: '/test', query: { t } });
          }
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload);
          assert.strictEqual(series.filter((s) => !isOverflow(s)).length, 1);
          assert.strictEqual(
            find(series, { route: '/test', tenant: '__overflow__' }),
            undefined,
          );
          assert.strictEqual(series.find(isOverflow)?.count, 1);
        } finally {
          await app.close();
        }
      });

      const delimiterPairs: [[string, string], [string, string]][] = [
        [
          ['a,b', 'c'],
          ['a', 'b,c'],
        ],
        [
          ['a\u0000b', 'c'],
          ['a', 'b\u0000c'],
        ],
        [
          ['a"', 'b'],
          ['a', '"b'],
        ],
        [
          ['a","b', 'c'],
          ['a', 'b","c'],
        ],
      ];
      for (const [first, second] of delimiterPairs) {
        void it(`keeps tuples with delimiter-like values distinct (${JSON.stringify(first)})`, async () => {
          const logs: ILogEntry[] = [];
          const app = await buildApp({ maxSeries: 2, timing }, logs);
          try {
            for (const [t, r] of [first, second, ['z', 'z']] as const) {
              await app.inject({
                method: 'GET',
                url: '/test',
                query: { t, r },
              });
            }
            const res = await app.inject({ method: 'GET', url: '/metrics' });
            const series = parseCounts(res.payload).filter(
              (s) => s.labels.route !== '/metrics',
            );
            assert.strictEqual(
              find(series, { tenant: first[0], region: first[1] })?.count,
              1,
            );
            assert.strictEqual(
              find(series, { tenant: second[0], region: second[1] })?.count,
              1,
            );
            assert.strictEqual(find(series, { tenant: 'z' }), undefined);
            assert.strictEqual(series.find(isOverflow)?.count, 1);
            assert.strictEqual(warnings(logs).length, 1);
          } finally {
            await app.close();
          }
        });
      }

      void it('counts a tuple once any instrument has recorded it', async () => {
        const errors: unknown[] = [];
        const app = await buildApp({
          maxSeries: 1,
          timing,
          onError: (error: unknown) => {
            errors.push(error);
          },
        });
        const instruments = (
          app.metrics as unknown as {
            routeMetrics: {
              routeSum: {
                observe: () => void;
                startTimer: () => unknown;
              };
            };
          }
        ).routeMetrics.routeSum;
        const originalObserve = instruments.observe;
        const originalStartTimer = instruments.startTimer;
        try {
          // The histogram records, then the summary fails
          instruments.observe = () => {
            throw new Error('summary failure');
          };
          instruments.startTimer = () => () => {
            throw new Error('summary failure');
          };
          await app.inject({ method: 'GET', url: '/test', query: { t: 'a' } });
          instruments.observe = originalObserve;
          instruments.startTimer = originalStartTimer;

          await app.inject({ method: 'GET', url: '/test', query: { t: 'b' } });
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload);

          assert.strictEqual(errors.length, 1);
          assert.strictEqual(find(series, { tenant: 'a' })?.count, 1);
          assert.strictEqual(find(series, { tenant: 'b' }), undefined);
          assert.strictEqual(series.find(isOverflow)?.count, 1);
        } finally {
          instruments.observe = originalObserve;
          instruments.startTimer = originalStartTimer;
          await app.close();
        }
      });

      void it('admits tuples again after initMetricsInRegistry', async () => {
        const app = await buildApp({ maxSeries: 1, timing });
        try {
          for (const t of ['a', 'b']) {
            await app.inject({ method: 'GET', url: '/test', query: { t } });
          }
          app.metrics.client.register.clear();
          app.metrics.initMetricsInRegistry();

          await app.inject({ method: 'GET', url: '/test', query: { t: 'b' } });
          const res = await app.inject({ method: 'GET', url: '/metrics' });
          const series = parseCounts(res.payload);
          const b = find(series, { route: '/test', tenant: 'b' });
          assert.strictEqual(b?.count, 1);
          assert.strictEqual(series.filter(isOverflow).length, 0);
        } finally {
          await app.close();
        }
      });
    });
  }

  void describe('validation', () => {
    const invalid: unknown[] = [0, -1, 1.5, Number.NaN, '3', Infinity];
    for (const maxSeries of invalid) {
      void it(`rejects maxSeries = ${String(maxSeries)}`, async () => {
        await assert.rejects(
          buildApp({
            maxSeries: maxSeries as number,
          }),
          /maxSeries must be a positive integer/,
        );
      });
    }
  });
});
