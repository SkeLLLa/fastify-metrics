[fastify-metrics](../README.md) > [FastifyMetrics](../interfaces/fastifymetrics.md)

# Interface: FastifyMetrics

## Hierarchy

**FastifyMetrics**

## Indexable

\[key: `string`\]:&nbsp;`any`
Additional objects to store your metrics, registries, etc.

## Index

### Properties

* [client](fastifymetrics.md#client)

### Methods

* [clearRegister](fastifymetrics.md#clearregister)

---

## Properties

<a id="client"></a>

###  client

**● client**: *`&quot;/home/m03geek/dev/os/fastify-metrics/node_modules/prom-client/index&quot;`*

*Defined in plugin.ts:30*

Prom-client

___

## Methods

<a id="clearregister"></a>

### `<Optional>` clearRegister

▸ **clearRegister**(): `void`

*Defined in plugin.ts:34*

Expose register clear function if register was provided

**Returns:** `void`

___

