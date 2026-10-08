/**
 * config/env.ts
 *
 * Centralised, validated access to environment variables. Loaded once at
 * process start so every config (and every test) reads from a typed
 * object instead of `process.env` peppered throughout the codebase.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function asInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function required(value: string | undefined, key: string): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var ${key} — copy .env.example to .env.`);
  }
  return value;
}

export const env = {
  app: {
    baseUrl: required(process.env.APP_BASE_URL, 'APP_BASE_URL'),
    apiBaseUrl: required(process.env.API_BASE_URL, 'API_BASE_URL'),
    browserLocale: process.env.BROWSER_LOCALE ?? 'en-US',
    pageLocale: process.env.PAGE_LOCALE ?? 'pl-PL'
  },
  accounts: {
    customer: {
      email: process.env.USER_EMAIL ?? '',
      password: process.env.USER_PASSWORD ?? ''
    },
    insurer: {
      email: process.env.INSURER_EMAIL ?? '',
      password: process.env.INSURER_PASSWORD ?? ''
    },
    service: {
      email: process.env.SERVICE_EMAIL ?? '',
      password: process.env.SERVICE_PASSWORD ?? ''
    }
  },
  test: {
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mochaTimeoutMs: asInt(process.env.MOCHA_TIMEOUT, 60_000),
    expectTimeoutMs: asInt(process.env.EXPECT_TIMEOUT, 10_000),
    specTimeoutMs: asInt(process.env.SPEC_TIMEOUT, 120_000),
    retries: asInt(process.env.RETRIES, 1)
  },
  ios: {
    deviceName: process.env.IOS_DEVICE_NAME ?? 'iPhone 17',
    platformVersion: process.env.IOS_PLATFORM_VERSION ?? '18.2',
    bundleId: process.env.IOS_BUNDLE_ID ?? 'com.apple.mobilesafari',
    wdaPort: asInt(process.env.IOS_WDA_PORT, 8100),
    newCommandTimeoutSec: asInt(process.env.IOS_NEW_COMMAND_TIMEOUT, 180)
  },
  android: {
    deviceName: process.env.ANDROID_DEVICE_NAME ?? 'Samsung Galaxy S25',
    platformVersion: process.env.ANDROID_PLATFORM_VERSION ?? '14.0',
    browserName: process.env.ANDROID_BROWSER_NAME ?? 'Chrome',
    chromedriverAutodownload: asBool(process.env.ANDROID_CHROMEDRIVER_AUTODOWNLOAD, true),
    avdReadyTimeoutMs: asInt(process.env.ANDROID_AVD_READY_TIMEOUT, 180_000),
    newCommandTimeoutSec: asInt(process.env.ANDROID_NEW_COMMAND_TIMEOUT, 180)
  },
  appium: {
    host: process.env.APPIUM_HOST ?? '127.0.0.1',
    port: asInt(process.env.APPIUM_PORT, 4723),
    logLevel: process.env.APPIUM_LOG_LEVEL ?? 'info'
  },
  allure: {
    resultsDir: process.env.ALLURE_RESULTS_DIR ?? 'allure-results',
    reportDir: process.env.ALLURE_REPORT_DIR ?? 'allure-report'
  }
} as const;

export type AppEnv = typeof env;
