import defaultClient from 'prom-client';

/**
 * Resolves the prom-client implementation to use.
 * Prefers `@platformatic/prom-client` if installed (better performance),
 * falls back to `prom-client`.
 * @internal
 */
export async function resolveClient(): Promise<typeof defaultClient> {
  try {
    const pkg = '@platformatic/prom-client';
    const mod = (await import(pkg)) as { default?: typeof defaultClient };
    return mod.default ?? defaultClient;
  } catch {
    return defaultClient;
  }
}
