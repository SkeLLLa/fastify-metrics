
#  fastify-metrics

## Index

### Modules

* ["fastify"](modules/_fastify_.md)
* ["http"](modules/_http_.md)

### Interfaces

* [FastifyMetrics](interfaces/fastifymetrics.md)
* [HTTPMetric](interfaces/httpmetric.md)
* [PluginOptions](interfaces/pluginoptions.md)

### Functions

* [fastifyMetricsPlugin](#fastifymetricsplugin)

---

## Functions

<a id="fastifymetricsplugin"></a>

### `<Const>` fastifyMetricsPlugin

▸ **fastifyMetricsPlugin**(fastify: *`FastifyInstance`*, __namedParameters?: *`object`*, next: *`fastifyPlugin.nextCallback`*): `void`

*Defined in index.ts:38*

**Parameters:**

**fastify: `FastifyInstance`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| blacklist |  `undefined` &#124; `string` &#124; `RegExp` &#124; `string`[]| - |
| enableDefaultMetrics | `boolean` | true |
| endpoint |  `undefined` &#124; `string`| - |
| groupStatusCodes | `boolean` | false |
| interval | `number` | 5000 |
| metrics | `any` | - |
| pluginName | `string` | &quot;metrics&quot; |
| prefix |  `undefined` &#124; `string`| - |
| register |  `undefined` &#124; `Registry`| - |

**next: `fastifyPlugin.nextCallback`**

**Returns:** `void`

___

