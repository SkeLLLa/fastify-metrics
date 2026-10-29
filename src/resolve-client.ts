import defaultClient from '@prometheus-io/client';

/** Client selection accepted by the plugin `promClient` option. */
export type ClientSelection =
  | typeof defaultClient
  | null
  | 'auto'
  | 'prometheus-io'
  | 'platformatic';

/** Loads a module by specifier. Injectable to make resolution testable. */
export type ModuleImporter = (specifier: string) => Promise<unknown>;

const PLATFORMATIC_PACKAGE = '@platformatic/prom-client';
const FALLBACK_WARNING_CODE = 'FSTMETRICS_CLIENT_FALLBACK';

const defaultImporter: ModuleImporter = (specifier) => import(specifier);

/** Checks that a module looks like a prom-client compatible implementation. */
function isCompatibleClient(
  candidate: unknown,
): candidate is typeof defaultClient {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }
  const c = candidate as {
    Histogram?: unknown;
    Summary?: unknown;
    Registry?: unknown;
    collectDefaultMetrics?: unknown;
    register?: unknown;
  };
  return (
    typeof c.Histogram === 'function' &&
    typeof c.Summary === 'function' &&
    typeof c.Registry === 'function' &&
    typeof c.collectDefaultMetrics === 'function' &&
    typeof c.register === 'object' &&
    c.register !== null
  );
}

/**
 * Tells whether the error means that the optional package itself is not
 * installed. Node reports `ERR_MODULE_NOT_FOUND` (ESM) or `MODULE_NOT_FOUND`
 * (CJS) with a message starting `Cannot find package|module '<name>'`. A
 * missing dependency of the package reports the same code but names that
 * dependency (or a file inside the package), so the name must match exactly.
 */
function isPackageNotInstalled(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const { code, message } = error as { code?: unknown; message?: unknown };
  if (code !== 'ERR_MODULE_NOT_FOUND' && code !== 'MODULE_NOT_FOUND') {
    return false;
  }
  if (typeof message !== 'string') {
    return false;
  }
  const match = /^Cannot find (?:package|module) '([^']+)'/.exec(message);
  return match?.[1] === PLATFORMATIC_PACKAGE;
}

/** Loads `@platformatic/prom-client`, validating its shape. */
async function loadPlatformatic(
  importer: ModuleImporter,
): Promise<typeof defaultClient> {
  const mod = (await importer(PLATFORMATIC_PACKAGE)) as
    | { default?: unknown }
    | null
    | undefined;
  const candidate = mod?.default;
  if (!isCompatibleClient(candidate)) {
    throw new TypeError(
      `${PLATFORMATIC_PACKAGE} does not expose a prom-client compatible API`,
    );
  }
  return candidate;
}

/**
 * Resolves the prometheus client implementation to use.
 *
 * - client object: used as-is, without validation
 * - `'prometheus-io'`: always `@prometheus-io/client`
 * - `'platformatic'`: `@platformatic/prom-client`, throws if unusable
 * - `null`, `undefined`, `'auto'`: prefers `@platformatic/prom-client` if it is
 *   installed and usable (better performance), otherwise falls back to
 *   `@prometheus-io/client`. A missing package falls back silently; any other
 *   failure falls back with a process warning.
 *
 * @internal
 */
export async function resolveClient(
  selection: ClientSelection | undefined = 'auto',
  importer: ModuleImporter = defaultImporter,
): Promise<typeof defaultClient> {
  if (typeof selection === 'object' && selection !== null) {
    return selection;
  }
  if (selection === 'prometheus-io') {
    return defaultClient;
  }
  if (selection === 'platformatic') {
    try {
      return await loadPlatformatic(importer);
    } catch (error) {
      throw new Error(
        `fastify-metrics: promClient 'platformatic' was requested but ${PLATFORMATIC_PACKAGE} is unavailable or incompatible`,
        { cause: error },
      );
    }
  }

  try {
    return await loadPlatformatic(importer);
  } catch (error) {
    if (!isPackageNotInstalled(error)) {
      const reason = error instanceof Error ? error.message : String(error);
      process.emitWarning(
        `fastify-metrics: ${PLATFORMATIC_PACKAGE} could not be used, falling back to @prometheus-io/client: ${reason}`,
        { code: FALLBACK_WARNING_CODE },
      );
    }
    return defaultClient;
  }
}
