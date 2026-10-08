/**
 * tests/utils/credentials.ts
 *
 * Account lookup helper. The published test accounts are loaded from .env
 * so CI can override them without touching test code.
 */
import { env } from '../../config/env';

export type Role = 'customer' | 'insurer' | 'service';

export interface Credentials {
  email: string;
  password: string;
  role: Role;
}

export const credentials = (role: Role): Credentials => {
  switch (role) {
    case 'customer':
      return { email: env.accounts.customer.email, password: env.accounts.customer.password, role };
    case 'insurer':
      return { email: env.accounts.insurer.email, password: env.accounts.insurer.password, role };
    case 'service':
      return { email: env.accounts.service.email, password: env.accounts.service.password, role };
  }
};

export const allRoles: Role[] = ['customer', 'insurer', 'service'];

export const hasCredentials = (role: Role): boolean => {
  const c = credentials(role);
  return Boolean(c.email && c.password);
};
