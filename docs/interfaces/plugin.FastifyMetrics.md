[Fastify metrics - v7.3.0](../README.md) / [plugin](../modules/plugin.md) / FastifyMetrics

# Interface: FastifyMetrics

[plugin](../modules/plugin.md).FastifyMetrics

## Indexable

▪ [key: `string`]: `unknown`

Additional objects to store your metrics, registries, etc.

## Table of contents

### Properties

- [client](plugin.FastifyMetrics.md#client)

### Methods

- [clearRegister](plugin.FastifyMetrics.md#clearregister)

## Properties

### client

• **client**: `__module`

Prom-client

#### Defined in

[plugin.ts:26](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L26)

## Methods

### clearRegister

▸ **clearRegister**(): `void`

Expose register clear function if register was provided

#### Returns

`void`

#### Defined in

[plugin.ts:30](https://github.com/SkeLLLa/fastify-metrics/blob/c351f80/src/plugin.ts#L30)
