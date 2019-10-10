[fastify-metrics](../README.md) › [HTTPMetric](httpmetric.md)

# Interface: HTTPMetric

## Hierarchy

* **HTTPMetric**

## Index

### Properties

* [buckets](httpmetric.md#optional-buckets)
* [help](httpmetric.md#optional-help)
* [labelNames](httpmetric.md#optional-labelnames)
* [name](httpmetric.md#optional-name)
* [registers](httpmetric.md#optional-registers)

## Properties

### `Optional` buckets

• **buckets**? : *Array‹number›*

Defined in plugin.ts:19

Histogram/Summary buckets

___

### `Optional` help

• **help**? : *undefined | string*

Defined in plugin.ts:11

Metric description

___

### `Optional` labelNames

• **labelNames**? : *Array‹string›*

Defined in plugin.ts:15

Metric labels

___

### `Optional` name

• **name**? : *undefined | string*

Defined in plugin.ts:7

Metric name

___

### `Optional` registers

• **registers**? : *Array‹Registry›*

Defined in plugin.ts:23

Prom-client registries
