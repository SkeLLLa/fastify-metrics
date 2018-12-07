import 'jest';
import fastifyPlugin = require('../src/index');
const {name} = require('../package.json');

describe(name, () => {
  test('fastify plugin exported', async () => {
    expect(fastifyPlugin).toBeDefined();
  });
});
