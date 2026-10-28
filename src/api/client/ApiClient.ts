import type { APIRequestContext, APIResponse } from '@playwright/test';
import { test } from '@playwright/test';

export type ApiResponse<T> = {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  /** Parsed JSON body; raw text when the body is not JSON; undefined when empty. */
  data: T;
  durationMs: number;
  raw: APIResponse;
};

export type RequestOptions = {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
};

export type ApiClientOptions = {
  token?: string;
  /** Called once on 401/403 when a token was sent; returns a fresh token for a single retry. */
  refreshToken?: () => Promise<string>;
  /** Builds auth headers from the token. Default: `Authorization: Bearer <token>`. */
  authHeaders?: (token: string) => Record<string, string>;
};

const SENSITIVE_HEADERS = /^(authorization|cookie|set-cookie)$/i;
const SENSITIVE_BODY_KEYS = /pass(word)?|token/i;

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, SENSITIVE_HEADERS.test(k) ? '***' : v]),
  );
}

function redactBody(body: unknown): unknown {
  if (Array.isArray(body)) return body.map(redactBody);
  if (body && typeof body === 'object') {
    return Object.fromEntries(
      Object.entries(body).map(([k, v]) => [
        k,
        SENSITIVE_BODY_KEYS.test(k) ? '***' : redactBody(v),
      ]),
    );
  }
  return body;
}

/** Thin, typed wrapper over APIRequestContext. No assertions: callers (specs) assert. */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private options: ApiClientOptions = {},
  ) {}

  get<T>(path: string, opts?: RequestOptions) {
    return this.send<T>('GET', path, opts);
  }
  post<T>(path: string, opts?: RequestOptions) {
    return this.send<T>('POST', path, opts);
  }
  put<T>(path: string, opts?: RequestOptions) {
    return this.send<T>('PUT', path, opts);
  }
  patch<T>(path: string, opts?: RequestOptions) {
    return this.send<T>('PATCH', path, opts);
  }
  delete<T>(path: string, opts?: RequestOptions) {
    return this.send<T>('DELETE', path, opts);
  }

  private authHeaders(): Record<string, string> {
    const { token, authHeaders } = this.options;
    if (!token) return {};
    return authHeaders ? authHeaders(token) : { Authorization: `Bearer ${token}` };
  }

  private async send<T>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    let headers = { Accept: 'application/json', ...this.authHeaders(), ...opts.headers };
    const started = Date.now();
    const fetchOnce = () =>
      this.request.fetch(path, { method, headers, params: opts.params, data: opts.data });
    let raw = await fetchOnce();
    const { token, refreshToken } = this.options;
    if (token && refreshToken && (raw.status() === 401 || raw.status() === 403)) {
      this.options = { ...this.options, token: await refreshToken() };
      headers = { Accept: 'application/json', ...this.authHeaders(), ...opts.headers };
      raw = await fetchOnce();
    }
    const durationMs = Date.now() - started;
    const text = await raw.text();
    let data: unknown = text === '' ? undefined : text;
    if (text !== '') {
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON body: keep raw text.
      }
    }
    const response: ApiResponse<T> = {
      status: raw.status(),
      ok: raw.ok(),
      headers: raw.headers(),
      data: data as T,
      durationMs,
      raw,
    };
    await this.attachLog(method, path, headers, opts, response);
    return response;
  }

  private async attachLog(
    method: string,
    path: string,
    headers: Record<string, string>,
    opts: RequestOptions,
    res: ApiResponse<unknown>,
  ) {
    let info;
    try {
      info = test.info();
    } catch {
      return; // Used outside a running test: nothing to attach to.
    }
    const log = {
      request: {
        method,
        url: res.raw.url(),
        headers: redactHeaders(headers),
        params: opts.params,
        body: redactBody(opts.data),
      },
      response: {
        status: res.status,
        durationMs: res.durationMs,
        headers: redactHeaders(res.headers),
        body: redactBody(res.data),
      },
    };
    await info.attach(`api ${method} ${path} -> ${res.status}`, {
      body: JSON.stringify(log, null, 2),
      contentType: 'application/json',
    });
  }
}
