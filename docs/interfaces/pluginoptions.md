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

Defined in plugin.ts:60

Routes blacklist that will be excluded from metrics collection

___

### `Optional` enableDefaultMetrics

• **enableDefaultMetrics**? : *undefined | false | true*

Defined in plugin.ts:46

Enable default nodejs metrics

**`default`** true

___

### `Optional` endpoint

• **endpoint**? : *undefined | string*

Defined in plugin.ts:72

Metrics endpoint for Prometheus

___

### `Optional` groupStatusCodes

• **groupStatusCodes**? : *undefined | false | true*

Defined in plugin.ts:51

Groups status code labels by first digit 200 -> 2XX

**`default`** false

___

### `Optional` metrics

• **metrics**? : *any*

Defined in plugin.ts:76

HTTP metrics overrides

___

### `Optional` pluginName

• **pluginName**? : *undefined | string*

Defined in plugin.ts:56

Plugin name that will be registered in fastify

**`default`** metrics

___

### `Optional` prefix

• **prefix**? : *undefined | string*

Defined in plugin.ts:68

Metrics prefix

___

### `Optional` register

• **register**? : *promClient.Registry*

Defined in plugin.ts:64

Prom client registry for default metrics and route metrics
