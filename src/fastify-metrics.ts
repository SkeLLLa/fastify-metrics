import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteOptions,
} from 'fastify';
import promClient, {
  type Histogram,
  type LabelValues,
  type Registry,
  type Summary,
} from 'prom-client';
import type { IFastifyMetrics, IMetricsPluginOptions } from './types';

/**
 * Plugin constructor
 *
 * @public
 */
interface IConstructiorDeps {
  /** Prometheus client */
  client: typeof promClient;
  /** Fastify instance */
  fastify: FastifyInstance;
  /** Metric plugin options */
  options: Partial<IMetricsPluginOptions>;
}

interface IReqMetrics<T extends string> {
  hist?: (labels?: LabelValues<T>) => number;
  sum?: (labels?: LabelValues<T>) => void;
}

interface IRouteMetrics {
  routeHist: Histogram;
  routeSum: Summary;
  labelNames: { method: string; status: string; route: string };
}

const STATUS_GROUPS = ['', '1xx', '2xx', '3xx', '4xx', '5xx'] as const;

export const DEFAULT_OPTIONS: IMetricsPluginOptions = {
  name: 'metrics',
  endpoint: '/metrics',
  clearRegisterOnInit: false,
  routeMetrics: {
    enabled: true,
  },
  defaultMetrics: {
    enabled: true,
  },
  promClient: null,
};

/**
 * Fastify metrics handler class
 *
 * @public
 */
export class FastifyMetrics implements IFastifyMetrics {
  private readonly metricStorage = new WeakMap<
    FastifyRequest,
    IReqMetrics<string>
  >();
  private readonly routesWhitelist = new Map<string, Set<string>>();
  private readonly methodBlacklist = new Set<string>();

  private routeMetrics?: IRouteMetrics;
  private readonly options: IMetricsPluginOptions;
  private readonly routeFallback: string;
  private readonly getRouteLabel: (request: FastifyRequest) => string;

  private readonly registeredRoutesOnly: boolean;
  private readonly groupStatusCodes: boolean;
  private readonly hasCustomLabels: boolean;
  private readonly customLabelEntries: readonly [
    string,
    string | ((request: FastifyRequest, reply: FastifyReply) => string),
  ][];

  private createTimers: (request: FastifyRequest) => void;

  /** Prom-client instance. */
  public readonly client: typeof promClient;

  /** Creates metrics collector instance */
  constructor(private readonly deps: IConstructiorDeps) {
    this.client = this.deps.client;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...deps.options,
    };
    this.routeFallback =
      this.options.routeMetrics.invalidRouteGroup ?? '__unknown__';

    this.registeredRoutesOnly =
      this.options.routeMetrics.registeredRoutesOnly !== false;
    this.groupStatusCodes = this.options.routeMetrics.groupStatusCodes === true;

    const customLabels = this.options.routeMetrics.customLabels;
    this.customLabelEntries = customLabels ? Object.entries(customLabels) : [];
    this.hasCustomLabels = this.customLabelEntries.length > 0;

    // Setup route label getter
    const defaultGetRouteLabel = (request: FastifyRequest): string =>
      request.routeOptions.config.statsId ??
      request.routeOptions.url ??
      this.routeFallback;
    this.getRouteLabel =
      this.options.routeMetrics.overrides?.labels?.getRouteLabel ??
      defaultGetRouteLabel;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.createTimers = () => {};

    this.setMethodBlacklist();
    this.setRouteWhitelist();

    if (this.options.defaultMetrics.enabled) {
      this.collectDefaultMetrics();
    }

    if (!(this.options.routeMetrics.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
      this.buildTimerStrategy();
      this.collectRouteMetrics();
    }

    this.exposeMetrics();
  }

  /** Populates methods blacklist to exclude them from metrics collection */
  private setMethodBlacklist(): void {
    if (this.options.routeMetrics.enabled === false) {
      return;
    }

    (
      this.options.routeMetrics.methodBlacklist ?? [
        'HEAD',
        'OPTIONS',
        'TRACE',
        'CONNECT',
      ]
    )
      .map((v) => v.toUpperCase())
      .forEach((v) => this.methodBlacklist.add(v));
  }

