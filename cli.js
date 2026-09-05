#!/usr/bin/env node
// CLI: `getmyip [--json] [--field name] [--key KEY] [ip]` — как у getmyip-go.

import { APIError, Client } from "./index.js";

function usage() {
  console.error("usage: getmyip [--json] [--field name] [--key KEY] [ip]");
  process.exit(2);
}

const args = process.argv.slice(2);
let ip, json = false, field, key = process.env.GETMYIP_API_KEY ?? "";
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--json" || a === "-json") json = true;
  else if (a === "--field" || a === "-field") field = args[++i] ?? usage();
  else if (a === "--key" || a === "-key") key = args[++i] ?? usage();
  else if (a === "--help" || a === "-h") usage();
  else if (a.startsWith("-")) usage();
  else if (ip === undefined) ip = a;
  else usage();
}

try {
  // GETMYIP_BASE_URL — свой инстанс (self-hosted) или мок в тестах
  const c = new Client({ apiKey: key, baseUrl: process.env.GETMYIP_BASE_URL || undefined });
  const r = ip ? await c.lookup(ip) : await c.me();
  if (field !== undefined) {
    if (!(field in r)) {
      console.error(`getmyip: unknown field '${field}'`);
      process.exit(1);
    }
    console.log(r[field]);
  } else if (json) {
    console.log(JSON.stringify(r));
  } else {
    console.log(`IP:       ${r.ip}`);
    const loc = [r.city, r.country].filter(Boolean).join(", ");
    if (loc) console.log(`Location: ${loc} (${r.country_code})`);
    if (r.org) console.log(`Network:  ${r.org}${r.asn ? ` (AS${r.asn})` : ""}`);
    if (r.timezone) console.log(`Timezone: ${r.timezone}`);
  }
} catch (e) {
  console.error(`getmyip: ${e instanceof APIError ? e.error || e.status : e.message}`);
  process.exit(1);
}
