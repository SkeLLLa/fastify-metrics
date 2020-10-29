**[fastify-metrics](README.md)**

> Globals

# fastify-metrics

## Index

### Modules

* ["fastify"](modules/_fastify_.md)

### Interfaces

* [FastifyMetrics](interfaces/fastifymetrics.md)
* [MetricConfig](interfaces/metricconfig.md)
* [MetricsContextConfig](interfaces/metricscontextconfig.md)
* [PluginOptions](interfaces/pluginoptions.md)

### Variables

* [app](README.md#app)
* [fastifyPlugin](README.md#fastifyplugin)

### Functions

* [fastifyMetricsPlugin](README.md#fastifymetricsplugin)

## Variables

### app

• `Const` **app**: [FastifyInstance](interfaces/_fastify_.fastifyinstance.md)\<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance> & PromiseLike\<[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)\<Server, IncomingMessage, ServerResponse, FastifyLoggerInstance>> = fastify()

*Defined in [src/__tests__/metrics.spec.ts:4](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/__tests__/metrics.spec.ts#L4)*

*Defined in [src/__tests__/no_route_metrics.spec.ts:4](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/__tests__/no_route_metrics.spec.ts#L4)*

___

### fastifyPlugin

•  **fastifyPlugin**: FastifyPluginCallback\<[PluginOptions](interfaces/pluginoptions.md), Server>

*Defined in [src/__tests__/exports.spec.ts:1](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/__tests__/exports.spec.ts#L1)*

*Defined in [src/__tests__/metrics.spec.ts:1](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/__tests__/metrics.spec.ts#L1)*

*Defined in [src/__tests__/no_route_metrics.spec.ts:1](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/__tests__/no_route_metrics.spec.ts#L1)*

## Functions

### fastifyMetricsPlugin

▸ `Const`**fastifyMetricsPlugin**(`fastify`: [FastifyInstance](interfaces/_fastify_.fastifyinstance.md), `__namedParameters?`: { blacklist: undefined \| string \| RegExp \| string[] ; enableDefaultMetrics: boolean = true; enableRouteMetrics: boolean = true; endpoint: undefined \| string ; groupStatusCodes: boolean = false; metrics: Partial\<[MetricConfig](interfaces/metricconfig.md)> ; pluginName: string = "metrics"; prefix: undefined \| string ; register: undefined \| Registry  }): Promise\<void>

*Defined in [src/index.ts:44](https://github.com/SkeLLLa/fastify-metrics/blob/f16f34e/src/index.ts#L44)*

Fastify metrics plugin

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`fastify` | [FastifyInstance](interfaces/_fastify_.fastifyinstance.md) | - | Fastify instance asdfasdf asdf asdf  |
`__namedParameters` | { blacklist: undefined \| string \| RegExp \| string[] ; enableDefaultMetrics: boolean = true; enableRouteMetrics: boolean = true; endpoint: undefined \| string ; groupStatusCodes: boolean = false; metrics: Partial\<[MetricConfig](interfaces/metricconfig.md)> ; pluginName: string = "metrics"; prefix: undefined \| string ; register: undefined \| Registry  } | {} | - |

**Returns:** Promise\<void>
