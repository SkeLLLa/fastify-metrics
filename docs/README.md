> **[fastify-metrics](README.md)**

### Index

#### Modules

* ["fastify"](modules/_fastify_.md)

#### Interfaces

* [FastifyMetrics](interfaces/fastifymetrics.md)
* [HTTPMetric](interfaces/httpmetric.md)
* [PluginOptions](interfaces/pluginoptions.md)

#### Functions

* [fastifyMetricsPlugin](README.md#const-fastifymetricsplugin)

## Functions

### `Const` fastifyMetricsPlugin

▸ **fastifyMetricsPlugin**(`fastify`: `FastifyInstance`, `__namedParameters`: object, `next`: `fastifyPlugin.nextCallback`): *void*

Defined in index.ts:52

Fastify metrics plugin

**Parameters:**

▪ **fastify**: *`FastifyInstance`*

▪`Default value`  **__namedParameters**: *object*=  {}

Name | Type | Default |
------ | ------ | ------ |
`blacklist` | undefined \| string \| `RegExp` \| string[] | - |
`enableDefaultMetrics` | boolean | true |
`endpoint` | undefined \| string | - |
`groupStatusCodes` | boolean | false |
`interval` | number | 5000 |
`metrics` | any | - |
`pluginName` | string | "metrics" |
`prefix` | undefined \| string | - |
`register` | undefined \| `Registry` | - |

▪ **next**: *`fastifyPlugin.nextCallback`*

**Returns:** *void*