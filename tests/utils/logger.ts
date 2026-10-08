/**
 * tests/utils/logger.ts
 *
 * Tiny structured logger so test output stays deterministic and
 * greppable. Honour LOG_LEVEL from env (debug | info | warn | error).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const ACTIVE = RANK[((process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info')] ?? RANK.info;

const format = (level: LogLevel, msg: string, meta?: Record<string, unknown>): string => {
  const ts = new Date().toISOString();
  const body = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  return `${ts} [${level.toUpperCase()}] ${msg}${body}`;
};

export const logger = {
  debug(msg: string, meta?: Record<string, unknown>): void {
    if (ACTIVE <= RANK.debug) console.log(format('debug', msg, meta));
  },
  info(msg: string, meta?: Record<string, unknown>): void {
    if (ACTIVE <= RANK.info) console.log(format('info', msg, meta));
  },
  warn(msg: string, meta?: Record<string, unknown>): void {
    if (ACTIVE <= RANK.warn) console.warn(format('warn', msg, meta));
  },
  error(msg: string, meta?: Record<string, unknown>): void {
    if (ACTIVE <= RANK.error) console.error(format('error', msg, meta));
  }
};
