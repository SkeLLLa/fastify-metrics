import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteOptions,
} from 'fastify';
import promClient, {
  Histogram,
  LabelValues,
  Registry,
  Summary,
} from 'prom-client';
import { IFastifyMetrics, IMetricsPluginOptions } from './types';
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
  hist: (labels?: LabelValues<T>) => number;
  sum: (labels?: LabelValues<T>) => void;
}

interface IRouteMetrics {
  routeHist: Histogram<string>;
  routeSum: Summary<string>;
  labelNames: { method: string; status: string; route: string };
}

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
};

/**
 * Fastify metrics handler class
 *
 * @public
 */
export class FastifyMetrics implements IFastifyMetrics {
  private static getRouteSlug(args: { method: string; url: string }): string {
    return `[${args.method}] ${args.url}`;
  }

  private readonly metricStorage = new WeakMap<
    FastifyRequest,
    IReqMetrics<string>
  >();
  private readonly routesWhitelist = new Set<string>();
  private readonly methodBlacklist = new Set<string>();

  private routeMetrics: IRouteMetrics;
  private readonly options: IMetricsPluginOptions;
  private readonly routeFallback: string;
  private readonly getRouteLabel: (request: FastifyRequest) => string;

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

    // Setup route label getter
    const defaultGetRouteLabel = (request: FastifyRequest): string =>
      request.routeOptions.config.statsId ??
      request.routeOptions.url ??
      this.routeFallback;
    this.getRouteLabel =
      this.options.routeMetrics.overrides?.labels?.getRouteLabel ??
      defaultGetRouteLabel;

    this.setMethodBlacklist();
    this.setRouteWhitelist();

    if (!(this.options.defaultMetrics.enabled === false)) {
      this.collectDefaultMetrics();
    }

    if (!(this.options.routeMetrics.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
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

  /** Populates routes whitelist if */
  private setRouteWhitelist(): void {
    if (
      this.options.routeMetrics.enabled === false ||
      this.options.routeMetrics.registeredRoutesOnly === false
    ) {
      return;
    }

    this.deps.fastify.addHook('onRoute', (routeOptions) => {
      // routeOptions.method;
      // routeOptions.schema;
      // routeOptions.url; // the complete URL of the route, it will include the prefix if any
      // routeOptions.path; // `url` alias
      // routeOptions.routePath; // the URL of the route without the prefix
      // routeOptions.prefix;

      if (
        this.options.routeMetrics.routeBlacklist?.includes(routeOptions.url)
      ) {
        return;
      }

      [routeOptions.method].flat().forEach((method) => {
        if (!this.methodBlacklist.has(method)) {
          this.routesWhitelist.add(
            FastifyMetrics.getRouteSlug({
              method,
              url: routeOptions.url,
            })
          );
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

    return defaultMetrics.enabled === false ||
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
      ...(routeMetrics.overrides?.histogram?.registers ?? []),
      ...(routeMetrics.overrides?.summary?.registers ?? []),
    ];
  }

  /** Register route to expose metrics */
  private exposeMetrics(): void {
    const globalRegistry = this.deps.client.register;
    const defaultRegistries = this.getCustomDefaultMetricsRegistries();
    const routeRegistries = this.getCustomRouteMetricsRegistries();

    const regisitriesToMerge = Array.from(
      new Set([globalRegistry, ...defaultRegistries, ...routeRegistries])
    );

    const routeHandler = async (_: FastifyRequest, reply: FastifyReply) => {
      if (regisitriesToMerge.length === 1) {
        const data = await regisitriesToMerge[0].metrics();
        return reply.type(regisitriesToMerge[0].contentType).send(data);
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
    if (typeof endpoint === 'string' || endpoint === undefined) {
      routeOptions = {
        url: endpoint ?? '/metrics',
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
      this.options.routeMetrics.customLabels ?? {}
    );

    const routeHist = new this.deps.client.Histogram<string>({
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
    const routeSum = new this.deps.client.Summary<string>({
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

  /** Collect per-route metrics */
  private collectRouteMetrics(): void {
    this.deps.fastify
      .addHook('onRequest', (request, _, done) => {
        if (
          request.routeOptions.config.disableMetrics === true ||
          !request.raw.url
        ) {
          return done();
        }

        if (this.options.routeMetrics.registeredRoutesOnly === false) {
          if (
            !this.methodBlacklist.has(
              request.routeOptions?.method ??
                request.routerMethod ??
                request.method
            )
          ) {
            this.metricStorage.set(request, {
              hist: this.routeMetrics.routeHist.startTimer(),
              sum: this.routeMetrics.routeSum.startTimer(),
            });
          }

          return done();
        }

        if (
          this.routesWhitelist.has(
            FastifyMetrics.getRouteSlug({
              method: request.method,
              url: request.routeOptions.url,
            })
          )
        ) {
          this.metricStorage.set(request, {
            hist: this.routeMetrics.routeHist.startTimer(),
            sum: this.routeMetrics.routeSum.startTimer(),
          });
        }

        return done();
      })
      .addHook('onResponse', (request, reply, done) => {
        const metrics = this.metricStorage.get(request);
        if (!metrics) {
          return done();
        }

        const statusCode =
          this.options.routeMetrics.groupStatusCodes === true
            ? `${Math.floor(reply.statusCode / 100)}xx`
            : reply.statusCode;
        const route = this.getRouteLabel(request);
        const method = request.method;

        const labels = {
          [this.routeMetrics.labelNames.method]: method,
          [this.routeMetrics.labelNames.route]: route,
          [this.routeMetrics.labelNames.status]: statusCode,
          ...this.collectCustomLabels(request, reply),
        };
        metrics.sum(labels);
        metrics.hist(labels);

        done();
      });
  }

  /** Get custom labels for route metrics */
  private collectCustomLabels(
    request: FastifyRequest,
    reply: FastifyReply
  ): Record<string, string> {
    const customLabels = this.options.routeMetrics.customLabels ?? {};
    const labels: Record<string, string> = {};
    for (const [labelName, labelValue] of Object.entries(customLabels)) {
      if (typeof labelValue === 'function') {
        labels[labelName] = labelValue(request, reply);
      } else {
        labels[labelName] = labelValue;
      }
    }
    return labels;
  }

  /**
   * Initialize metrics in registries. Useful if you call `registry.clear()` to
   * register metrics in regisitries once again
   */
  public initMetricsInRegistry(): void {
    if (!(this.options.defaultMetrics.enabled === false)) {
      this.collectDefaultMetrics();
    }
    if (!(this.options.routeMetrics.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
    }
  }
}
