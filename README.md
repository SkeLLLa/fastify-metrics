# fastify-metrics

<div align="center">
  <img src="https://gitlab.com/m03geek/fastify-metrics/raw/master/logo.png" alt="fastify-metrics logo"/>
</div>

[![NPM Version](https://img.shields.io/npm/v/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Downloads Count](https://img.shields.io/npm/dm/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Vunerabilities Count](https://snyk.io/test/npm/fastify-metrics/badge.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Build Status](https://gitlab.com/m03geek/fastify-metrics/badges/master/pipeline.svg)](https://gitlab.com/m03geek/fastify-metrics/commits/master)
<!-- [![Coverage Status](https://gitlab.com/m03geek/fastify-metrics/badges/master/coverage.svg)](https://gitlab.com/m03geek/fastify-metrics/commits/master) -->
[![License](https://img.shields.io/npm/l/fastify-metrics.svg)](https://gitlab.com/m03geek/fastify-metrics/blob/master/LICENSE)

[Prometheus](https://prometheus.io/) metrics exporter for Fastify.

This plugin uses [prom-client](https://github.com/siimon/prom-client) that generates swagger 2.0 docs.

This plugin also adds 3 http metrics for your routes:
* Requests count
* Requests timing histogram
* Requests timing summary

## ToC
- [fastify-metrics](#fastify-metrics)
  - [ToC](#toc)
  - [Installation](#installation)
  - [Features and requirements](#features-and-requirements)
  - [Usage](#usage)
    - [Plugin options](#plugin-options)
    - [HTTP routes metrics](#http-routes-metrics)
  - [See also](#see-also)
  - [License](#license)

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

<sub>[Back to top](#toc)</sub>

### Plugin options

|  parameter  |  type  |  description   |  default  |
|-------------|--------|----------------|-----------|
| `enableDefaultMetrics` | Boolean | Enables collection of default metrics. | `true` |
| `interval` | Number | Default metrics collection interval in ms. | `5000` |
| `register` | Object | Custom prom-client metrics registry (see [docs](https://github.com/siimon/prom-client#default-metrics)). | `undefined` |
| `prefix` | String | Custom default metrics prefix. | `""` |
| `endpoint` | String | If set, fastify route will be added to expose metrics. If not set you may manually add it afterwards. | `undefined` |

<sub>[Back to top](#toc)</sub>

### HTTP routes metrics


|  metric  |  labels  |  description  |
|----------|----------|---------------|
| `http_request_count` | `method`, `route`, `status_code` | Requests count |
| `http_request_buckets_seconds` | `method`, `route`, `status_code` | Requests timing by bucket |
| `http_request_summary_seconds` | `method`, `route`, `status_code` | Requests timing by quantile |

<sub>[Back to top](#toc)</sub>

## See also

* [fastify-prom-client](https://github.com/ExcitableAardvark/fastify-prom-client) - just simple client that adds aggregated http requests metric.

<sub>[Back to top](#toc)</sub>

## License

Licensed under [MIT](./LICENSE).

<sub>[Back to top](#toc)</sub>
