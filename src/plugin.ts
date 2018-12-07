import promClient from 'prom-client';

export interface HTTPMetric {
  /**
   * Metric name
   */
  name?: string;
  /**
   * Metric description
   */
  help?: string;
  /**
   * Metric labels
   */
  labelNames?: Array<string>;
  /**
   * Histogram/Summary buckets
   */
  buckets?: Array<number>;
  /**
   * Prom-client registries
   */
  registers?: Array<promClient.Registry>;
}

export interface FastifyMetrics {
  /**
   * Prom-client
   */
  client: typeof promClient;
  /**
   * Additional objects to store your metrics, registries, etc.
   */
  [key: string]: any;
}

export interface PluginOptions {
  /**
   * Enable default nodejs metrics
   * @default true
   */
  enableDefaultMetrics?: boolean;
  /**
   * Groups status code labels by first digit 200 -> 2XX
   * @default false
   */
  groupStatusCodes?: boolean;
  /**
   * Plugin name that will be registered in fastify
   * @default metrics
   */
  pluginName?: string;
  /**
   * Metrics collection interval in ms
   * @default 5000
   */
  interval?: number;
  /**
   * Routes blacklist that will be excluded from metrics collection
   */
  blacklist?: RegExp | Array<string> | string;
  /**
   * Prom client registry for default metrics and route metrics
   */
  register?: promClient.Registry;
  /**
   * Metrics prefix
   */
  prefix?: string;
  /**
   * Metrics endpoint for Prometheus
   */
  endpoint?: string;
  /**
   * HTTP metrics overrides
   */
  metrics?: any;
}
