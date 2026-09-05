// Интеграционные тесты CLI: реальный локальный HTTP-сервер, cli.js запускается
// child_process'ом и наводится через GETMYIP_BASE_URL.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import http from "node:http";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../cli.js", import.meta.url));

const ROUTES = {
  "/v1/json": [200, { ip: "45.82.64.40", country: "Netherlands", country_code: "NL", org: "WorldStream B.V.", asn: 49981 }],
  "/v1/8.8.8.8": [200, { ip: "8.8.8.8", country: "United States", country_code: "US", org: "Google LLC", asn: 15169, timezone: "America/Chicago" }],
  "/v1/bad": [400, { error: "invalid ip" }],
};

let srv, base;
before(async () => {
  srv = http.createServer((req, res) => {
    const [status, payload] = ROUTES[req.url] ?? [404, { error: "not found" }];
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  });
  await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => srv.close());

function runCli(...args) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [CLI, ...args],
      { env: { ...process.env, GETMYIP_BASE_URL: base } },
      (err, stdout, stderr) => resolve({ code: err?.code ?? 0, stdout, stderr }),
    );
  });
}

test("cli human lookup", async () => {
  const { code, stdout } = await runCli("8.8.8.8");
  assert.equal(code, 0);
  for (const want of ["IP:       8.8.8.8", "United States (US)", "Google LLC (AS15169)", "America/Chicago"]) {
    assert.ok(stdout.includes(want), `missing ${want} in:\n${stdout}`);
  }
});

test("cli me", async () => {
  const { code, stdout } = await runCli();
  assert.equal(code, 0);
  assert.ok(stdout.includes("45.82.64.40"));
});

test("cli --json", async () => {
  const { code, stdout } = await runCli("--json", "8.8.8.8");
  assert.equal(code, 0);
  assert.equal(JSON.parse(stdout).ip, "8.8.8.8");
});

test("cli --field", async () => {
  const { code, stdout } = await runCli("--field", "org", "8.8.8.8");
  assert.equal(code, 0);
  assert.equal(stdout.trim(), "Google LLC");
});

test("cli unknown field exits 1", async () => {
  const { code, stderr } = await runCli("--field", "nope", "8.8.8.8");
  assert.equal(code, 1);
  assert.match(stderr, /unknown field/);
});

test("cli api error exits 1", async () => {
  const { code, stderr } = await runCli("bad");
  assert.equal(code, 1);
  assert.match(stderr, /invalid ip/);
});
