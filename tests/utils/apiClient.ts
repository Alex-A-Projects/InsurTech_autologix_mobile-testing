/**
 * tests/utils/apiClient.ts
 *
 * Tiny HTTP helper used by tests that need to fetch a known piece of
 * state (e.g. an existing vehicle id) before exercising the mobile-web UI.
 * Kept deliberately minimal — heavier REST tooling is out of scope for
 * the mobile-web check.
 */
import { env } from '../../config/env';
import { logger } from './logger';

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export class ApiClient {
  private token: string | null = null;

  async login(email: string, password: string): Promise<void> {
    const r = await this.post<{ token: string }>('/auth/login', { email, password });
    if (r.status !== 200 || !r.data?.token) {
      throw new Error(`Login failed: ${r.status} ${JSON.stringify(r.data)}`);
    }
    this.token = r.data.token;
    logger.info('API login ok', { email });
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = `${env.app.apiBaseUrl}${path}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      // Non-JSON response — keep raw text
    }

    return { status: response.status, data: parsed as T };
  }
}
