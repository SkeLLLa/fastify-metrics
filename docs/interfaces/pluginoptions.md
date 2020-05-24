[fastify-metrics](../README.md) › [PluginOptions](pluginoptions.md)

# Interface: PluginOptions

## Hierarchy

* **PluginOptions**

## Index

### Properties

* [blacklist](pluginoptions.md#optional-blacklist)
* [enableDefaultMetrics](pluginoptions.md#optional-enabledefaultmetrics)
* [endpoint](pluginoptions.md#optional-endpoint)
* [groupStatusCodes](pluginoptions.md#optional-groupstatuscodes)
* [metrics](pluginoptions.md#optional-metrics)
* [pluginName](pluginoptions.md#optional-pluginname)
* [prefix](pluginoptions.md#optional-prefix)
* [register](pluginoptions.md#optional-register)

## Properties

### `Optional` blacklist

• **blacklist**? : *RegExp | Array‹string› | string*

*Defined in [plugin.ts:57](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L57)*

Routes blacklist that will be excluded from metrics collection

___

### `Optional` enableDefaultMetrics

• **enableDefaultMetrics**? : *undefined | false | true*

*Defined in [plugin.ts:43](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L43)*

Enable default nodejs metrics

**`default`** true

___

### `Optional` endpoint

• **endpoint**? : *undefined | string*

*Defined in [plugin.ts:69](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L69)*

Metrics endpoint for Prometheus

___

### `Optional` groupStatusCodes

• **groupStatusCodes**? : *undefined | false | true*

*Defined in [plugin.ts:48](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L48)*

Groups status code labels by first digit 200 -> 2XX

**`default`** false

___

### `Optional` metrics

• **metrics**? : *Partial‹[MetricConfig](metricconfig.md)›*

*Defined in [plugin.ts:73](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L73)*

HTTP metrics overrides

___

### `Optional` pluginName

• **pluginName**? : *undefined | string*

*Defined in [plugin.ts:53](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L53)*

Plugin name that will be registered in fastify

**`default`** metrics

___

### `Optional` prefix

• **prefix**? : *undefined | string*

*Defined in [plugin.ts:65](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L65)*

Metrics prefix

___

### `Optional` register

• **register**? : *promClient.Registry*

*Defined in [plugin.ts:61](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L61)*

Prom client registry for default metrics and route metrics
