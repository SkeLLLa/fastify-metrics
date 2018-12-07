[fastify-metrics](../README.md) > [PluginOptions](../interfaces/pluginoptions.md)

# Interface: PluginOptions

## Hierarchy

**PluginOptions**

## Index

### Properties

* [blacklist](pluginoptions.md#blacklist)
* [enableDefaultMetrics](pluginoptions.md#enabledefaultmetrics)
* [endpoint](pluginoptions.md#endpoint)
* [groupStatusCodes](pluginoptions.md#groupstatuscodes)
* [interval](pluginoptions.md#interval)
* [metrics](pluginoptions.md#metrics)
* [pluginName](pluginoptions.md#pluginname)
* [prefix](pluginoptions.md#prefix)
* [register](pluginoptions.md#register)

---

## Properties

<a id="blacklist"></a>

### `<Optional>` blacklist

**● blacklist**: * `RegExp` &#124; `Array`<`string`> &#124; `string`
*

*Defined in plugin.ts:65*

Routes blacklist that will be excluded from metrics collection

___
<a id="enabledefaultmetrics"></a>

### `<Optional>` enableDefaultMetrics

**● enableDefaultMetrics**: * `undefined` &#124; `false` &#124; `true`
*

*Defined in plugin.ts:46*

Enable default nodejs metrics
*__default__*: true

___
<a id="endpoint"></a>

### `<Optional>` endpoint

**● endpoint**: * `undefined` &#124; `string`
*

*Defined in plugin.ts:77*

Metrics endpoint for Prometheus

___
<a id="groupstatuscodes"></a>

### `<Optional>` groupStatusCodes

**● groupStatusCodes**: * `undefined` &#124; `false` &#124; `true`
*

*Defined in plugin.ts:51*

Groups status code labels by first digit 200 -> 2XX
*__default__*: false

___
<a id="interval"></a>

### `<Optional>` interval

**● interval**: * `undefined` &#124; `number`
*

*Defined in plugin.ts:61*

Metrics collection interval in ms
*__default__*: 5000

___
<a id="metrics"></a>

### `<Optional>` metrics

**● metrics**: *`any`*

*Defined in plugin.ts:81*

HTTP metrics overrides

___
<a id="pluginname"></a>

### `<Optional>` pluginName

**● pluginName**: * `undefined` &#124; `string`
*

*Defined in plugin.ts:56*

Plugin name that will be registered in fastify
*__default__*: metrics

___
<a id="prefix"></a>

### `<Optional>` prefix

**● prefix**: * `undefined` &#124; `string`
*

*Defined in plugin.ts:73*

Metrics prefix

___
<a id="register"></a>

### `<Optional>` register

**● register**: *`promClient.Registry`*

*Defined in plugin.ts:69*

Prom client registry for default metrics and route metrics

___

