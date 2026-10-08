/**
 * tests/utils/validators.ts
 *
 * Small assertions that don't fit cleanly inside page objects — e.g.
 * pre-flight checks against environment, viewport sanity checks, etc.
 */
import { env } from '../../config/env';
import { hasCredentials, Role } from './credentials';

export const requireCredentials = (role: Role): void => {
  if (!hasCredentials(role)) {
    throw new Error(`No credentials configured for role "${role}". Copy .env.example to .env.`);
  }
};

export const requireBaseUrl = (): string => {
  if (!env.app.baseUrl) throw new Error('APP_BASE_URL is not set.');
  return env.app.baseUrl;
};
