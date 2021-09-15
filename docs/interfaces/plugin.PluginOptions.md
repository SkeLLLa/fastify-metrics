[Fastify metrics - v7.3.0](../README.md) / [plugin](../modules/plugin.md) / PluginOptions

# Interface: PluginOptions

[plugin](../modules/plugin.md).PluginOptions

## Table of contents

### Properties

- [blacklist](plugin.PluginOptions.md#blacklist)
- [enableDefaultMetrics](plugin.PluginOptions.md#enabledefaultmetrics)
- [enableRouteMetrics](plugin.PluginOptions.md#enableroutemetrics)
- [endpoint](plugin.PluginOptions.md#endpoint)
- [groupStatusCodes](plugin.PluginOptions.md#groupstatuscodes)
- [invalidRouteGroup](plugin.PluginOptions.md#invalidroutegroup)
- [labelOverrides](plugin.PluginOptions.md#labeloverrides)
- [metrics](plugin.PluginOptions.md#metrics)
- [pluginName](plugin.PluginOptions.md#pluginname)
- [prefix](plugin.PluginOptions.md#prefix)
- [register](plugin.PluginOptions.md#register)

## Properties

### blacklist

• `Optional` **blacklist**: `string` \| `RegExp` \| `string`[]

Routes blacklist that will be excluded from metrics collection

#### Defined in

[plugin.ts:65](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L65)

---

### enableDefaultMetrics

• `Optional` **enableDefaultMetrics**: `boolean`

Enable default prom-client metrics

**`default`** true

#### Defined in

[plugin.ts:42](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L42)

---

### enableRouteMetrics

• `Optional` **enableRouteMetrics**: `boolean`

Enable fastify route metrics

**`default`** true

#### Defined in

[plugin.ts:47](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L47)

---

### endpoint

• `Optional` **endpoint**: `string`

Metrics endpoint for Prometheus

#### Defined in

[plugin.ts:77](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L77)

---

### groupStatusCodes

• `Optional` **groupStatusCodes**: `boolean`

Groups status code labels by first digit 200 -> 2XX

**`default`** false

#### Defined in

[plugin.ts:52](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L52)

---

### invalidRouteGroup

• `Optional` **invalidRouteGroup**: `string`

Groups urls that are not mapped onto valid routes together

#### Defined in

[plugin.ts:56](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L56)

---

### labelOverrides

• `Optional` **labelOverrides**: `Object`

Label Overrides

#### Type declaration

| Name      | Type     |
| :-------- | :------- |
| `method?` | `string` |
| `route?`  | `string` |
| `status?` | `string` |

#### Defined in

[plugin.ts:85](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L85)

---

### metrics

• `Optional` **metrics**: `Partial`<[`MetricConfig`](plugin.MetricConfig.md)\>

HTTP metrics overrides

#### Defined in

[plugin.ts:81](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L81)

---

### pluginName

• `Optional` **pluginName**: `string`

Plugin name that will be registered in fastify

**`default`** metrics

#### Defined in

[plugin.ts:61](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L61)

---

### prefix

• `Optional` **prefix**: `string`

Metrics prefix

#### Defined in

[plugin.ts:73](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L73)

---

### register

• `Optional` **register**: `Registry`

Prom client registry for default metrics and route metrics

#### Defined in

[plugin.ts:69](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L69)
