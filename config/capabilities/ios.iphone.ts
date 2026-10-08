/**
 * config/capabilities/ios.iphone.ts
 *
 * iOS Simulator — Safari via XCUITest.
 *
 * Apple now ships the "iPhone 17" family in Xcode 16+. We target
 * "iPhone 17" by default; override with IOS_DEVICE_NAME in .env to pick
 * the Pro / Plus / Pro Max variant if installed.
 *
 * Notes:
 *  - `browserName: 'Safari'` makes Appium hand the session to MobileSafari
 *    rather than launching a WebView shell.
 *  - `safariAllowPopups: false` keeps the test session deterministic — the
 *    framework must click every link on the right side rather than chase
 *    pop-under tabs.
 *  - `startIWDPDAgentAsync` is moved to `appium:webDriverAgentAutoStartup`
 *    in modern XCUITest driver releases; we use the documented key for
 *    driver >= 6.
 */
import { env } from '../env';

export const iosCapabilities = [
  {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': env.ios.deviceName,
    'appium:platformVersion': env.ios.platformVersion,
    'appium:bundleId': env.ios.bundleId,
    'appium:newCommandTimeout': env.ios.newCommandTimeoutSec,

    // ---- Safari-specific ----
    'appium:browserName': 'Safari',
    'appium:safariAllowPopups': false,
    'appium:safariIgnoreFraudWarning': false,
    'appium:safariOpenLinksInBackground': false,
    'appium:safariShowFullResponse': true,
    'appium:includeSafariInLogs': true,

    // ---- WebDriverAgent (XCUITest driver-side) ----
    'appium:webDriverAgentPort': env.ios.wdaPort,
    'appium:webDriverAgentAutoStartup': true,
    'appium:webDriverAgentLaunchTimeout': 60_000,

    // ---- Appium session semantics ----
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:autoAcceptAlerts': false,
    'appium:autoDismissAlerts': false,
    'appium:dontStopAppOnReset': true,
    'appium:shouldUseCompactResponses': true,

    // ---- Process timing on a fresh simulator ----
    'appium:iosInstallPause': 1_500,
    'appium:launchTimeout': 90_000,

    // ---- Tracing hooks (mounted as TestRail-friendly metadata) ----
    'appium:processArguments': {
      args: ['-AppleLanguages', `(${env.app.browserLocale})`, '-AppleLocale', env.app.browserLocale]
    }
  }
] as const;

export type IosCapabilities = typeof iosCapabilities[number];
