import {FastifyInstance, Plugin} from 'fastify';
import * as http from 'http';
import fastifyPlugin from 'fastify-plugin';
import client, {
  HistogramConfiguration,
  SummaryConfiguration,
  labelValues,
} from 'prom-client';
import {PluginOptions, FastifyMetrics} from './plugin';

declare module 'fastify' {
  interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    metrics: FastifyMetrics;
  }
  interface RouteSchema {
    hide?: boolean; // for compatibility with fastify-oas
  }
  interface FastifyRequest<HttpRequest, Query, Params, Headers, Body> {
    metrics?: {
      hist: (labels?: labelValues) => void;
      sum: (labels?: labelValues) => void;
    };
  }
}

const fastifyMetricsPlugin: Plugin<
  http.Server,
  http.IncomingMessage,
  http.ServerResponse,
  PluginOptions
> = function fastifyMetrics(
  fastify: FastifyInstance,
  {
    enableDefaultMetrics = true,
    groupStatusCodes = false,
    pluginName = 'metrics',
    interval = 5000,
    blacklist,
    register,
    prefix,
    endpoint,
    metrics = {},
  }: PluginOptions = {},
  next: fastifyPlugin.nextCallback
) {
  const plugin: FastifyMetrics = {client};

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
    const defaultOpts: client.DefaultMetricsCollectorConfiguration = {
      timeout: interval,
    };
    const opts: {
      [name: string]: HistogramConfiguration | SummaryConfiguration;
    } = {
      histogram: {
        name: 'http_request_duration_seconds',
        help: 'request duration in seconds',
        labelNames: ['status_code', 'method', 'route'],
        buckets: [0.05, 0.1, 0.5, 1, 3, 5, 10],
      } as HistogramConfiguration,
      summary: {
        name: 'http_request_summary_seconds',
        help: 'request duration in seconds summary',
        labelNames: ['status_code', 'method', 'route'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
      } as SummaryConfiguration,
    };
    if (register) {
      plugin.clearRegister = register.clear;
      defaultOpts.register = register;
      opts.histogram.registers = [register];
      opts.summary.registers = [register];
    }
    if (prefix) {
      defaultOpts.prefix = prefix;
      opts.histogram.name = `${prefix}${opts.histogram.name}`;
      opts.summary.name = `${prefix}${opts.summary.name}`;
    }
    Object.keys(metrics)
      .filter(opts.hasOwnProperty.bind(opts))
      .forEach((key) => {
        Object.assign(opts[key], metrics[key]);
      });

    client.collectDefaultMetrics(defaultOpts);
    const routeHist = new client.Histogram(opts.histogram);
    const routeSum = new client.Summary(opts.summary);

    if (endpoint) {
      fastify.route({
        url: endpoint,
        method: 'GET',
        schema: {hide: true},
        handler: (_, reply) => {
          const data = register
            ? register.metrics()
            : client.register.metrics();
          reply.type('text/plain').send(data);
        },
      });
    }

    fastify.addHook('onRequest', (request, _, next) => {
      if (request.req.url && collectMetricsForUrl(request.req.url)) {
        request.metrics = {
          hist: routeHist.startTimer(),
          sum: routeSum.startTimer(),
        };
      }
      next();
    });

    fastify.addHook('onResponse', function(request, reply, next) {
      if (request.metrics) {
        let routeId = reply.context.config.url || request.req.url;
        if (reply.context.config.statsId) {
          routeId = reply.context.config.statsId;
        }
        const method = request.req.method;
        const statusCode = groupStatusCodes
          ? `${Math.floor(reply.res.statusCode / 100)}xx`
          : reply.res.statusCode;

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
  next();
};

export = fastifyPlugin(fastifyMetricsPlugin, {
  fastify: '>=2.0.0',
  name: 'fastify-metrics',
});
