/**
 * config/capabilities/android.samsung.ts
 *
 * Android Emulator — Chrome via UiAutomator2.
 *
 * The AVD is expected to be named (or match) `Samsung Galaxy S25` (the
 * Studio template), running an x86_64 system image with Google APIs /
 * Google Play and the latest stable Chrome. Override the device / version
 * via .env so the same config works against "Pixel 8" or "Samsung Galaxy
 * S24" if those are what your machine has installed.
 *
 * Implementation notes:
 *  - `chromedriverAutodownload: true` delegates the matching
 *    Chromedriver-and-Chrome version dance to Appium. Override with
 *    `appium:chromedriverChromeMappingFile` if your network requires a
 *    pinned mirror.
 *  - `autoGrantPermissions` is deliberately left OFF — the SPA must
 *    surface its own consent UI to be tested.
 *  - `unlockType` / `unlockKey` allow the session to recover an emulator
 *    that fell asleep during a long quiet period (test prep, install).
 */
import { env } from '../env';

export const androidCapabilities = [
  {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': env.android.deviceName,
    'appium:platformVersion': env.android.platformVersion,
    'appium:newCommandTimeout': env.android.newCommandTimeoutSec,

    // ---- Chrome-specific ----
    'appium:browserName': env.android.browserName,
    'appium:chromedriverAutodownload': env.android.chromedriverAutodownload,
    // When autodownload is OFF you must pin these manually:
    // 'appium:chromedriverExecutable': '/path/to/chromedriver',
    // 'appium:chromedriverChromeMappingFile': '/path/to/mapping.json',

    // ---- Locale ----
    'appium:language': env.app.browserLocale.split('-')[0] ?? 'en',
    'appium:locale': env.app.browserLocale,

    // ---- Session hygiene ----
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:dontStopAppOnReset': true,
    'appium:skipDeviceInitialization': false,
    'appium:skipServerInstallation': false,
    'appium:autoGrantPermissions': false,
    'appium:disableWindowAnimation': true,
    'appium:enablePerformanceLogging': true,
    'appium:ignoreUnimportantViews': true,

    // ---- Network ----
    'appium:autoWebview': true,
    'appium:readyForIdleConnectionTimeout': 90_000,

    // ---- Recovery from sleep / first boot ----
    'appium:unlockType': 'pin',
    'appium:unlockKey': '1234',

    // ---- Process arguments for Chrome ----
    'appium:chromeOptions': {
      args: [
        '--disable-features=Translate',
        '--lang=' + env.app.browserLocale,
        '--accept-lang=' + [env.app.browserLocale, env.app.pageLocale].join(',')
      ]
    }
  }
] as const;

export type AndroidCapabilities = typeof androidCapabilities[number];
