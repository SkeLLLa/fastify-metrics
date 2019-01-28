# fastify-metrics

<!-- <div align="center">
  <img src="https://gitlab.com/m03geek/fastify-metrics/raw/master/logo.png" alt="fastify-metrics logo"/>
</div> -->

[![NPM Version](https://img.shields.io/npm/v/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Downloads Count](https://img.shields.io/npm/dm/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Vunerabilities Count](https://snyk.io/test/npm/fastify-metrics/badge.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Build Status](https://gitlab.com/m03geek/fastify-metrics/badges/master/pipeline.svg)](https://gitlab.com/m03geek/fastify-metrics/commits/master)
[![License](https://img.shields.io/npm/l/fastify-metrics.svg)](https://gitlab.com/m03geek/fastify-metrics/blob/master/LICENSE)
<!-- [![Coverage Status](https://gitlab.com/m03geek/fastify-metrics/badges/master/coverage.svg)](https://gitlab.com/m03geek/fastify-metrics/commits/master) -->
[Prometheus](https://prometheus.io/) metrics exporter for Fastify.

This plugin uses [prom-client](https://github.com/siimon/prom-client) under the hood.

This plugin also adds 2 http metrics for your routes:
* Requests duration histogram
* Requests duration summary

## ToC
- [fastify-metrics](#fastify-metrics)
  - [ToC](#toc)
  - [Fastify support](#fastify-support)
  - [Installation](#installation)
  - [Features and requirements](#features-and-requirements)
  - [Usage](#usage)
    - [Plugin options](#plugin-options)
      - [Metrics details](#metrics-details)
    - [HTTP routes metrics](#http-routes-metrics)
  - [Docs](#docs)
  - [Changelog](#changelog)
  - [See also](#see-also)
  - [License](#license)

## Fastify support

- **v3.x.x** - supports `< fastify-2.0.0`
- **v4.x.x** - will support `>= fastify-2.0.0`

## Installation

```sh
npm i fastify-metrics --save
```

<sub>[Back to top](#toc)</sub>

## Features and requirements

* Collects default server metrics (see [prom-client](https://github.com/siimon/prom-client/tree/master/lib/metrics));
* Collects route response timings
* Adds `metrics` to fastify instance for your custom metrics.

--- 

* Requires fastify `>=1.9.0`.
* Node.js `>=8.9.0`.

<sub>[Back to top](#toc)</sub>

## Usage

Add it to your project like regular fastify plugin. Use `register` method and pass options to it.

```js
const fastify = require('fastify');
const app = fastify();

const metricsPlugin = require('fastify-metrics');
app.register(metricsPlugin, {endpoint: '/metrics'});
```

It also exports client to fastify instance `fastify.metrics.client` which you may use it in your routes.

You may create your metrics when app starts and store it in `fastify.metrics` object and reuse them in multiple routes.


<sub>[Back to top](#toc)</sub>

### Plugin options

|  parameter  |  type  |  description   |  default  |
|-------------|--------|----------------|-----------|
| `enableDefaultMetrics` | Boolean | Enables collection of default metrics. | `true` |
| `pluginName` | String | Change name which you'll use to access prometheus client instance in fastify. | `metrics` |
| `interval` | Number | Default metrics collection interval in ms. | `5000` |
| `register` | Object | Custom prom-client metrics registry (see [docs](https://github.com/siimon/prom-client#default-metrics)). | `undefined` |
| `prefix` | String | Custom default metrics prefix. | `""` |
| `endpoint` | String | If set, fastify route will be added to expose metrics. If not set you may manually add it afterwards. | `undefined` |
| `metrics` | Object | Allows override default metrics config. See section below. | `{}` |
| `blacklist` | String, RegExp, String[] | Skip metrics collection for blacklisted routes | `undefined` |
| `groupStatusCodes` | Boolean | Groups status codes (e.g. 2XX) if `true` | `false` |

#### Metrics details

You may override default metrics settings. You may provide overrides for two metrics tracking http request durations: `histogram` and `summary`.
Default values:

```js
{
  histogram: {
    name: 'http_request_duration_seconds',
    help: 'request duration in seconds',
    labelNames: ['status_code', 'method', 'route'],
    buckets: [0.05, 0.1, 0.5, 1, 3, 5, 10],
  },
  summary: {
    name: 'http_request_summary_seconds',
    help: 'request duration in seconds summary',
    labelNames: ['status_code', 'method', 'route'],
    percentiles: [0.5, 0.9, 0.95, 0.99],
  },
}
```

You may also provide registers there or use it instead of prefix. Override should look like:

```js
const fastify = require('fastify');
const app = fastify();
const metricsPlugin = require('fastify-metrics');

app.register(metricsPlugin, {endpoint: '/metrics', {
  histogram: {
    name: 'my_custom_http_request_duration_seconds',
    buckets: [0.1, 0.5, 1, 3, 5],
  },
  summary: {
    help: 'custom request duration in seconds summary help',
    labelNames: ['status_code', 'method', 'route'],
    percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
  },
}});
```

<sub>[Back to top](#toc)</sub>

### HTTP routes metrics

The following table shows what metrics will be available in Prometheus. Note suffixes like `_bucket`, `_sum`, `_count` are added automatically.

|  metric  |  labels  |  description  |
|----------|----------|---------------|
| `http_request_duration_seconds_count` | `method`, `route`, `status_code` | Requests total count |
| `http_request_duration_seconds_bucket` | `method`, `route`, `status_code` | Requests durations by bucket |
| `http_request_duration_seconds_sum` | `method`, `route`, `status_code` | Requests duration summaries by quantile |

<sub>[Back to top](#toc)</sub>

## Docs

See [docs](docs/README.md).

<sub>[Back to top](#toc)</sub>

## Changelog

See [changelog](CHANGELOG.md).

<sub>[Back to top](#toc)</sub>

## See also

* [fastify-prom-client](https://github.com/ExcitableAardvark/fastify-prom-client) - just simple client that adds aggregated http requests metric.

<sub>[Back to top](#toc)</sub>

## License

Licensed under [MIT](./LICENSE).

<sub>[Back to top](#toc)</sub>
