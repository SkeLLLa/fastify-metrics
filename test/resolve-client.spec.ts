import defaultClient from '@prometheus-io/client';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type ModuleImporter, resolveClient } from '../src/resolve-client';

type IWarning = Error & { code?: string };

const moduleError = (code: string, message: string): Error =>
  Object.assign(new Error(message), { code });

/** Runs the resolver and captures process warnings emitted meanwhile. */
async function resolveWithWarnings(
  importer: ModuleImporter,
  selection: Parameters<typeof resolveClient>[0] = 'auto',
): Promise<{ client: unknown; warnings: IWarning[] }> {
  const warnings: IWarning[] = [];
  const listener = (w: IWarning): void => {
    warnings.push(w);
  };
  process.on('warning', listener);
  try {
    const client = await resolveClient(selection, importer);
    // warnings are emitted on the next tick
    await new Promise((resolve) => setImmediate(resolve));
    return { client, warnings };
  } finally {
    process.off('warning', listener);
  }
}

const fallbackWarnings = (warnings: IWarning[]): IWarning[] =>
  warnings.filter((w) => w.code === 'FSTMETRICS_CLIENT_FALLBACK');

const goodModule = {
  default: {
    Histogram: () => {},
    Summary: () => {},
    Registry: () => {},
    collectDefaultMetrics: () => {},
    register: {},
  },
};

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

  void describe('with an injected importer', () => {
    void it('uses a compatible module', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.resolve(goodModule),
      );
      assert.strictEqual(client, goodModule.default);
      assert.strictEqual(fallbackWarnings(warnings).length, 0);
    });

    void it('falls back silently when the package is not installed (ESM)', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.reject(
          moduleError(
            'ERR_MODULE_NOT_FOUND',
            "Cannot find package '@platformatic/prom-client' imported from /app/x.js",
          ),
        ),
      );
      assert.strictEqual(client, defaultClient);
      assert.strictEqual(fallbackWarnings(warnings).length, 0);
    });

    void it('falls back silently when the package is not installed (CJS)', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.reject(
          moduleError(
            'MODULE_NOT_FOUND',
            "Cannot find module '@platformatic/prom-client'\nRequire stack:\n- /app/x.js",
          ),
        ),
      );
      assert.strictEqual(client, defaultClient);
      assert.strictEqual(fallbackWarnings(warnings).length, 0);
    });

    void it('warns when a dependency of the package is missing', async () => {
      for (const error of [
        moduleError(
          'ERR_MODULE_NOT_FOUND',
          "Cannot find package 'some-dep' imported from /app/node_modules/@platformatic/prom-client/index.js",
        ),
        moduleError(
          'MODULE_NOT_FOUND',
          "Cannot find module 'some-dep'\nRequire stack:\n- /app/node_modules/@platformatic/prom-client/index.js",
        ),
      ]) {
        const { client, warnings } = await resolveWithWarnings(() =>
          Promise.reject(error),
        );
        assert.strictEqual(client, defaultClient);
        assert.strictEqual(fallbackWarnings(warnings).length, 1);
      }
    });

    void it('warns on any other import error', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.reject(new SyntaxError('broken module')),
      );
      assert.strictEqual(client, defaultClient);
      const found = fallbackWarnings(warnings);
      assert.strictEqual(found.length, 1);
      assert.ok(found[0]?.message.includes('broken module'));
    });

    void it('warns when the import rejects with a non-Error value', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.reject('plain failure'),
      );
      assert.strictEqual(client, defaultClient);
      const found = fallbackWarnings(warnings);
      assert.strictEqual(found.length, 1);
      assert.ok(found[0]?.message.includes('plain failure'));
    });

    void it('warns on a not-found code without a message', async () => {
      const { client, warnings } = await resolveWithWarnings(() =>
        Promise.reject(
          Object.assign(new Error(), {
            code: 'ERR_MODULE_NOT_FOUND',
            message: undefined,
          }),
        ),
      );
      assert.strictEqual(client, defaultClient);
      assert.strictEqual(fallbackWarnings(warnings).length, 1);
    });

    void it('warns when the module has an unexpected shape', async () => {
      const shapes: unknown[] = [
        null,
        { default: null },
        {},
        { default: {} },
        { default: { ...goodModule.default, register: null } },
        { default: { ...goodModule.default, collectDefaultMetrics: {} } },
        { default: { ...goodModule.default, Histogram: undefined } },
        { default: { ...goodModule.default, Summary: undefined } },
        { default: { ...goodModule.default, Registry: undefined } },
      ];
      for (const shape of shapes) {
        const { client, warnings } = await resolveWithWarnings(() =>
          Promise.resolve(shape),
        );
        assert.strictEqual(client, defaultClient);
        assert.strictEqual(fallbackWarnings(warnings).length, 1);
      }
    });

    void it("'prometheus-io' never imports the optional package", async () => {
      let imports = 0;
      const { client } = await resolveWithWarnings(() => {
        imports++;
        return Promise.resolve(goodModule);
      }, 'prometheus-io');
      assert.strictEqual(client, defaultClient);
      assert.strictEqual(imports, 0);
    });

    void it("'platformatic' uses a compatible module", async () => {
      const { client } = await resolveWithWarnings(
        () => Promise.resolve(goodModule),
        'platformatic',
      );
      assert.strictEqual(client, goodModule.default);
    });

    void it("'platformatic' throws when unavailable or incompatible", async () => {
      const importers: ModuleImporter[] = [
        () =>
          Promise.reject(
            moduleError(
              'ERR_MODULE_NOT_FOUND',
              "Cannot find package '@platformatic/prom-client' imported from /app/x.js",
            ),
          ),
        () => Promise.resolve({ default: {} }),
      ];
      for (const importer of importers) {
        await assert.rejects(
          resolveClient('platformatic', importer),
          /'platformatic' was requested/,
        );
      }
    });

    void it('returns a client object as-is', async () => {
      const custom = {} as typeof defaultClient;
      assert.strictEqual(
        await resolveClient(custom, () => Promise.reject(new Error('unused'))),
        custom,
      );
    });
  });
});
