// Тесты клиента: fetch мокается, сеть не нужна.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { APIError, Client } from "../index.js";

const SAMPLE = { ip: "8.8.8.8", country: "United States", country_code: "US", asn: 15169, org: "Google LLC" };
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function mockFetch(payload, status = 200) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
  };
  return calls;
}

test("me", async () => {
  const calls = mockFetch(SAMPLE);
  const r = await new Client().me();
  assert.equal(r.ip, "8.8.8.8");
  assert.equal(calls[0].url, "https://api.getmyip.pro/v1/json");
  assert.match(calls[0].init.headers["User-Agent"], /^getmyip-pro-js\//);
});

test("lookup escapes ip", async () => {
  const calls = mockFetch(SAMPLE);
  await new Client().lookup("2001:db8::1");
  assert.equal(calls[0].url, "https://api.getmyip.pro/v1/2001%3Adb8%3A%3A1");
});

test("batch", async () => {
  mockFetch({ results: [SAMPLE, SAMPLE] });
  const rs = await new Client().batch(["8.8.8.8", "1.1.1.1"]);
  assert.equal(rs.length, 2);
});

test("api key header", async () => {
  const calls = mockFetch(SAMPLE);
  await new Client({ apiKey: "k1" }).me();
  assert.equal(calls[0].init.headers["X-API-Key"], "k1");
});

test("api error carries status and code", async () => {
  mockFetch({ error: "rate_limited" }, 429);
  await assert.rejects(() => new Client().me(), (e) => {
    assert.ok(e instanceof APIError);
    assert.equal(e.status, 429);
    assert.equal(e.error, "rate_limited");
    return true;
  });
});
