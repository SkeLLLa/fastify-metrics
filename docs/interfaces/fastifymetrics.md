[fastify-metrics](../README.md) › [FastifyMetrics](fastifymetrics.md)

# Interface: FastifyMetrics

## Hierarchy

* **FastifyMetrics**

## Indexable

* \[ **key**: *string*\]: any

Additional objects to store your metrics, registries, etc.

## Index

### Properties

* [client](fastifymetrics.md#client)

### Methods

* [clearRegister](fastifymetrics.md#optional-clearregister)

## Properties

###  client

• **client**: *typeof promClient*

Defined in plugin.ts:30

Prom-client

## Methods

### `Optional` clearRegister

▸ **clearRegister**(): *void*

Defined in plugin.ts:34

Expose register clear function if register was provided

**Returns:** *void*
