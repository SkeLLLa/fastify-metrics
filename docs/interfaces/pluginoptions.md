**[fastify-metrics](../README.md)**

> [Globals](../README.md) / PluginOptions

# Interface: PluginOptions

## Hierarchy

* **PluginOptions**

## Index

### Properties

* [blacklist](pluginoptions.md#blacklist)
* [enableDefaultMetrics](pluginoptions.md#enabledefaultmetrics)
* [enableRouteMetrics](pluginoptions.md#enableroutemetrics)
* [endpoint](pluginoptions.md#endpoint)
* [groupStatusCodes](pluginoptions.md#groupstatuscodes)
* [metrics](pluginoptions.md#metrics)
* [pluginName](pluginoptions.md#pluginname)
* [prefix](pluginoptions.md#prefix)
* [register](pluginoptions.md#register)

## Properties

### blacklist

• `Optional` **blacklist**: RegExp \| Array\<string> \| string

*Defined in [src/plugin.ts:62](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L62)*

Routes blacklist that will be excluded from metrics collection

___

### enableDefaultMetrics

• `Optional` **enableDefaultMetrics**: undefined \| false \| true

*Defined in [src/plugin.ts:43](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L43)*

Enable default prom-client metrics

**`default`** true

___

### enableRouteMetrics

• `Optional` **enableRouteMetrics**: undefined \| false \| true

*Defined in [src/plugin.ts:48](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L48)*

Enable fastify route metrics

**`default`** true

___

### endpoint

• `Optional` **endpoint**: undefined \| string

*Defined in [src/plugin.ts:74](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L74)*

Metrics endpoint for Prometheus

___

### groupStatusCodes

• `Optional` **groupStatusCodes**: undefined \| false \| true

*Defined in [src/plugin.ts:53](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L53)*

Groups status code labels by first digit 200 -> 2XX

**`default`** false

___

### metrics

• `Optional` **metrics**: Partial\<[MetricConfig](metricconfig.md)>

*Defined in [src/plugin.ts:78](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L78)*

HTTP metrics overrides

___

### pluginName

• `Optional` **pluginName**: undefined \| string

*Defined in [src/plugin.ts:58](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L58)*

Plugin name that will be registered in fastify

**`default`** metrics

___

### prefix

• `Optional` **prefix**: undefined \| string

*Defined in [src/plugin.ts:70](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L70)*

Metrics prefix

___

### register

• `Optional` **register**: promClient.Registry

*Defined in [src/plugin.ts:66](https://github.com/SkeLLLa/fastify-metrics/blob/0e445eb/src/plugin.ts#L66)*

Prom client registry for default metrics and route metrics
