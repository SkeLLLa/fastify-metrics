import fastifyPlugin = require('../index');

describe('exports plugin', () => {
  test('fastify plugin exported', async () => {
    expect(fastifyPlugin).toBeDefined();
  });
});
