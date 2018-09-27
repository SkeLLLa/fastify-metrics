const fastify = require('fastify');
const app = fastify({
  ignoreTrailingSlash: true,
  trustProxy: true,
});

const metricsPlugin = require('../');
app.register(metricsPlugin, {endpoint: '/metrics'});
app.get(
  '/:id',
  {
    schema: {
      params: {
        id: {
          type: 'string',
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            delay: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  function(request, reply) {
    const {id} = request.params;
    reply.code(200);
    const delay = Math.random() * 10000;

    setTimeout(() => {
      reply.send({id, delay});
    }, delay);
  }
);

app.get(
  '/',
  {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'string',
            },
            delay: {
              type: 'number',
            },
          },
        },
      },
    },
  },
  function(_, reply) {
    reply.code(200);
    const delay = Math.random() * 10000;
    setTimeout(() => {
      reply.send({data: 'hello', delay});
    }, delay);
  }
);

(async () => {
  try {
    await Promise.all([app.listen(3333), app.ready()]);
  } catch (ex) {
    app.log.error('Fatal error', ex.message, ex.stack);
    process.exit(1);
  }
})();
