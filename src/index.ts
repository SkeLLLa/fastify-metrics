/**
 * Prometheus metrics exporter for Fastify. Based on
 * {@link https://github.com/prometheus/client_js | @prometheus-io/client}. Also
 * by default it adds fastify route response time metrics (histogram and
 * summary).
 *
 * @packageDocumentation
 */

import { fastifyPlugin } from 'fastify-plugin';

import { FastifyMetrics } from './fastify-metrics';
import { resolveClient } from './resolve-client';
import type {
  IFastifyMetrics,
  IMetricsPluginOptions,
  IMetricsPluginRegisterOptions,
  IMetricsRouteContextConfig,
} from './types';

declare module 'fastify' {
  interface FastifyInstance {
    /** Metrics interface */
    metrics: IFastifyMetrics;
  }
  interface FastifyContextConfig extends IMetricsRouteContextConfig {
    /** Override route definition */
    statsId?: string;
    /** Disables metric collection on this route */
    disableMetrics?: boolean;
  }
}

export type * from './types';

/** Converts registration input to the internal options shape. */
function normalizeOptions(
  input: Partial<IMetricsPluginRegisterOptions>,
  promClient: IMetricsPluginOptions['promClient'],
): Partial<IMetricsPluginOptions> {
  const { endpoint, ...rest } = input;
  const normalized: Partial<IMetricsPluginOptions> = { ...rest, promClient };
  if (typeof endpoint === 'object' && endpoint !== null) {
    // Method and handler are enforced by the plugin; placeholders only satisfy
    // the RouteOptions type and are replaced on a copy.
    normalized.endpoint = {
      ...endpoint,
      method: endpoint.method ?? 'GET',
      handler: endpoint.handler ?? (() => undefined),
    };
  } else if (endpoint !== undefined) {
    normalized.endpoint = endpoint;
  }
  return normalized;
}

/**
 * Metric plugin
 *
 * @example
 *
 * ```typescript
 *     import fastify from 'fastify'
 *     import fastifyMetrics, { IMetricsPluginOptions } from fastify-metrics
 *
 *     const options: IMetricsPluginOptions = { endpoint: '/metrics' }
 *     fastify()
 *      .register(fastifyMetrics, options)
 *      .get('/foo', (request, reply) => {
 *         reply.code(200);
 *         const delay = Math.random() * 10000;
 *         setTimeout(() => {
 *           reply.send({ id, delay });
 *         }, delay);
 *      })
 *      .ready()
 *      .listen(3000)
 * ```
 */
export default fastifyPlugin<Partial<IMetricsPluginRegisterOptions>>(
  async (fastify, input) => {
    const { name = 'metrics', clearRegisterOnInit = false } = input;

    const promClient = await resolveClient(input.promClient);
    const options = normalizeOptions(input, promClient);

    if (clearRegisterOnInit) {
      promClient.register.clear();
    }

    const fm = new FastifyMetrics({ client: promClient, fastify, options });
    fastify.decorate<IFastifyMetrics>(name, fm);
  },
  {
    fastify: '>=5.0.0',
    name: 'fastify-metrics',
  },
);
