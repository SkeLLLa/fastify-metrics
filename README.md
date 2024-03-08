# fastify-metrics

<div align="center">
  <img src="https://github.com/SkeLLLa/fastify-metrics/raw/master/logo.png" alt="fastify-metrics logo"/>
</div>

[![NPM Version](https://img.shields.io/npm/v/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Downloads Count](https://img.shields.io/npm/dm/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Vunerabilities Count](https://snyk.io/test/npm/fastify-metrics/badge.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Build Status](https://github.com/SkeLLLa/fastify-metrics/workflows/build/badge.svg)](https://github.com/SkeLLLa/fastify-metrics/actions)
[![License](https://img.shields.io/npm/l/fastify-metrics.svg)](https://gitlab.com/m03geek/fastify-metrics/blob/master/LICENSE)
[![Codecov](https://img.shields.io/codecov/c/gh/SkeLLLa/fastify-metrics.svg)](https://codecov.io/gh/SkeLLLa/fastify-metrics)

[Prometheus](https://prometheus.io/) metrics exporter for Fastify.

This plugin uses [prom-client](https://github.com/siimon/prom-client) under the hood.

This plugin also adds two http metrics for your routes:

- Requests duration histogram
- Requests duration summary

## ToC

- [fastify-metrics](#fastify-metrics)
  - [ToC](#toc)
  - [Fastify support](#fastify-support)
  - [Notable changes](#notable-changes)
    - [v10.x.x](#v10xx)
    - [v9.x.x](#v9xx)
    - [v6.x.x](#v6xx)
  - [Installation](#installation)
  - [Features and requirements](#features-and-requirements)
  - [Usage](#usage)
    - [Registry clear](#registry-clear)
    - [Plugin options](#plugin-options)
      - [Route metrics](#route-metrics)
        - [Route metrics overrides](#route-metrics-overrides)
          - [Labels](#labels)
          - [Request durations summary](#request-durations-summary)
          - [Request durations histogram](#request-durations-histogram)
    - [HTTP routes metrics in Prometheus](#http-routes-metrics-in-prometheus)
  - [API Docs](#api-docs)
  - [Changelog](#changelog)
  - [See also](#see-also)
  - [License](#license)

## Fastify support

- **v3.x.x** - supports `fastify-1.x`
- **v4.x.x** - supports `fastify-2.x` `prom-client-11.x`
- **v5.x.x** - supports `fastify-2.x` `prom-client-12.x`
- **v6.x.x** - supports `fastify-3.x`
- **v9.x.x** - supports `fastify-4.x` `prom-client-14.x`

## Notable changes

### v10.x.x

- Replace route `context.config` with `routeConfig` due to deprecation in fastify v4 and removal in fastify v5. If you had `disableMetrics` option in you route `config`, update fastify to latest version.
- Prefer `request.routeOptions.method` over deprecated `request.routerMethod`.

### v9.x.x

- Fastify v4 support.
- Complete config rewrite, default behaviour changed.
- Support disabling metrics in route config.
- Now collects metrics only for registered routes by default.
- Unknown routes metrics collection disabled by default.
- Removed `metrics` from `request`. Now it uses `WeakMap` and not exposed.
- Add balcklisting possibility for request methods.
- Registry overrides moved to metric configuration.
- Support overriding all Summary and Histogram options for default route metrics.

### v6.x.x

- Fastify v3 support.
- Drop node.js 8 support.
- `enableDefaultMetrics` - now enables only default `prom-client` metrics. Set to `true` by default.
- `enableRouteMetrics` - additional flag that enables route metrics. Set to `true` by default.

## Installation

```sh
npm i fastify-metrics --save
pnpm i fastify-metrics --save
```

<sub>[Back to top](#toc)</sub>

## Features and requirements

- Collects default server metrics (see [prom-client](https://github.com/siimon/prom-client/tree/master/lib/metrics));
- Collects route response timings
- Adds `metrics` to fastify instance for your custom metrics.

---

- Requires fastify `>=4.0.0`.
- Node.js `>=18.0.0`.

<sub>[Back to top](#toc)</sub>

## Usage

Add it to your project like regular fastify plugin. Use `register` method and pass options to it.

```js
const fastify = require('fastify');
const app = fastify();

const metricsPlugin = require('fastify-metrics');
await app.register(metricsPlugin, { endpoint: '/metrics' });
```

It also exports client to fastify instance `fastify.metrics.client` which you may use it in your routes.

You may create your metrics when app starts and store it in `fastify.metrics` object and reuse them in multiple routes.

### Registry clear

After calling `registry.clear()` all metrics are removed from registry. In order to add them again to the registry, call `fastify.mterics.initMetricsInRegistry`.

<sub>[Back to top](#toc)</sub>

### Plugin options

See for details [docs](docs/api/fastify-metrics.imetricspluginoptions.md)

| Property                                                                              | Type                                                                                                                | Default Value       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| [defaultMetrics?](./docs/api/fastify-metrics.imetricspluginoptions.defaultmetrics.md) | [IDefaultMetricsConfig](./docs/api/fastify-metrics.idefaultmetricsconfig.md)                                        | `{ enabled: true }` |
| [endpoint?](./docs/api/fastify-metrics.imetricspluginoptions.endpoint.md)             | string \| null \| [`Fastify.RouteOptions`](https://www.fastify.io/docs/api/latest/Reference/Routes/#routes-options) | `'/metrics'`        |
| [name?](./docs/api/fastify-metrics.imetricspluginoptions.name.md)                     | string                                                                                                              | `'metrics'`         |
| [routeMetrics?](./docs/api/fastify-metrics.imetricspluginoptions.routemetrics.md)     | [IRouteMetricsConfig](./docs/api/fastify-metrics.iroutemetricsconfig.md)                                            | `{ enabled: true }` |
| [promClient?](./docs/api/fastify-metrics.imetricspluginoptions.promclient.md)         | `prom-client` instance \| null                                                                                      | `null`              |

#### Route metrics

| Property                                                                                    | Type                                                                                          | Default Value                           |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| [enabled?](./docs/fastify-metrics.iroutemetricsconfig.enabled.md)                           | boolean \| { histogram: boolean, summary: boolean }                                           | `true`                                  |
| [enableSummaries?](./docs/fastify-metrics.iroutemetricsconfig.enablesummaries.md)           | boolean                                                                                       | `true`                                  |
| [groupStatusCodes?](./docs/fastify-metrics.iroutemetricsconfig.groupstatuscodes.md)         | boolean                                                                                       | `false`                                 |
| [invalidRouteGroup?](./docs/fastify-metrics.iroutemetricsconfig.invalidroutegroup.md)       | string                                                                                        | `'__unknown__'`                         |
| [methodBlacklist?](./docs/fastify-metrics.iroutemetricsconfig.methodblacklist.md)           | readonly string\[\]                                                                           | `['HEAD','OPTIONS','TRACE','CONNECT',]` |
| [overrides?](./docs/fastify-metrics.iroutemetricsconfig.overrides.md)                       | [IRouteMetricsOverrides](./docs/fastify-metrics.iroutemetricsoverrides.md)                    |                                         |
| [registeredRoutesOnly?](./docs/fastify-metrics.iroutemetricsconfig.registeredroutesonly.md) | boolean                                                                                       | `true`                                  |
| [customLabels?](./fastify-metrics.iroutemetricsconfig.customlabels.md)                      | Record&lt;string, string \| ((request: FastifyRequest, reply: FastifyReply) =&gt; string)&gt; | `undefined`                             |
| [routeBlacklist?](./docs/fastify-metrics.iroutemetricsconfig.routeblacklist.md)             | readonly (string \| RegExp)\[\]                                                               | `[]`                                    |

#### Route metrics enabled

The `enabled` configuration option can be either a boolean which enables/disables generation of both histograms and summaries, or it can be set to an object that allows you to pick individually whether you want histograms or summaries to be generated, for example:

```
{
  ...
  routeMetrics: {
    enabled: {
      histogram: true,
      summary: false
    }
  }
}
```

would result in the library only generating histograms.

##### Route metrics overrides

You may override default metrics settings. You may provide overrides for two metrics tracking http request durations: `histogram` and `summary`.

```js
const fastify = require('fastify');
const app = fastify();
const metricsPlugin = require('fastify-metrics');

await app.register(metricsPlugin, {
  endpoint: '/metrics',
  routeMetrics: {
    overrides: {
      histogram: {
        name: 'my_custom_http_request_duration_seconds',
        buckets: [0.1, 0.5, 1, 3, 5],
      },
      summary: {
        help: 'custom request duration in seconds summary help',
        labelNames: ['status_code', 'method', 'route'],
        percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
      },
    },
  },
});
```

###### Labels

| Property                                                                   | Type                                   | Default value   |
| -------------------------------------------------------------------------- | -------------------------------------- | --------------- |
| [getRouteLabel?](./fastify-metrics.iroutelabelsoverrides.getroutelabel.md) | (request: FastifyRequest) =&gt; string | `undefined`     |
| [method?](./docs/fastify-metrics.iroutelabelsoverrides.method.md)          | string                                 | `'method'`      |
| [route?](./docs/fastify-metrics.iroutelabelsoverrides.route.md)            | string                                 | `'route'`       |
| [status?](./docs/fastify-metrics.iroutelabelsoverrides.status.md)          | string                                 | `'status_code'` |

###### Request durations summary

| Property                                                                | Type       | Default value                           |
| ----------------------------------------------------------------------- | ---------- | --------------------------------------- |
| [name?](./docs/fastify-metrics.isummaryoverrides.name.md)               | string     | `'http_request_summary_seconds'`        |
| [help?](./docs/fastify-metrics.isummaryoverrides.help.md)               | string     | `'request duration in seconds summary'` |
| [percentiles?](./docs/fastify-metrics.isummaryoverrides.percentiles.md) | number\[\] | `[0.5, 0.9, 0.95, 0.99]`                |

###### Request durations histogram

| Property                                                              | Type       | Default value                     |
| --------------------------------------------------------------------- | ---------- | --------------------------------- |
| [name?](./docs/api/fastify-metrics.ihistogramoverrides.name.md)       | string     | `'http_request_duration_seconds'` |
| [help?](./docs/api/fastify-metrics.ihistogramoverrides.help.md)       | string     | `'request duration in seconds'`   |
| [buckets?](./docs/api/fastify-metrics.ihistogramoverrides.buckets.md) | number\[\] | `[0.05, 0.1, 0.5, 1, 3, 5, 10]`   |

<sub>[Back to top](#toc)</sub>

### HTTP routes metrics in Prometheus

The following table shows what metrics will be available in Prometheus (subject to the `enabled` configuration option). Note suffixes like `_bucket`, `_sum`, `_count` are added automatically.

| metric                                 | labels                           | description                   |
| -------------------------------------- | -------------------------------- | ----------------------------- |
| `http_request_duration_seconds_count`  | `method`, `route`, `status_code` | Requests total count          |
| `http_request_duration_seconds_bucket` | `method`, `route`, `status_code` | Requests durations by bucket  |
| `http_request_summary_seconds`         | `method`, `route`, `status_code` | Requests duration percentiles |
| `http_request_summary_seconds_count`   | `method`, `route`, `status_code` | Requests total count          |

<sub>[Back to top](#toc)</sub>

## API Docs

See [docs](docs/api/index.md).

<sub>[Back to top](#toc)</sub>

## Changelog

See [changelog](docs/CHANGELOG.md).

<sub>[Back to top](#toc)</sub>

## See also

- [fastify-prom-client](https://github.com/ExcitableAardvark/fastify-prom-client) - just simple client that adds aggregated http requests metric.

<sub>[Back to top](#toc)</sub>

## License

Licensed under [MIT](./LICENSE).

<sub>[Back to top](#toc)</sub>
