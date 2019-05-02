
#  fastify-metrics

## Index

### Modules

* ["fastify"](modules/_fastify_.md)

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

*Defined in index.ts:50*

Fastify metrics plugin

**Parameters:**

**fastify: `FastifyInstance`**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| blacklist | `undefined` \| `string` \| `RegExp` \| `string`[] | - |
| enableDefaultMetrics | `boolean` | true |
| endpoint | `undefined` \| `string` | - |
| groupStatusCodes | `boolean` | false |
| interval | `number` | 5000 |
| metrics | `any` | - |
| pluginName | `string` | &quot;metrics&quot; |
| prefix | `undefined` \| `string` | - |
| register | `undefined` \| `Registry` | - |

**next: `fastifyPlugin.nextCallback`**

**Returns:** `void`

___

