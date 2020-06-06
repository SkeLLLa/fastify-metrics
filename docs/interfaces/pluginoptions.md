[fastify-metrics](../README.md) › [PluginOptions](pluginoptions.md)

# Interface: PluginOptions

## Hierarchy

* **PluginOptions**

## Index

### Properties

* [blacklist](pluginoptions.md#optional-blacklist)
* [enableDefaultMetrics](pluginoptions.md#optional-enabledefaultmetrics)
* [enableRouteMetrics](pluginoptions.md#optional-enableroutemetrics)
* [endpoint](pluginoptions.md#optional-endpoint)
* [groupStatusCodes](pluginoptions.md#optional-groupstatuscodes)
* [metrics](pluginoptions.md#optional-metrics)
* [pluginName](pluginoptions.md#optional-pluginname)
* [prefix](pluginoptions.md#optional-prefix)
* [register](pluginoptions.md#optional-register)

## Properties

### `Optional` blacklist

• **blacklist**? : *RegExp | Array‹string› | string*

*Defined in [plugin.ts:62](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L62)*

Routes blacklist that will be excluded from metrics collection

___

### `Optional` enableDefaultMetrics

• **enableDefaultMetrics**? : *undefined | false | true*

*Defined in [plugin.ts:43](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L43)*

Enable default prom-client metrics

**`default`** true

___

### `Optional` enableRouteMetrics

• **enableRouteMetrics**? : *undefined | false | true*

*Defined in [plugin.ts:48](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L48)*

Enable fastify route metrics

**`default`** true

___

### `Optional` endpoint

• **endpoint**? : *undefined | string*

*Defined in [plugin.ts:74](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L74)*

Metrics endpoint for Prometheus

___

### `Optional` groupStatusCodes

• **groupStatusCodes**? : *undefined | false | true*

*Defined in [plugin.ts:53](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L53)*

Groups status code labels by first digit 200 -> 2XX

**`default`** false

___

### `Optional` metrics

• **metrics**? : *Partial‹[MetricConfig](metricconfig.md)›*

*Defined in [plugin.ts:78](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L78)*

HTTP metrics overrides

___

### `Optional` pluginName

• **pluginName**? : *undefined | string*

*Defined in [plugin.ts:58](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L58)*

Plugin name that will be registered in fastify

**`default`** metrics

___

### `Optional` prefix

• **prefix**? : *undefined | string*

*Defined in [plugin.ts:70](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L70)*

Metrics prefix

___

### `Optional` register

• **register**? : *promClient.Registry*

*Defined in [plugin.ts:66](https://github.com/SkeLLLa/fastify-metrics/blob/6f6803a/src/plugin.ts#L66)*

Prom client registry for default metrics and route metrics
