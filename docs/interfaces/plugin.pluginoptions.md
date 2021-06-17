[Fastify metrics - v7.2.1](../README.md) / [plugin](../modules/plugin.md) / PluginOptions

# Interface: PluginOptions

[plugin](../modules/plugin.md).PluginOptions

## Table of contents

### Properties

- [blacklist](plugin.pluginoptions.md#blacklist)
- [enableDefaultMetrics](plugin.pluginoptions.md#enabledefaultmetrics)
- [enableRouteMetrics](plugin.pluginoptions.md#enableroutemetrics)
- [endpoint](plugin.pluginoptions.md#endpoint)
- [groupStatusCodes](plugin.pluginoptions.md#groupstatuscodes)
- [invalidRouteGroup](plugin.pluginoptions.md#invalidroutegroup)
- [metrics](plugin.pluginoptions.md#metrics)
- [pluginName](plugin.pluginoptions.md#pluginname)
- [prefix](plugin.pluginoptions.md#prefix)
- [register](plugin.pluginoptions.md#register)

## Properties

### blacklist

• `Optional` **blacklist**: `string` \| `RegExp` \| `string`[]

Routes blacklist that will be excluded from metrics collection

#### Defined in

[plugin.ts:66](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L66)

---

### enableDefaultMetrics

• `Optional` **enableDefaultMetrics**: `boolean`

Enable default prom-client metrics

**`default`** true

#### Defined in

[plugin.ts:43](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L43)

---

### enableRouteMetrics

• `Optional` **enableRouteMetrics**: `boolean`

Enable fastify route metrics

**`default`** true

#### Defined in

[plugin.ts:48](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L48)

---

### endpoint

• `Optional` **endpoint**: `string`

Metrics endpoint for Prometheus

#### Defined in

[plugin.ts:78](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L78)

---

### groupStatusCodes

• `Optional` **groupStatusCodes**: `boolean`

Groups status code labels by first digit 200 -> 2XX

**`default`** false

#### Defined in

[plugin.ts:53](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L53)

---

### invalidRouteGroup

• `Optional` **invalidRouteGroup**: `string`

Groups urls that are not mapped onto valid routes together

#### Defined in

[plugin.ts:57](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L57)

---

### metrics

• `Optional` **metrics**: `Partial`<[MetricConfig](plugin.metricconfig.md)\>

HTTP metrics overrides

#### Defined in

[plugin.ts:82](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L82)

---

### pluginName

• `Optional` **pluginName**: `string`

Plugin name that will be registered in fastify

**`default`** metrics

#### Defined in

[plugin.ts:62](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L62)

---

### prefix

• `Optional` **prefix**: `string`

Metrics prefix

#### Defined in

[plugin.ts:74](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L74)

---

### register

• `Optional` **register**: `Registry`

Prom client registry for default metrics and route metrics

#### Defined in

[plugin.ts:70](https://github.com/SkeLLLa/fastify-metrics/blob/aacc1f9/src/plugin.ts#L70)
