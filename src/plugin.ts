// import promClient from 'prom-client';
import promClient, {
  HistogramConfiguration,
  SummaryConfiguration,
} from 'prom-client';

export interface MetricsContextConfig {
  url?: string;
  statsId?: string;
}

export interface MetricConfig {
  /**
   * Histogram config
   */
  histogram: HistogramConfiguration<string>;
  /**
   * Summary config
   */
  summary: SummaryConfiguration<string>;
}

export interface FastifyMetrics {
  /**
   * Prom-client
   */
  client: typeof promClient;
  /**
   * Expose register clear function if register was provided
   */
  clearRegister(): void;
  /**
   * Additional objects to store your metrics, registries, etc.
   */
  [key: string]: unknown;
}

export interface PluginOptions {
  /**
   * Enable default prom-client metrics
   * @default true
   */
  enableDefaultMetrics?: boolean;
  /**
   * Enable fastify route metrics
   * @default true
   */
  enableRouteMetrics?: boolean;
  /**
   * Groups status code labels by first digit 200 -> 2XX
   * @default false
   */
  groupStatusCodes?: boolean;
  /**
   * Groups urls that are not mapped onto valid routes together
   */
  invalidRouteGroup?: string;
  /**
   * Plugin name that will be registered in fastify
   * @default metrics
   */
  pluginName?: string;
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
  metrics?: Partial<MetricConfig>;
  /**
   * Label Overrides
   */
  labelOverrides?: {
    method?: string;
    route?: string;
    status?: string;
  };
}
