import { resolveClient } from '../src/resolve-client.js';
import type { IMetricsPluginRegisterOptions } from '../src/types.js';

/** Client selection modes available to the test suite. */
export type TestClientSelection = 'auto' | 'prometheus-io' | 'platformatic';

const SELECTIONS: readonly string[] = ['auto', 'prometheus-io', 'platformatic'];

const requested = process.env['FASTIFY_METRICS_TEST_CLIENT'] ?? 'auto';
if (!SELECTIONS.includes(requested)) {
  throw new Error(
    `FASTIFY_METRICS_TEST_CLIENT must be one of ${SELECTIONS.join(', ')}`,
  );
}

/**
 * Client selection used for every plugin registration in the tests. Set the
 * `FASTIFY_METRICS_TEST_CLIENT` environment variable to change it.
 */
export const clientSelection = requested as TestClientSelection;

/** `true` when the run expects `@platformatic/prom-client` to be unavailable. */
export const expectNoPlatformatic =
  process.env['FASTIFY_METRICS_TEST_EXPECT_NO_PLATFORMATIC'] === '1';

/** The selected client; use it for registry cleanup. */
export const clientPromise = resolveClient(clientSelection);

/** Merges the selected client into plugin registration options. */
export function withClient(
  options: Partial<IMetricsPluginRegisterOptions> = {},
): Partial<IMetricsPluginRegisterOptions> {
  return { promClient: clientSelection, ...options };
}
