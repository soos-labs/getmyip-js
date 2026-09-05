export declare const DEFAULT_BASE_URL: string;
export declare const VERSION: string;

/** A single geolocation lookup response (ip-api-compatible field set). */
export interface Result {
  ip: string;
  ip_version: number;
  is_private: boolean;
  country_code: string;
  country: string;
  region: string;
  city: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  asn: number;
  org: string;
  hostname?: string;
  /** поля, которых клиент ещё не знает, приходят как есть */
  [extra: string]: unknown;
}

/** Non-200 API response; carries HTTP status and the API's error code. */
export declare class APIError extends Error {
  status: number;
  error: string;
  constructor(status: number, error?: string);
}

export interface ClientOptions {
  /** Optional — the free anonymous tier needs no key; a key raises rate limits. */
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

/** Talks to the getmyip API. */
export declare class Client {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  constructor(opts?: ClientOptions);
  /** Geolocation for the caller's own public IP. */
  me(): Promise<Result>;
  /** Geolocation for the given IPv4 or IPv6 address. */
  lookup(ip: string): Promise<Result>;
  /** Look up many addresses in a single request. */
  batch(ips: string[]): Promise<Result[]>;
}

export default Client;