  /** Populates routes whitelist */
  private setRouteWhitelist(): void {
    if (
      this.options.routeMetrics.enabled === false ||
      this.options.routeMetrics.registeredRoutesOnly === false
    ) {
      return;
    }

    this.deps.fastify.addHook('onRoute', (routeOptions) => {
      const isRouteBlacklisted = this.options.routeMetrics.routeBlacklist?.some(
        (pattern) =>
          typeof pattern === 'string'
            ? pattern === routeOptions.url
            : pattern.test(routeOptions.url),
      );
      if (isRouteBlacklisted) {
        return;
      }

      [routeOptions.method].flat().forEach((method) => {
        if (!this.methodBlacklist.has(method)) {
          let urlSet = this.routesWhitelist.get(method);
          if (!urlSet) {
            urlSet = new Set<string>();
            this.routesWhitelist.set(method, urlSet);
          }
          urlSet.add(routeOptions.url);
        }
      });
    });
  }

  /**
   * Get default metrics registry
   *
   * @returns Default metrics registry
   */
  private getCustomDefaultMetricsRegistries(): Registry[] {
    const { defaultMetrics } = this.options;

    return !defaultMetrics.enabled ||
      defaultMetrics.register === undefined ||
      defaultMetrics.register === this.deps.client.register
      ? []
      : [defaultMetrics.register];
  }

  /**
   * Get route metrics registry
   *
   * @returns Route metrics registry
   */
  private getCustomRouteMetricsRegistries(): Registry[] {
    const { routeMetrics } = this.options;
    if (routeMetrics.enabled === false) {
      return [];
    }
    return [
      ...((routeMetrics.overrides?.histogram?.registers ?? []) as Registry[]),
      ...((routeMetrics.overrides?.summary?.registers ?? []) as Registry[]),
    ];
  }

  /** Register route to expose metrics */
  private exposeMetrics(): void {
    const globalRegistry = this.deps.client.register;
    const defaultRegistries = this.getCustomDefaultMetricsRegistries();
    const routeRegistries = this.getCustomRouteMetricsRegistries();

    const regisitriesToMerge = Array.from(
      new Set([globalRegistry, ...defaultRegistries, ...routeRegistries]),
    );

    const routeHandler = async (_: FastifyRequest, reply: FastifyReply) => {
      const [singleRegistry] = regisitriesToMerge;
      if (regisitriesToMerge.length === 1 && singleRegistry) {
        const data = await singleRegistry.metrics();
        return reply.type(singleRegistry.contentType).send(data);
      }
      // WARN: Looses default labels
      const merged = this.deps.client.Registry.merge(regisitriesToMerge);

      const data = await merged.metrics();
      return reply.type(merged.contentType).send(data);
    };
    let routeOptions: RouteOptions;
    const { endpoint } = this.options;
    if (endpoint === null) {
      return;
    }
    if (typeof endpoint === 'string') {
      routeOptions = {
        url: endpoint,
        method: 'GET',
        logLevel: 'fatal',
        exposeHeadRoute: false,
        handler: routeHandler,
      };
    } else {
      // endpoint is of type RouteOptions
      routeOptions = endpoint;
      // do not override the method
      routeOptions.method = 'GET';
      routeOptions.handler = routeHandler;
    }
    // Add route
    this.deps.fastify.route(routeOptions);
  }

  /** Collect default prom-client metrics */
  private collectDefaultMetrics(): void {
    this.deps.client.collectDefaultMetrics({
      ...this.options.defaultMetrics,
    });
  }

  private registerRouteMetrics(): IRouteMetrics {
    const labelNames = {
      method: this.options.routeMetrics.overrides?.labels?.method ?? 'method',
      status:
        this.options.routeMetrics.overrides?.labels?.status ?? 'status_code',
      route: this.options.routeMetrics.overrides?.labels?.route ?? 'route',
    };

    const customLabelNames: string[] = Object.keys(
      this.options.routeMetrics.customLabels ?? {},
    );

    const routeHist = new this.deps.client.Histogram({
      ...this.options.routeMetrics.overrides?.histogram,
      name:
        this.options.routeMetrics.overrides?.histogram?.name ??
        'http_request_duration_seconds',
      help:
        this.options.routeMetrics.overrides?.histogram?.help ??
        'request duration in seconds',
      labelNames: [
        labelNames.method,
        labelNames.route,
        labelNames.status,
        ...customLabelNames,
      ] as const,
    });
    const routeSum = new this.deps.client.Summary({
      ...this.options.routeMetrics.overrides?.summary,
      name:
        this.options.routeMetrics.overrides?.summary?.name ??
        'http_request_summary_seconds',
      help:
        this.options.routeMetrics.overrides?.summary?.help ??
        'request duration in seconds summary',
      labelNames: [
        labelNames.method,
        labelNames.route,
        labelNames.status,
        ...customLabelNames,
      ] as const,
    });

    return { routeHist, routeSum, labelNames };
  }

