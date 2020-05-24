import { FastifyInstance, FastifyPlugin, FastifyContext } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import client, { LabelValues } from 'prom-client';
import merge from 'deepmerge';
import {
  PluginOptions,
  FastifyMetrics,
  MetricsContextConfig,
  MetricConfig,
} from './plugin';

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Metrics interface
     */
    metrics: FastifyMetrics;
  }
  interface FastifySchema {
    /**
     * Hides metric route from swagger/openapi documentation
     */
    hide?: boolean; // for compatibility with fastify-oas
  }
  interface FastifyRequestInterface {
    metrics?: {
      /**
       * Request duration histogram
       * @param labels metric labels
       */
      hist: (labels?: LabelValues<string>) => void;
      /**
       * Request duration summary by quantiles
       * @param labels metric labels
       */
      sum: (labels?: LabelValues<string>) => void;
    };
  }
}

/**
 * Fastify metrics plugin
 * @param {FastifyInstance} fastify - Fastify instance asdfasdf asdf asdf
 */
const fastifyMetricsPlugin: FastifyPlugin<PluginOptions> = async function fastifyMetrics(
  fastify: FastifyInstance,
  {
    enableDefaultMetrics = true,
    groupStatusCodes = false,
    pluginName = 'metrics',
    blacklist,
    register,
    prefix,
    endpoint,
    metrics = {},
  }: PluginOptions = {}
) {
  const plugin: FastifyMetrics = { client };

  if (enableDefaultMetrics) {
    const collectMetricsForUrl = (url: string) => {
      const queryIndex = url.indexOf('?');
      url = queryIndex === -1 ? url : url.substring(0, queryIndex);
      if (!blacklist) {
        return true;
      }
      if (Array.isArray(blacklist)) {
        return blacklist.indexOf(url) === -1;
      }
      if (typeof blacklist === 'string') {
        return blacklist !== url;
      }
      if (typeof blacklist.test === 'function') {
        return !blacklist.test(url);
      }
      return false;
    };
    const defaultOpts: client.DefaultMetricsCollectorConfiguration = {};
    const opts: MetricConfig = {
      histogram: {
        name: 'http_request_duration_seconds',
        help: 'request duration in seconds',
        labelNames: ['status_code', 'method', 'route'],
        buckets: [0.05, 0.1, 0.5, 1, 3, 5, 10],
      },
      summary: {
        name: 'http_request_summary_seconds',
        help: 'request duration in seconds summary',
        labelNames: ['status_code', 'method', 'route'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
      },
    };
    if (register) {
      plugin.clearRegister = () => {
        register.clear();
      };
      defaultOpts.register = register;
      opts.histogram.registers = [register];
      opts.summary.registers = [register];
    }
    if (prefix) {
      defaultOpts.prefix = prefix;
      opts.histogram.name = `${prefix}${opts.histogram.name}`;
      opts.summary.name = `${prefix}${opts.summary.name}`;
    }

    const extendedOpts = merge<MetricConfig>(opts, metrics);

    client.collectDefaultMetrics(defaultOpts);
    const routeHist = new client.Histogram(extendedOpts.histogram);
    const routeSum = new client.Summary(extendedOpts.summary);

    if (endpoint) {
      fastify.route({
        url: endpoint,
        method: 'GET',
        schema: {
          // hide route from swagger plugins
          hide: true,
        },
        handler: (_, reply) => {
          const data = register
            ? register.metrics()
            : client.register.metrics();
          reply.type('text/plain').send(data);
        },
      });
    }

    fastify.addHook('onRequest', (request, _, next) => {
      if (request.raw.url && collectMetricsForUrl(request.raw.url)) {
        request.metrics = {
          hist: routeHist.startTimer(),
          sum: routeSum.startTimer(),
        };
      }
      next();
    });

    fastify.addHook('onResponse', function (request, reply, next) {
      if (request.metrics) {
        const context: FastifyContext<MetricsContextConfig> = reply.context as FastifyContext<
          MetricsContextConfig
        >;
        let routeId = context.config.url || request.raw.url;
        if (context.config.statsId) {
          routeId = context.config.statsId;
        }
        const method = request.raw.method;
        const statusCode = groupStatusCodes
          ? `${Math.floor(reply.raw.statusCode / 100)}xx`
          : reply.raw.statusCode;

        request.metrics.sum({
          method: method || 'UNKNOWN',
          route: routeId,
          status_code: statusCode,
        });
        request.metrics.hist({
          method: method || 'UNKNOWN',
          route: routeId,
          status_code: statusCode,
        });
      }
      next();
    });
  }

  fastify.decorate(pluginName, plugin);
};

export = fastifyPlugin(fastifyMetricsPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-metrics',
});
