const fp = require('fastify-plugin');
const client = require('prom-client');

const fastifyMetrics = (
  fastify,
  {enableDefaultMetrics = true, interval = 5000, register, prefix, endpoint} = {},
  next
) => {
  if (enableDefaultMetrics) {
    const defaultOpts = {timeout: interval};
    const opts = {
      count: {
        name: 'http_request_count',
        help: 'request count',
        labelNames: ['status_code', 'method', 'route'],
      },
      hist: {
        name: 'http_request_buckets_seconds',
        help: 'request duration in seconds',
        labelNames: ['status_code', 'method', 'route'],
        buckets: [0.005, 0.050, 0.100, 0.500, 1, 3, 5, 10],
      },
      sum: {
        name: 'http_request_summary_seconds',
        help: 'request duration in seconds summary',
        labelNames: ['status_code', 'method', 'route'],
        percentiles: [0.5, 0.9, 0.95, 0.99],
      },
    };
    if (register) {
      defaultOpts.register = register;
      opts.count.registers = register;
      opts.hist.registers = register;
      opts.sum.registers = register;
    }
    if (prefix) {
      defaultOpts.prefix = prefix;
      opts.count.name = `${prefix}${opts.count.name}`;
      opts.hist.name = `${prefix}${opts.count.name}`;
      opts.sum.name = `${prefix}${opts.count.name}`;
    }
    client.collectDefaultMetrics(defaultOpts);
    const routeCount = new client.Counter(opts.count);
    const routeHist = new client.Histogram(opts.hist);
    const routeSum = new client.Summary(opts.sum);

    if (endpoint) {
      fastify.route({
        url: endpoint,
        method: 'GET',
        schema: {hide: true},
        handler: (_, reply) => {
          const data = register ? register.metrics() : client.register.metrics();
          reply.type('text/plain').send(data);
        }
      });
    }

    fastify.addHook('onRequest', (request, _, next) => {
      request.metrics = {
        hist: routeHist.startTimer(),
        sum: routeSum.startTimer(),
      };
      next();
    });

    fastify.addHook('onSend', function(request, reply, _, next) {
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
      routeCount.inc({
        method,
        route: routeId,
        status_code: reply.res.statusCode,
      });

      next();
    });
  }
  fastify.decorate('metrics', client);
  next();
};

module.exports = fp(fastifyMetrics, {
  fastify: '>=1.9.0',
  name: 'fastify-metrics',
});