  /**
   * Build a pre-computed timer strategy function based on enabled configuration.
   */
  private buildTimerStrategy(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const routeMetrics = this.routeMetrics!;
    const enabled = this.options.routeMetrics.enabled;

    if (enabled instanceof Object) {
      const useHist = enabled.histogram !== false;
      const useSum = enabled.summary !== false;

      if (useHist && useSum) {
        this.createTimers = (request) => {
          this.metricStorage.set(request, {
            hist: routeMetrics.routeHist.startTimer(),
            sum: routeMetrics.routeSum.startTimer(),
          });
        };
      } else if (useHist) {
        this.createTimers = (request) => {
          this.metricStorage.set(request, {
            hist: routeMetrics.routeHist.startTimer(),
          });
        };
      } else if (useSum) {
        this.createTimers = (request) => {
          this.metricStorage.set(request, {
            sum: routeMetrics.routeSum.startTimer(),
          });
        };
      } else {
        this.createTimers = (request) => {
          this.metricStorage.set(request, {});
        };
      }
    } else {
      this.createTimers = (request) => {
        this.metricStorage.set(request, {
          hist: routeMetrics.routeHist.startTimer(),
          sum: routeMetrics.routeSum.startTimer(),
        });
      };
    }
  }

  /** Check if route is in whitelist */
  private isRouteWhitelisted(method: string, url: string): boolean {
    return this.routesWhitelist.get(method)?.has(url) ?? false;
  }

  /** Collect per-route metrics */
  private collectRouteMetrics(): void {
    if (this.routeMetrics === undefined) {
      return;
    }

    // Cache label name keys in closure scope
    const methodKey = this.routeMetrics.labelNames.method;
    const routeKey = this.routeMetrics.labelNames.route;
    const statusKey = this.routeMetrics.labelNames.status;

    this.deps.fastify
      .addHook('onRequest', (request, _, done) => {
        if (
          request.routeOptions.config.disableMetrics === true ||
          !request.raw.url
        ) {
          done();
          return;
        }

        if (!this.registeredRoutesOnly) {
          if (!this.methodBlacklist.has(request.method)) {
            this.createTimers(request);
          }

          done();
          return;
        }

        if (
          this.isRouteWhitelisted(
            request.method,
            request.routeOptions.url ?? request.url,
          )
        ) {
          this.createTimers(request);
        }

        done();
      })
      .addHook('onResponse', (request, reply, done) => {
        const metrics = this.metricStorage.get(request);
        if (!metrics) {
          done();
          return;
        }

        const statusCode = this.groupStatusCodes
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            STATUS_GROUPS[Math.floor(reply.statusCode / 100)]!
          : reply.statusCode;
        const route = this.getRouteLabel(request);
        const method = request.method;

        const labels: Record<string, string | number> = {
          [methodKey]: method,
          [routeKey]: route,
          [statusKey]: statusCode,
        };

        if (this.hasCustomLabels) {
          for (const [labelName, labelValue] of this.customLabelEntries) {
            labels[labelName] =
              typeof labelValue === 'function'
                ? labelValue(request, reply)
                : labelValue;
          }
        }

        if (metrics.hist) metrics.hist(labels);
        if (metrics.sum) metrics.sum(labels);

        done();
      });
  }

  /**
   * Initialize metrics in registries. Useful if you call `registry.clear()` to
   * register metrics in regisitries once again
   */
  public initMetricsInRegistry(): void {
    if (this.options.defaultMetrics.enabled) {
      this.collectDefaultMetrics();
    }
    if (!(this.options.routeMetrics.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
    }
  }
}
