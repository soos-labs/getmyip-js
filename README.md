# getmyip-pro (Node.js)

Tiny, dependency-free Node.js client **and CLI** for the [getmyip.pro](https://getmyip.pro) IP geolocation API — privacy-first (no logs, no trackers), with ip-api-compatible JSON.

> Free anonymous lookups: 60 requests/min and 10,000/day, no signup or key.
> Batch requests require an API key (up to 100 IPs on the free-key tier). If you
> hit a limit, email tech@getmyip.pro.

[![Test](https://github.com/soos-labs/getmyip-js/actions/workflows/test.yml/badge.svg)](https://github.com/soos-labs/getmyip-js/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/getmyip-pro)](https://www.npmjs.com/package/getmyip-pro)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## CLI

```sh
npm install -g getmyip-pro   # или npx getmyip-pro
```

```console
$ getmyip
IP:       45.82.64.40
Location: Naaldwijk, Netherlands (NL)
Network:  WorldStream B.V. (AS49981)
Timezone: Europe/Amsterdam

$ getmyip 8.8.8.8
IP:       8.8.8.8
Location: United States (US)
Network:  Google LLC (AS15169)

$ getmyip --field org 8.8.8.8
Google LLC

$ getmyip --json 8.8.8.8
{"ip":"8.8.8.8","country":"United States",...}
```

An API key is optional (the anonymous tier needs none); pass `--key` or set `GETMYIP_API_KEY` for higher limits. Point the CLI at a self-hosted instance with `GETMYIP_BASE_URL`.

## Library

```js
import { Client } from "getmyip-pro";

const c = new Client();                    // new Client({ apiKey: "..." }) to raise limits
const me = await c.me();                   // your own IP
const r = await c.lookup("8.8.8.8");       // any IPv4/IPv6
const keyedClient = new Client({ apiKey: "YOUR_API_KEY" }); // batch requires a key
const rs = await keyedClient.batch(["8.8.8.8", "1.1.1.1"]);

console.log(r.country, r.org, r.asn);      // United States Google LLC 15169
```

Errors throw `APIError` with `.status` and `.error` (e.g. `rate_limited` — see [limits](https://getmyip.pro/limits)).

No dependencies: built-in `fetch` only. Node 18+.

## API contract

The clients call `GET /v1/json` for the caller, `GET /v1/{ip}` for an IPv4 or
IPv6 lookup, and `POST /v1/batch` for a batch. Anonymous requests default to 60
per minute and 10,000 per day. Batch requests require an API key and allow up to
100 IPs on the free-key tier or 1,000 on the Pro tier by default. Limits can be
changed by service configuration. See the [current API documentation](https://docs.getmyip.pro)
for response fields, errors, and the current limits.

## Related

- Go client/CLI: [soos-labs/getmyip-go](https://github.com/soos-labs/getmyip-go)
- Python client/CLI: [soos-labs/getmyip-python](https://github.com/soos-labs/getmyip-python)
- API docs: [docs.getmyip.pro](https://docs.getmyip.pro)
