import type {
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
  RouteOptions,
} from 'fastify';
import type {
  DefaultMetricsCollectorConfiguration,
  HistogramConfiguration,
  SummaryConfiguration,
} from 'prom-client';
import type client from 'prom-client';

/**
 * Route config for metrics
 *
 * @public
 */
export interface IMetricsRouteContextConfig {
  /** Override route definition */
  statsId?: string;
  /** Disables metric collection on this route */
  disableMetrics?: boolean;
}

/**
 * Default prom-client metrics config
 *
 * @remarks
 * Extends the
 * {@link https://github.com/siimon/prom-client#default-metrics | prom-client}
 * interface. So it accepts all options from it and pass to default metrics.
 * @public
 * @see {@link https://github.com/siimon/prom-client#default-metrics | prom-client} for extra options
 */
export interface IDefaultMetricsConfig
  extends DefaultMetricsCollectorConfiguration<'text/plain; version=0.0.4; charset=utf-8'> {
  /**
   * Enables collection of default prom-client metrics (e.g. node.js vitals like
   * cpu, memory, etc.)
   *
   * @defaultValue `true`
   */
  enabled: boolean;
}

/**
 * Request time summary config overrides
 *
 * @public
 */
export interface ISummaryOverrides
  extends Partial<SummaryConfiguration<string>> {
  /**
   * Request duration summary name override
   *
   * @defaultValue `http_request_summary_seconds`
   */
  name?: string;
  /**
   * Request duration summary help override
   *
   * @defaultValue `request duration in seconds summary`
   */
  help?: string;
  /**
   * Request duration percentiles override
   *
   * @defaultValue `[0.5, 0.9, 0.95, 0.99]`
   */
  percentiles?: number[];
}

/** @public Request time histofram config overrides */
export interface IHistogramOverrides
  extends Partial<HistogramConfiguration<string>> {
  /**
   * Request duration histogram name override
   *
   * @defaultValue `http_request_duration_seconds`
   */
  name?: string;
  /**
   * Request duration histogram help override
   *
   * @defaultValue `request duration in seconds`
   */
  help?: string;
  /**
   * Request duration buckets override
   *
   * @defaultValue `[0.05, 0.1, 0.5, 1, 3, 5, 10]`
   */
  buckets?: number[];
}

/**
 * Label Overrides
 *
 * @public
 */
export interface IRouteLabelsOverrides {
  /**
   * Function that will return route value for metrics label. By default will
   * use: `request.routeConfig.statsId ?? request.routerPath`
   *
   * @example To use route full url as label:
   *
   * ```ts
   * getRouteLabel: (request) => request.raw.url;
   * ```
   *
   * @defaultValue `undefined`
   */
  getRouteLabel?: (request: FastifyRequest) => string;

  /**
   * Method name
   *
   * @defaultValue `method`
   */
  method?: string;
  /**
   * Route name
   *
   * @defaultValue `route`
   */
  route?: string;
  /**
   * Status code
   *
   * @defaultValue `status_code`
   */
  status?: string;
}

/**
 * Route metrics overrides.
 *
 * @public
 */
export interface IRouteMetricsOverrides {
  /** Label Overrides */
  labels?: IRouteLabelsOverrides;

  /** Histogram overrides */
  histogram?: IHistogramOverrides;

  /** Summary overrides */
  summary?: ISummaryOverrides;
}

/**
 * Route metrics configuration
 *
 * @public
 */
export interface IRouteMetricsConfig {
  enabled?:
    | boolean
    | {
        /**
         * Enables collection of fastify routes metrics response time via
         * histogram.
         *
         * @defaultValue `true`
         */
        histogram?: boolean;
        /**
         * Enables collection of fastify routes metrics response time via
         * summary.
         *
         * @defaultValue `true`
         */
        summary?: boolean;
      };

  /**
   * Collect metrics only for registered routes. If `false`, then metrics for
   * unknown routes `/unknown-unregistered-route` will be collected as well.
   *
   * @defaultValue `true`
   */
  registeredRoutesOnly?: boolean;

  /**
   * Groups status code labels by first digit 200 becomes 2XX in metrics.
   *
   * @defaultValue `false`
   */
  groupStatusCodes?: boolean;

  /**
   * A list of routes that will be excluded from metrics collection.
   *
   * @defaultValue `undefined`
   */
  routeBlacklist?: readonly (string | RegExp)[];

  /**
   * A list of HTTP methods that will be excluded from metrics collection
   *
   * @defaultValue `['HEAD', 'OPTIONS', 'TRACE', 'CONNECT']`
   */
  methodBlacklist?: readonly HTTPMethods[];

  /**
   * Unknown route label. If registeredRoutesOnly routes set to `false` unknown
   * routes will have following url.
   *
   * @defaultValue `__unknown__`
   */
  invalidRouteGroup?: string;

  /**
   * Custom labels to add to metrics
   *
   * @example
   *
   * ```ts
   * customLabels: {
   *  myLabel: 'my-value',
   *  myLabel2: (request, reply) => request.headers['x-my-header'],
   * }
   * ```
   *
   * @defaultValue `undefined`
   */
  customLabels?: Record<
    string,
    string | ((request: FastifyRequest, reply: FastifyReply) => string)
  >;

  /** Metric configuration overrides */
  overrides?: IRouteMetricsOverrides;
}

/**
 * Metrics plugin config
 *
 * @public
 */
export interface IMetricsPluginOptions {
  /**
   * PromClient instance to override default internal promClient
   *
   * @defaultValue promClient
   */
  promClient: typeof client | null;

  /**
   * Endpoint to expose metrics in prometheus format. `null` - disables metrics
   * exposure
   *
   * @defaultValue `/metrics`
   */
  endpoint: string | null | RouteOptions;

  /**
   * Plugin name that will be registered in fastify instance.
   *
   * @defaultValue `metrics`
   */
  name: string;

  /**
   * Default prom-client metrics config. Collect prometheus recommended and
   * node.js specific metrics like event loop lag.
   *
   * @defaultValue `{ enabled: true }`
   */
  defaultMetrics: IDefaultMetricsConfig;

  /**
   * Per route metrics config. Collect response time metric on requests
   *
   * @defaultValue `{ enabled: true }`
   */
  routeMetrics: IRouteMetricsConfig;

  /**
   * Clears the prom-client global registry before adding metrics. Default to
   * `false`
   *
   * @defaultValue `false`
   */
  clearRegisterOnInit: boolean;
}

/**
 * Plugin decorator
 *
 * @public
 */
export interface IFastifyMetrics {
  /** Prom-client instance */
  client: typeof client;
  /**
   * Initialize metrics in registries. Useful if you call `registry.clear()` to
   * register metrics in regisitries once again
   */
  initMetricsInRegistry(): void;
}
