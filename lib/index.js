const fp = require('fastify-plugin');
const client = require('prom-client');

const fastifyMetrics = (
  fastify,
  {
    enableDefaultMetrics = true,
    pluginName = 'metrics',
    interval = 5000,
    blacklist,
    register,
    prefix,
    endpoint,
    metrics = {},
  } = {},
  next
) => {
  const plugin = {client};

  if (typeof blacklist === 'string') {
    blacklist = new RegExp(blacklist, 'i');
  }

  const collectMetricsForUrl = (url) => {
    if (!blacklist) {
      return true;
    }
    if (Array.isArray(blacklist)) {
      return blacklist.indexOf(url) === -1;
    }
    if (typeof blacklist.test === 'function') {
      return !blacklist.test(url);
    }
    return blacklist !== url;
  };

  if (enableDefaultMetrics) {
    const defaultOpts = {timeout: interval};
    const opts = {
      histogram: {
        name: 'http_request_duration_seconds',
        help: 'request duration in seconds',
        labelNames: ['status_code', 'method', 'route'],
        buckets: [0.005, 0.05, 0.1, 0.5, 1, 3, 5, 10],
      },
      summary: {
        name: 'http_request_summary_seconds',
        help: 'request duration in seconds summary',
        labelNames: ['status_code', 'method', 'route'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
      },
    };

    if (register) {
      defaultOpts.register = register;
      opts.histogram.registers = register;
      opts.summary.registers = register;
    }

    if (prefix) {
      defaultOpts.prefix = prefix;
      opts.histogram.name = `${prefix}${opts.count.name}`;
      opts.summary.name = `${prefix}${opts.count.name}`;
    }

    Object.keys(metrics)
      .filter(opts.hasOwnProperty)
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
      if (collectMetricsForUrl(request.url)) {
        request.metrics = {
          hist: routeHist.startTimer(),
          sum: routeSum.startTimer(),
        };
      }
      next();
    });

    fastify.addHook('onSend', function(request, reply, _, next) {
      if (request.raw.metrics) {
        let routeId = reply.context.config.url || request.raw.url;
        if (reply.context.config.statsId) {
          routeId = reply.context.config.statsId;
        }
        const method = request.raw.method;

        request.raw.metrics.sum({
          method,
          route: routeId,
          status_code: reply.res.statusCode,
        });
        request.raw.metrics.hist({
          method,
          route: routeId,
          status_code: reply.res.statusCode,
        });
      }
      next();
    });
  }
  fastify.decorate(pluginName, plugin);
  next();
};

module.exports = fp(fastifyMetrics, {
  fastify: '>=1.9.0',
  name: 'fastify-metrics',
});
