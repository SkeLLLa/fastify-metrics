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

• **app**: *[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)‹Server‹›, IncomingMessage‹›, ServerResponse‹›, FastifyLoggerOptions‹Server‹›, IncomingMessage‹›, ServerResponse‹›››* = fastify()

Defined in __tests__/metrics.spec.ts:4

___

###  fastifyPlugin

• **fastifyPlugin**: *FastifyPlugin‹[PluginOptions](interfaces/pluginoptions.md)›*

Defined in __tests__/exports.spec.ts:2

Defined in __tests__/metrics.spec.ts:1

## Functions

### `Const` fastifyMetricsPlugin

▸ **fastifyMetricsPlugin**(`fastify`: [FastifyInstance](interfaces/_fastify_.fastifyinstance.md), `__namedParameters`: object): *Promise‹void›*

Defined in index.ts:45

Fastify metrics plugin

**Parameters:**

▪ **fastify**: *[FastifyInstance](interfaces/_fastify_.fastifyinstance.md)*

Fastify instance asdfasdf asdf asdf

▪`Default value`  **__namedParameters**: *object*= {}

Name | Type | Default |
------ | ------ | ------ |
`blacklist` | undefined &#124; string &#124; RegExp‹› &#124; string[] | - |
`enableDefaultMetrics` | boolean | true |
`endpoint` | undefined &#124; string | - |
`groupStatusCodes` | boolean | false |
`metrics` | object | - |
`pluginName` | string | "metrics" |
`prefix` | undefined &#124; string | - |
`register` | undefined &#124; Registry‹› | - |

**Returns:** *Promise‹void›*
