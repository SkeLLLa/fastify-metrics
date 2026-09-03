import defaultClient from '@prometheus-io/client';

/**
 * Resolves the prometheus client implementation to use.
 * Prefers `@platformatic/prom-client` if installed (better performance),
 * falls back to `@prometheus-io/client`.
 * @internal
 */
export async function resolveClient(): Promise<typeof defaultClient> {
  try {
    const pkg = '@platformatic/prom-client';
    const mod = (await import(pkg)) as { default: typeof defaultClient };
    return mod.default;
  } catch {
    return defaultClient;
  }
}
