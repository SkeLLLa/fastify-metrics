import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import defaultClient from 'prom-client';
import { resolveClient } from '../src/resolve-client';

void describe('resolveClient', () => {
  void it('resolves a prom-client compatible module', async () => {
    const client = await resolveClient();
    // Must have the essential prom-client API surface
    assert.ok(typeof client.register === 'object', 'has global register');
    assert.ok(
      typeof client.collectDefaultMetrics === 'function',
      'has collectDefaultMetrics',
    );
    assert.ok(typeof client.Histogram === 'function', 'has Histogram');
    assert.ok(typeof client.Summary === 'function', 'has Summary');
    assert.ok(typeof client.Counter === 'function', 'has Counter');
    assert.ok(typeof client.Gauge === 'function', 'has Gauge');
    assert.ok(typeof client.Registry === 'function', 'has Registry');
  });

  void it('returns prom-client when @platformatic/prom-client is not installed', async () => {
    const client = await resolveClient();
    assert.strictEqual(client, defaultClient);
  });
});
