// Tiny, dependency-free Node.js client for the getmyip.pro IP geolocation API —
// privacy-first (no logs, no trackers), ip-api-compatible JSON.
// See https://getmyip.pro/docs (API at https://api.getmyip.pro). Node 18+ (fetch).

export const DEFAULT_BASE_URL = "https://api.getmyip.pro";
export const VERSION = "0.1.0";

/** Non-200 API response; carries HTTP status and the API's error code. */
export class APIError extends Error {
  constructor(status, error = "") {
    super(`getmyip: ${error || "unexpected status"} (status ${status})`);
    this.name = "APIError";
    this.status = status;
    this.error = error;
  }
}

/**
 * Talks to the getmyip API. An API key is optional — the free anonymous tier
 * needs none; a key (X-API-Key) raises rate limits.
 */
export class Client {
  /** @param {{apiKey?: string, baseUrl?: string, timeoutMs?: number}} [opts] */
  constructor({ apiKey = "", baseUrl = DEFAULT_BASE_URL, timeoutMs = 10_000 } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeoutMs = timeoutMs;
  }

  /** Geolocation for the caller's own public IP. */
  me() {
    return this.#request("GET", "/v1/json");
  }

  /** Geolocation for the given IPv4 or IPv6 address. */
  lookup(ip) {
    return this.#request("GET", "/v1/" + encodeURIComponent(ip));
  }

  /** Look up many addresses in a single request. */
  async batch(ips) {
    const out = await this.#request("POST", "/v1/batch", { ips });
    return out.results ?? [];
  }

  async #request(method, path, body) {
    const headers = {
      Accept: "application/json",
      // дефолтные UA скриптов режутся ботозащитой edge — представляемся собой
      "User-Agent": `getmyip-pro-js/${VERSION}`,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (this.apiKey) headers["X-API-Key"] = this.apiKey;
    const res = await fetch(this.baseUrl + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) {
      let err = "";
      try {
        err = (await res.json()).error ?? "";
      } catch {}
      throw new APIError(res.status, err);
    }
    return res.json();
  }
}

export default Client;
