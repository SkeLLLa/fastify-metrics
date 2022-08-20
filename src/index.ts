/**
 * Prometheus metrics exporter for Fastify. Based on
 * {@link https://github.com/siimon/prom-client | prom-client}. Also by default
 * it adds fastify route response time metrics (histogram and summary).
 *
 * @packageDocumentation
 */

import fastifyPlugin from 'fastify-plugin';
import client from 'prom-client';
import { FastifyMetrics } from './fastify-metrics';
import {
  IFastifyMetrics,
  IMetricsPluginOptions,
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

export * from './types';

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
 *      .get('/foo, (request, reply) => {
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
export default fastifyPlugin<IMetricsPluginOptions>(
  async (fastify, options) => {
    const { name = 'metrics', clearRegisterOnInit = false } = options;

    if (clearRegisterOnInit) {
      client.register.clear();
    }

    const fm = new FastifyMetrics({ client, fastify, options });
    fastify.decorate<IFastifyMetrics>(name, fm);
  },
  {
    fastify: '>=4.0.0',
    name: 'fastify-metrics',
  }
);
