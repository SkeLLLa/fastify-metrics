**[Fastify metrics - v7.0.0](../README.md)**

> [Globals](../README.md) / [plugin](../modules/plugin.md) / PluginOptions

# Interface: PluginOptions

## Hierarchy

* **PluginOptions**

## Index

### Properties

* [blacklist](plugin.pluginoptions.md#blacklist)
* [enableDefaultMetrics](plugin.pluginoptions.md#enabledefaultmetrics)
* [enableRouteMetrics](plugin.pluginoptions.md#enableroutemetrics)
* [endpoint](plugin.pluginoptions.md#endpoint)
* [groupStatusCodes](plugin.pluginoptions.md#groupstatuscodes)
* [invalidRouteGroup](plugin.pluginoptions.md#invalidroutegroup)
* [metrics](plugin.pluginoptions.md#metrics)
* [pluginName](plugin.pluginoptions.md#pluginname)
* [prefix](plugin.pluginoptions.md#prefix)
* [register](plugin.pluginoptions.md#register)

## Properties

### blacklist

• `Optional` **blacklist**: string \| RegExp \| string[]

*Defined in [plugin.ts:66](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L66)*

Routes blacklist that will be excluded from metrics collection

___

### enableDefaultMetrics

• `Optional` **enableDefaultMetrics**: boolean

*Defined in [plugin.ts:43](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L43)*

Enable default prom-client metrics

**`default`** true

___

### enableRouteMetrics

• `Optional` **enableRouteMetrics**: boolean

*Defined in [plugin.ts:48](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L48)*

Enable fastify route metrics

**`default`** true

___

### endpoint

• `Optional` **endpoint**: string

*Defined in [plugin.ts:78](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L78)*

Metrics endpoint for Prometheus

___

### groupStatusCodes

• `Optional` **groupStatusCodes**: boolean

*Defined in [plugin.ts:53](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L53)*

Groups status code labels by first digit 200 -> 2XX

**`default`** false

___

### invalidRouteGroup

• `Optional` **invalidRouteGroup**: string

*Defined in [plugin.ts:57](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L57)*

Groups urls that are not mapped onto valid routes together

___

### metrics

• `Optional` **metrics**: Partial\<[MetricConfig](plugin.metricconfig.md)>

*Defined in [plugin.ts:82](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L82)*

HTTP metrics overrides

___

### pluginName

• `Optional` **pluginName**: string

*Defined in [plugin.ts:62](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L62)*

Plugin name that will be registered in fastify

**`default`** metrics

___

### prefix

• `Optional` **prefix**: string

*Defined in [plugin.ts:74](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L74)*

Metrics prefix

___

### register

• `Optional` **register**: Registry

*Defined in [plugin.ts:70](https://github.com/SkeLLLa/fastify-metrics/blob/39a4f54/src/plugin.ts#L70)*

Prom client registry for default metrics and route metrics
