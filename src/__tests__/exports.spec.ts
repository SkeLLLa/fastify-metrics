import { name } from '../../package.json';
import fastifyPlugin = require('../index');

describe(name, () => {
  test('fastify plugin exported', async () => {
    expect(fastifyPlugin).toBeDefined();
  });
});
