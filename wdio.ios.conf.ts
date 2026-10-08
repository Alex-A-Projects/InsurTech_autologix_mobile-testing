/**
 * wdio.ios.conf.ts
 *
 * Run with:
 *     npx wdio run wdio.ios.conf.ts
 * or:
 *     npm run test:ios
 *
 * Boots Appium 2/3 + XCUITest against an already-running iPhone 17-series
 * Simulator (Xcode must have the device installed; we do not download or
 * create it here). Mobile Safari launches on demand.
 */
import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';
import { iosCapabilities } from './config/capabilities/ios.iphone';
import { env } from './config/env';

export const config: Options.Testrunner = {
  ...sharedConfig,
  // Stable suite name — appears in Allure dashboards.
  suiteName: 'AutoLogix — iOS / Safari (iPhone 17 Simulator)',

  // ---- Services -----------------------------------------------------------
  // The Appium service starts/stops the server alongside the test run,
  // installs the XCUITest driver if missing, and exposes its log as
  // `appium.log` in the working directory.
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: env.appium.host,
          port: env.appium.port,
          basePath: '/wd/hub',
          // -- Relaxed security master switch; CI must keep the secure one.
          relaxedSecurityEnabled: true,
          // -- Enable the Appium Inspector when an engineer wants to debug.
          //    Uncomment if you run `npm run appium:inspector` style workflows.
          // allowInsecure: ['chromedriver_autodownload'],
          defaultCapabilities: { 'appium:newCommandTimeout': env.ios.newCommandTimeoutSec }
        },
        logPath: './test-results/wdio-logs/appium-ios.log',
        install: { auto: false }
      }
    ]
  ],

  // ---- Capabilities -------------------------------------------------------
  capabilities: [...iosCapabilities] as Options.Testrunner['capabilities'],
  maxInstances: 1,

  // ---- Base URL -----------------------------------------------------------
  baseUrl: env.app.baseUrl,

  // ---- Mobile-web session defaults ---------------------------------------
  // WebdriverIO forwards these into every `browser.url()` call.
  hostname: env.appium.host,
  port: env.appium.port,
  path: '/wd/hub',
  protocol: 'http',
  strictSSL: false
};
