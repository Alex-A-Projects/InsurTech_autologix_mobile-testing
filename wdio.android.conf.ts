/**
 * wdio.android.conf.ts
 *
 * Run with:
 *     npx wdio run wdio.android.conf.ts
 * or:
 *     npm run test:android
 *
 * Boots Appium 2/3 + UiAutomator2 against an already-running Samsung Galaxy
 * emulator (Android Studio must have the AVD installed; we do not download
 * it here). Chrome launches on demand.
 */
import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';
import { androidCapabilities } from './config/capabilities/android.samsung';
import { env } from './config/env';

export const config: Options.Testrunner = {
  ...sharedConfig,
  suiteName: 'AutoLogix — Android / Chrome (Samsung Galaxy Emulator)',

  // ---- Services -----------------------------------------------------------
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: env.appium.host,
          port: env.appium.port,
          basePath: '/wd/hub',
          relaxedSecurityEnabled: true,
          defaultCapabilities: { 'appium:newCommandTimeout': env.android.newCommandTimeoutSec }
        },
        logPath: './test-results/wdio-logs/appium-android.log',
        install: { auto: false }
      }
    ]
  ],

  // ---- Capabilities -------------------------------------------------------
  capabilities: [...androidCapabilities] as Options.Testrunner['capabilities'],
  maxInstances: 1,

  // ---- Base URL -----------------------------------------------------------
  baseUrl: env.app.baseUrl,

  // ---- Server handshake --------------------------------------------------
  hostname: env.appium.host,
  port: env.appium.port,
  path: '/wd/hub',
  protocol: 'http',
  strictSSL: false
};
