[fastify-metrics](README.md)

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

* [app](README.md#const-app)
* [fastifyPlugin](README.md#fastifyplugin)

### Functions

* [fastifyMetricsPlugin](README.md#const-fastifymetricsplugin)

## Variables

### `Const` app

• **app**: *[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)‹Server‹›, IncomingMessage‹›, ServerResponse‹›, FastifyLoggerInstance› & PromiseLike‹[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)‹Server‹›, IncomingMessage‹›, ServerResponse‹›, FastifyLoggerInstance››* = fastify()

*Defined in [src/__tests__/metrics.spec.ts:4](https://github.com/SkeLLLa/fastify-metrics/blob/d193ecd/src/__tests__/metrics.spec.ts#L4)*

___

###  fastifyPlugin

• **fastifyPlugin**: *FastifyPluginCallback‹[PluginOptions](interfaces/pluginoptions.md), Server‹››*

*Defined in [src/__tests__/exports.spec.ts:1](https://github.com/SkeLLLa/fastify-metrics/blob/d193ecd/src/__tests__/exports.spec.ts#L1)*

*Defined in [src/__tests__/metrics.spec.ts:1](https://github.com/SkeLLLa/fastify-metrics/blob/d193ecd/src/__tests__/metrics.spec.ts#L1)*

## Functions

### `Const` fastifyMetricsPlugin

▸ **fastifyMetricsPlugin**(`fastify`: [FastifyInstance](interfaces/_fastify_.fastifyinstance.md), `__namedParameters`: object): *Promise‹void›*

*Defined in [src/index.ts:44](https://github.com/SkeLLLa/fastify-metrics/blob/d193ecd/src/index.ts#L44)*

Fastify metrics plugin

**Parameters:**

▪ **fastify**: *[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)*

Fastify instance asdfasdf asdf asdf

▪`Default value`  **__namedParameters**: *object*= {}

Name | Type | Default |
------ | ------ | ------ |
`blacklist` | undefined &#124; string &#124; RegExp‹› &#124; string[] | - |
`enableDefaultMetrics` | boolean | true |
`enableRouteMetrics` | boolean | true |
`endpoint` | undefined &#124; string | - |
`groupStatusCodes` | boolean | false |
`metrics` | Partial‹[MetricConfig](interfaces/metricconfig.md)› | - |
`pluginName` | string | "metrics" |
`prefix` | undefined &#124; string | - |
`register` | undefined &#124; Registry‹› | - |

**Returns:** *Promise‹void›*
