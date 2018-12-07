[fastify-metrics](../README.md) > [HTTPMetric](../interfaces/httpmetric.md)

# Interface: HTTPMetric

## Hierarchy

**HTTPMetric**

## Index

### Properties

* [buckets](httpmetric.md#buckets)
* [help](httpmetric.md#help)
* [labelNames](httpmetric.md#labelnames)
* [name](httpmetric.md#name)
* [registers](httpmetric.md#registers)

---

## Properties

<a id="buckets"></a>

### `<Optional>` buckets

**● buckets**: *`Array`<`number`>*

*Defined in plugin.ts:19*

Histogram/Summary buckets

___
<a id="help"></a>

### `<Optional>` help

**● help**: * `undefined` &#124; `string`
*

*Defined in plugin.ts:11*

Metric description

___
<a id="labelnames"></a>

### `<Optional>` labelNames

**● labelNames**: *`Array`<`string`>*

*Defined in plugin.ts:15*

Metric labels

___
<a id="name"></a>

### `<Optional>` name

**● name**: * `undefined` &#124; `string`
*

*Defined in plugin.ts:7*

Metric name

___
<a id="registers"></a>

### `<Optional>` registers

**● registers**: *`Array`<`Registry`>*

*Defined in plugin.ts:23*

Prom-client registries

___

