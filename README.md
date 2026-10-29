# fastify-metrics

<div align="center">
  <img src="https://github.com/SkeLLLa/fastify-metrics/raw/master/logo.png" alt="fastify-metrics logo"/>
</div>

[![NPM Version](https://img.shields.io/npm/v/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Downloads Count](https://img.shields.io/npm/dm/fastify-metrics.svg)](https://www.npmjs.com/package/fastify-metrics)
[![Build Status](https://github.com/SkeLLLa/fastify-metrics/workflows/release/badge.svg)](https://github.com/SkeLLLa/fastify-metrics/actions)
[![License](https://img.shields.io/npm/l/fastify-metrics.svg)](https://gitlab.com/m03geek/fastify-metrics/blob/master/LICENSE)
[![Codecov](https://img.shields.io/codecov/c/gh/SkeLLLa/fastify-metrics.svg)](https://codecov.io/gh/SkeLLLa/fastify-metrics)
[![Socket Badge](https://socket.dev/api/badge/npm/package/fastify-metrics)](https://socket.dev/npm/package/fastify-metrics)

[Prometheus](https://prometheus.io/) metrics exporter for Fastify.

This plugin uses [@prometheus-io/client](https://github.com/prometheus/client_js) under the hood with optional support for [@platformatic/prom-client](https://github.com/platformatic/prom-client) as a high-performance drop-in replacement.

This plugin also adds two http metrics for your routes:

- Requests duration histogram
- Requests duration summary

## ToC

- [fastify-metrics](#fastify-metrics)
  - [ToC](#toc)
  - [Fastify support](#fastify-support)
  - [Notable changes](#notable-changes)
    - [v14.x.x](#v14xx)
    - [v12.x.x](#v12xx)
    - [v11.x.x](#v11xx)
    - [v10.x.x](#v10xx)
    - [v9.x.x](#v9xx)
    - [v6.x.x](#v6xx)
  - [Installation](#installation)
  - [Using @platformatic/prom-client](#using-platformaticprom-client)
  - [Features and requirements](#features-and-requirements)
  - [Usage](#usage)
    - [Registry clear](#registry-clear)
    - [Securing the metrics endpoint](#securing-the-metrics-endpoint)
    - [Plugin options](#plugin-options)
      - [Metrics endpoint](#metrics-endpoint)
      - [Route metrics](#route-metrics)
        - [Route metrics enabled](#route-metrics-enabled)
        - [Route blacklist](#route-blacklist)
        - [Route timing](#route-timing)
        - [Error handling](#error-handling)
        - [Label cardinality](#label-cardinality)
        - [Route metrics overrides](#route-metrics-overrides)
          - [Labels](#labels)
          - [Request durations summary](#request-durations-summary)
          - [Request durations histogram](#request-durations-histogram)
    - [Caveats](#caveats)
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
- **v11.x.x** - supports `fastify-4.x` `prom-client-15.x`
- **v12.x.x** - supports `fastify-5.x` `prom-client-15.x`
- **v14.x.x** - supports `fastify-5.x` `@prometheus-io/client-0.16.x`

## Notable changes

### v14.x.x

- Replace the deprecated `prom-client` dependency with its official successor
  [@prometheus-io/client](https://github.com/prometheus/client_js), now maintained by the
  Prometheus team.
- Drop node.js 20 support. `@prometheus-io/client` requires node.js `>=22`.

### v12.x.x

- Fastify v5 support.
- Drop node.js 18 support.

### v11.x.x

- Drop node.js 16 support.
- Upgrade to prom-client 15.1.

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

## Using @platformatic/prom-client

This plugin supports [@platformatic/prom-client](https://github.com/platformatic/prom-client) as an optional drop-in replacement for `@prometheus-io/client`. It is a performance-focused fork by [Platformatic](https://platformatic.dev/) that provides the same API with lower overhead — optimized internal data structures, reduced memory allocations, and faster metric serialization.

**If `@platformatic/prom-client` is installed, the plugin will use it automatically.** No configuration changes needed. If it's not installed, the plugin falls back to `@prometheus-io/client`. If it is installed but cannot be used (for example it fails to load or does not expose a prom-client compatible API), the plugin also falls back and emits a process warning with code `FSTMETRICS_CLIENT_FALLBACK`.

### Why use it

|                          | `@prometheus-io/client` | `@platformatic/prom-client` |
| ------------------------ | ----------------------- | --------------------------- |
| **API**                  | Standard                | Same (drop-in compatible)   |
| **Internal storage**     | `hashMap`               | Optimized `LabelMap`        |
| **Memory allocations**   | Standard                | Reduced                     |
| **Metric serialization** | Standard                | Faster                      |
| **Node.js support**      | ^22 \|\| ^24 \|\| >=26  | ^20 \|\| ^22 \|\| >=24      |

### Installation

Just install it alongside `fastify-metrics`:

```sh
npm i @platformatic/prom-client
pnpm i @platformatic/prom-client
```

The plugin auto-detects it on startup. No code changes required.

### Client selection

The `promClient` option selects the client implementation:

| Value             | Behaviour                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `null` / `'auto'` | Default. Uses `@platformatic/prom-client` if it is installed and usable, otherwise `@prometheus-io/client`. Failures other than "package not installed" emit a warning. |
| `'prometheus-io'` | Always uses `@prometheus-io/client`.                                                                                                                                    |
| `'platformatic'`  | Requires `@platformatic/prom-client`. Registration fails with an explicit error if it is not installed or does not expose a compatible API.                             |
| client object     | Used as-is and not validated.                                                                                                                                           |

The warning has code `FSTMETRICS_CLIENT_FALLBACK` and can be observed with `process.on('warning', ...)`.

### Explicit client override

You can also pass the client explicitly via the `promClient` option. This takes precedence over auto-detection:

```js
import client from '@platformatic/prom-client';
import fastify from 'fastify';
import metricsPlugin from 'fastify-metrics';

const app = fastify();
await app.register(metricsPlugin, {
  endpoint: '/metrics',
  promClient: client,
});
```

To select a client by name instead:

```js
await app.register(metricsPlugin, { promClient: 'platformatic' });
```

Use `fastify.metrics.client` to create custom metrics, so that they are registered with the same client (and registry) as the plugin metrics.

### Verifying which client is active

After registration, `fastify.metrics.client` holds the resolved prometheus client instance. You can check which one is being used:

```js
await app.ready();
console.log(app.metrics.client); // the active prometheus client module
```

<sub>[Back to top](#toc)</sub>

## Features and requirements

- Collects default server metrics (see [@prometheus-io/client](https://github.com/prometheus/client_js/tree/master/lib/metrics));
- Collects route response timings
- Adds `metrics` to fastify instance for your custom metrics.

---

- Requires fastify `>=5.0.0`.
- Node.js `>=22.0.0`.

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

After calling `registry.clear()` all metrics are removed from registry. In order to add them again to the registry, call `fastify.metrics.initMetricsInRegistry`.

Requirements and behaviour:

- Clear every registry the plugin registers into before calling it, including any custom `registers` you configured in `overrides`. Registering a metric that already exists in a registry throws.
- Samples collected before re-initialization are not preserved.
- Requests that are in flight during re-initialization record to the previous instruments when `routeMetrics.timing` is `'timers'`, and to the current instruments when it is `'elapsedTime'`.
- When `routeMetrics.maxSeries` is set, the admitted label tuples are forgotten on re-initialization.

```js
app.metrics.client.register.clear();
app.metrics.initMetricsInRegistry();
```

<sub>[Back to top](#toc)</sub>

### Securing the metrics endpoint

The metrics endpoint is **unauthenticated by default**. Metrics can reveal route names, traffic volumes and runtime details, so restrict access to it in production.

Protect the endpoint with a hook by passing a route options object:

```js
import fastify from 'fastify';
import metricsPlugin from 'fastify-metrics';

const app = fastify();

const authHook = async (request, reply) => {
  if (request.headers.authorization !== `Bearer ${process.env.METRICS_TOKEN}`) {
    await reply.code(401).send();
  }
};

await app.register(metricsPlugin, {
  endpoint: { url: '/metrics', onRequest: authHook },
});
```

Alternatively, disable the built-in endpoint with `endpoint: null` and expose the registry from a separate internal Fastify instance that listens only on a private interface:

```js
import fastify from 'fastify';
import metricsPlugin from 'fastify-metrics';

const app = fastify();
await app.register(metricsPlugin, { endpoint: null });

const internal = fastify();
internal.get('/metrics', async (request, reply) => {
  const registry = app.metrics.client.register;
  return reply.type(registry.contentType).send(await registry.metrics());
});
await internal.listen({ host: '127.0.0.1', port: 9091 });
```

Binding to a private interface is a deployment control, not authentication: combine it with network policies where needed. Do not register the plugin twice against the same global registry; use a single registration and share its registry.

<sub>[Back to top](#toc)</sub>

### Plugin options

See for details [docs](docs/api/fastify-metrics.imetricspluginoptions.md)

| Property                                                                                        | Type                                                                                                                | Default Value       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| [clearRegisterOnInit?](./docs/api/fastify-metrics.imetricspluginoptions.clearregisteroninit.md) | boolean                                                                                                             | `false`             |
| [defaultMetrics?](./docs/api/fastify-metrics.imetricspluginoptions.defaultmetrics.md)           | [IDefaultMetricsConfig](./docs/api/fastify-metrics.idefaultmetricsconfig.md)                                        | `{ enabled: true }` |
| [endpoint?](./docs/api/fastify-metrics.imetricspluginoptions.endpoint.md)                       | string \| null \| [`Fastify.RouteOptions`](https://www.fastify.io/docs/api/latest/Reference/Routes/#routes-options) | `'/metrics'`        |
| [endpointLogLevel?](./docs/api/fastify-metrics.imetricspluginoptions.endpointloglevel.md)       | Fastify `LogLevel`                                                                                                  | `'fatal'`           |
| [name?](./docs/api/fastify-metrics.imetricspluginoptions.name.md)                               | string                                                                                                              | `'metrics'`         |
| [promClient?](./docs/api/fastify-metrics.imetricspluginoptions.promclient.md)                   | client instance \| `null` \| `'auto'` \| `'prometheus-io'` \| `'platformatic'`                                      | `null`              |
| [routeMetrics?](./docs/api/fastify-metrics.imetricspluginoptions.routemetrics.md)               | [IRouteMetricsConfig](./docs/api/fastify-metrics.iroutemetricsconfig.md)                                            | `{ enabled: true }` |

#### Metrics endpoint

- `endpoint` is a URL string, `null` (do not expose the endpoint) or a Fastify `RouteOptions` object. In the object form `method` and `handler` are optional: the plugin always serves `GET` with its own handler, and the object you pass is not modified.
- `endpointLogLevel` sets the log level of the endpoint route when `endpoint` is a string. The default `'fatal'` keeps the endpoint quiet; consider `'error'` so failures while serving a scrape are logged. With an object `endpoint`, set `logLevel` on the object instead.

#### Route metrics

| Property                                                                                        | Type                                                                                          | Default Value                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| [enabled?](./docs/api/fastify-metrics.iroutemetricsconfig.enabled.md)                           | boolean \| { histogram: boolean, summary: boolean }                                           | `true`                                 |
| [groupStatusCodes?](./docs/api/fastify-metrics.iroutemetricsconfig.groupstatuscodes.md)         | boolean                                                                                       | `false`                                |
| [invalidRouteGroup?](./docs/api/fastify-metrics.iroutemetricsconfig.invalidroutegroup.md)       | string                                                                                        | `'__unknown__'`                        |
| [methodBlacklist?](./docs/api/fastify-metrics.iroutemetricsconfig.methodblacklist.md)           | readonly string\[\]                                                                           | `['HEAD','OPTIONS','TRACE','CONNECT']` |
| [customLabels?](./docs/api/fastify-metrics.iroutemetricsconfig.customlabels.md)                 | Record&lt;string, string \| ((request: FastifyRequest, reply: FastifyReply) =&gt; string)&gt; | `undefined`                            |
| [overrides?](./docs/api/fastify-metrics.iroutemetricsconfig.overrides.md)                       | [IRouteMetricsOverrides](./docs/api/fastify-metrics.iroutemetricsoverrides.md)                |                                        |
| [registeredRoutesOnly?](./docs/api/fastify-metrics.iroutemetricsconfig.registeredroutesonly.md) | boolean                                                                                       | `true`                                 |
| [routeBlacklist?](./docs/api/fastify-metrics.iroutemetricsconfig.routeblacklist.md)             | readonly (string \| RegExp)\[\]                                                               | `undefined`                            |
| [maxSeries?](./docs/api/fastify-metrics.iroutemetricsconfig.maxseries.md)                       | number                                                                                        | `undefined` (unlimited)                |
| [onError?](./docs/api/fastify-metrics.iroutemetricsconfig.onerror.md)                           | (error: unknown, request: FastifyRequest, reply: FastifyReply) =&gt; void                     | logs with `request.log.error`          |
| [timing?](./docs/api/fastify-metrics.iroutemetricsconfig.timing.md)                             | `'timers'` \| `'elapsedTime'`                                                                 | `'timers'`                             |

##### Route metrics enabled

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

##### Route blacklist

`routeBlacklist` excludes routes from route metrics. String entries must equal the route; RegExp entries are tested against it. When `registeredRoutesOnly` is `false`, patterns are also matched against the raw request URL for requests that do not match a registered route, so keep patterns simple and linear-time. RegExp entries with the `g` or `y` flag are matched statelessly and are not modified.

##### Route timing

`timing` selects how the request duration is measured:

- `'timers'` (default) starts prom-client timers when the request arrives. Timers stay bound to the instruments registered at that time.
- `'elapsedTime'` starts no timers and observes `reply.elapsedTime` on the current instruments when the response is sent.

##### Error handling

A failure while computing labels or recording a request (for example a throwing `customLabels` function or `getRouteLabel`) never affects the response. By default the error is logged with `request.log.error`. Provide `onError` to handle it yourself:

```js
await app.register(metricsPlugin, {
  routeMetrics: {
    onError: (error, request, reply) => {
      request.log.warn({ err: error }, 'metrics failure');
    },
  },
});
```

Errors thrown by `onError`, and promises it returns, are ignored and never awaited.

##### Label cardinality

Every distinct combination of label values creates separate histogram and summary series, held in memory and exported on every scrape. Use label values from small, bounded sets:

```js
const KNOWN_CLIENTS = new Set(['web', 'ios', 'android']);

await app.register(metricsPlugin, {
  routeMetrics: {
    customLabels: {
      client: (request) => {
        const value = request.headers['x-client'];
        return typeof value === 'string' && KNOWN_CLIENTS.has(value)
          ? value
          : 'other';
      },
    },
    overrides: {
      labels: {
        // Route template with a fixed fallback
        getRouteLabel: (request) => request.routeOptions.url ?? 'unmatched',
      },
    },
  },
});
```

Avoid labels built from raw URLs, unmapped header values or identifiers. As a safety net, set `maxSeries`: it limits the number of distinct label tuples admitted per plugin instance (each tuple maps to many histogram and summary series, so this is not a byte limit). Once the limit is reached, new tuples are recorded with every label except method and status set to `'__overflow__'`; tuples admitted earlier keep recording normally, and a single warning is logged. `maxSeries` must be a positive integer.

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

| Property                                                                            | Type                                   | Default value   |
| ----------------------------------------------------------------------------------- | -------------------------------------- | --------------- |
| [getRouteLabel?](./docs/api/fastify-metrics.iroutelabelsoverrides.getroutelabel.md) | (request: FastifyRequest) =&gt; string | `undefined`     |
| [method?](./docs/api/fastify-metrics.iroutelabelsoverrides.method.md)               | string                                 | `'method'`      |
| [route?](./docs/api/fastify-metrics.iroutelabelsoverrides.route.md)                 | string                                 | `'route'`       |
| [status?](./docs/api/fastify-metrics.iroutelabelsoverrides.status.md)               | string                                 | `'status_code'` |

###### Request durations summary

| Property                                                                    | Type       | Default value                           |
| --------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| [name?](./docs/api/fastify-metrics.isummaryoverrides.name.md)               | string     | `'http_request_summary_seconds'`        |
| [help?](./docs/api/fastify-metrics.isummaryoverrides.help.md)               | string     | `'request duration in seconds summary'` |
| [percentiles?](./docs/api/fastify-metrics.isummaryoverrides.percentiles.md) | number\[\] | `[0.5, 0.9, 0.95, 0.99]`                |

###### Request durations histogram

| Property                                                              | Type       | Default value                     |
| --------------------------------------------------------------------- | ---------- | --------------------------------- |
| [name?](./docs/api/fastify-metrics.ihistogramoverrides.name.md)       | string     | `'http_request_duration_seconds'` |
| [help?](./docs/api/fastify-metrics.ihistogramoverrides.help.md)       | string     | `'request duration in seconds'`   |
| [buckets?](./docs/api/fastify-metrics.ihistogramoverrides.buckets.md) | number\[\] | `[0.05, 0.1, 0.5, 1, 3, 5, 10]`   |

<sub>[Back to top](#toc)</sub>

### Caveats

- `clearRegisterOnInit` clears the global registry of the **selected** client (see [client selection](#client-selection)), which may differ from the one you imported yourself.
- When the plugin merges several registries for the endpoint, registry default labels are not preserved.
- The plugin requires Fastify 5.
- Create custom metrics with `fastify.metrics.client` so they use the same client as the plugin.

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

## Support Ukraine

If you find this project useful, please consider [supporting Ukraine's defense](./SPONSOR.md).

## License

Licensed under [MIT](./LICENSE).

<sub>[Back to top](#toc)</sub>
