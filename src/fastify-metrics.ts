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
  options: IMetricsPluginOptions;
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

  /** Prom-client instance. */
  public readonly client: typeof promClient;

  /** Creates metrics collector instance */
  constructor(private readonly deps: IConstructiorDeps) {
    this.client = this.deps.client;

    this.setMethodBlacklist();
    this.setRouteWhitelist();

    if (!(this.deps.options.defaultMetrics?.enabled === false)) {
      this.collectDefaultMetrics();
    }

    if (!(this.deps.options.routeMetrics?.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
      this.collectRouteMetrics();
    }

    this.exposeMetrics();
  }
  /** Populates methods blacklist to exclude them from metrics collection */
  private setMethodBlacklist(): void {
    if (this.deps.options.routeMetrics?.enabled === false) {
      return;
    }

    (
      this.deps.options.routeMetrics?.methodBlacklist ?? [
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
      this.deps.options.routeMetrics?.enabled === false ||
      this.deps.options.routeMetrics?.registeredRoutesOnly === false
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
        this.deps.options.routeMetrics?.routeBlacklist?.includes(
          routeOptions.url
        )
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
    const { defaultMetrics } = this.deps.options;

    return defaultMetrics?.enabled === false ||
      defaultMetrics?.register === undefined ||
      defaultMetrics?.register === this.deps.client.register
      ? []
      : [defaultMetrics.register];
  }

  /**
   * Get route metrics registry
   *
   * @returns Route metrics registry
   */
  private getCustomRouteMetricsRegistries(): Registry[] {
    const { routeMetrics } = this.deps.options;
    if (routeMetrics?.enabled === false) {
      return [];
    }
    return [
      ...(routeMetrics?.overrides?.histogram?.registers ?? []),
      ...(routeMetrics?.overrides?.summary?.registers ?? []),
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
    const { endpoint } = this.deps.options;
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
      ...this.deps.options.defaultMetrics,
    });
  }

  private registerRouteMetrics(): IRouteMetrics {
    const labelNames = {
      method:
        this.deps.options.routeMetrics?.overrides?.labels?.method ?? 'method',
      status:
        this.deps.options.routeMetrics?.overrides?.labels?.status ??
        'status_code',
      route:
        this.deps.options.routeMetrics?.overrides?.labels?.route ?? 'route',
    };

    const routeHist = new this.deps.client.Histogram<string>({
      ...this.deps.options.routeMetrics?.overrides?.histogram,
      name:
        this.deps.options.routeMetrics?.overrides?.histogram?.name ??
        'http_request_duration_seconds',
      help:
        this.deps.options.routeMetrics?.overrides?.histogram?.help ??
        'request duration in seconds',
      labelNames: [
        labelNames.method,
        labelNames.route,
        labelNames.status,
      ] as const,
    });
    const routeSum = new this.deps.client.Summary<string>({
      ...this.deps.options.routeMetrics?.overrides?.summary,
      name:
        this.deps.options.routeMetrics?.overrides?.summary?.name ??
        'http_request_summary_seconds',
      help:
        this.deps.options.routeMetrics?.overrides?.summary?.help ??
        'request duration in seconds summary',
      labelNames: [
        labelNames.method,
        labelNames.route,
        labelNames.status,
      ] as const,
    });

    return { routeHist, routeSum, labelNames };
  }

  /** Collect per-route metrics */
  private collectRouteMetrics(): void {
    const { routeHist, routeSum, labelNames } = this.routeMetrics;

    this.deps.fastify
      .addHook('onRequest', (request, _, done) => {
        if (
          request.context.config.disableMetrics === true ||
          !request.raw.url
        ) {
          done();
          return;
        }

        if (this.deps.options.routeMetrics?.registeredRoutesOnly === false) {
          if (
            !this.methodBlacklist.has(request.routerMethod ?? request.method)
          ) {
            this.metricStorage.set(request, {
              hist: routeHist.startTimer(),
              sum: routeSum.startTimer(),
            });
          }

          done();
          return;
        }

        if (
          this.routesWhitelist.has(
            FastifyMetrics.getRouteSlug({
              method: request.routerMethod,
              url: request.routerPath,
            })
          )
        ) {
          this.metricStorage.set(request, {
            hist: routeHist.startTimer(),
            sum: routeSum.startTimer(),
          });
        }

        done();
        return;
      })
      .addHook('onResponse', (request, reply, done) => {
        const metrics = this.metricStorage.get(request);
        if (!metrics) {
          done();
          return;
        }

        const statusCode =
          this.deps.options.routeMetrics?.groupStatusCodes === true
            ? `${Math.floor(reply.statusCode / 100)}xx`
            : reply.statusCode;
        const route =
          request.context.config.statsId ??
          request.routerPath ??
          this.deps.options.routeMetrics?.invalidRouteGroup ??
          '__unknown__';
        const method = request.routerMethod ?? request.method;

        const labels = {
          [labelNames.method]: method,
          [labelNames.route]: route,
          [labelNames.status]: statusCode,
        };
        metrics.sum(labels);
        metrics.hist(labels);

        done();
      });
  }

  /**
   * Initialize metrics in registries. Useful if you call `registry.clear()` to
   * register metrics in regisitries once again
   */
  public initMetricsInRegistry(): void {
    if (!(this.deps.options.defaultMetrics?.enabled === false)) {
      this.collectDefaultMetrics();
    }
    if (!(this.deps.options.routeMetrics?.enabled === false)) {
      this.routeMetrics = this.registerRouteMetrics();
    }
  }
}
