[fastify-metrics](../README.md) › [FastifyMetrics](fastifymetrics.md)

# Interface: FastifyMetrics

## Hierarchy

* **FastifyMetrics**

## Indexable

* \[ **key**: *string*\]: unknown

Additional objects to store your metrics, registries, etc.

## Index

### Properties

* [client](fastifymetrics.md#client)

### Methods

* [clearRegister](fastifymetrics.md#optional-clearregister)

## Properties

###  client

• **client**: *typeof promClient*

*Defined in [plugin.ts:27](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L27)*

Prom-client

## Methods

### `Optional` clearRegister

▸ **clearRegister**(): *void*

*Defined in [plugin.ts:31](https://github.com/SkeLLLa/fastify-metrics/blob/9c64a0e/src/plugin.ts#L31)*

Expose register clear function if register was provided

**Returns:** *void*
