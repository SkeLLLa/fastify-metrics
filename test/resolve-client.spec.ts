import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import defaultClient from 'prom-client';
import { resolveClient } from '../src/resolve-client';

void describe('resolveClient', () => {
  void it('resolves a prom-client compatible module', async () => {
    const client = await resolveClient();
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

  void it('prefers @platformatic/prom-client when installed', async () => {
    const client = await resolveClient();
    let platformaticAvailable = false;
    try {
      const pkg = '@platformatic/prom-client';
      await import(pkg);
      platformaticAvailable = true;
    } catch {
      // not installed
    }

    if (platformaticAvailable) {
      assert.notStrictEqual(
        client,
        defaultClient,
        'should prefer @platformatic/prom-client over prom-client',
      );
    } else {
      assert.strictEqual(
        client,
        defaultClient,
        'should fall back to prom-client',
      );
    }
  });
});
