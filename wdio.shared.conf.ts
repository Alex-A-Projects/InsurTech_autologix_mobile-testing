/**
 * wdio.shared.conf.ts
 *
 * Common WebdriverIO configuration. Concrete `wdio.ios.conf.ts` and
 * `wdio.android.conf.ts` import this, override the capabilities and
 * device-specific knobs, and pass the result to `wdio run`.
 *
 * Architecture:
 *  - Shared logic goes here (specs, reporters, hooks, screenshots on
 *    failure, base URL, environment handshake).
 *  - Per-platform differences (capabilities, appium service port, ready
 *    timeout) live in the platform-specific configs.
 *  - Tests live under `tests/specs/mobile/`, so any future desktop
 *    or API specs can live in sibling folders without being picked up
 *    by the mobile runners.
 */
import type { Options } from '@wdio/types';
import { env } from './config/env';

export const sharedConfig: Partial<Options.Testrunner> = {
  // ---- Source files --------------------------------------------------------
  specs: ['./tests/specs/mobile/**/*.spec.ts'],
  exclude: ['./tests/specs/**/*.db.spec.ts', './tests/specs/**/*.api.spec.ts'],
  // Local in-process runner (we never use cloud or sharded runs in this
  // mobile-web project — one session, one browser at a time).
  runner: 'local',

  // ---- Spec / framework ---------------------------------------------------
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: env.test.specTimeoutMs,
    retries: env.test.retries
  },
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: env.allure.resultsDir,
        useCucumberStepReporter: false,
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false
      }
    ]
  ],

  // ---- Failure artefacts --------------------------------------------------
  screenshotPath: './test-results/screenshots',
  outputDir: './test-results/wdio-logs',

  // ---- Sync model ---------------------------------------------------------
  // WebdriverIO v9 is fully async; we explicitly opt out of the deprecated
  // synchronous API for clarity.
  sync: false,
  autoCompileOpts: {
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true
    }
  },

  // ---- Timeouts -----------------------------------------------------------
  waitforTimeout: env.test.expectTimeoutMs,
  connectionRetryTimeout: 90_000,
  connectionRetryCount: 3,

  // ---- Hooks --------------------------------------------------------------
  onPrepare: (_config, _capabilities): void => {
    // Make sure screenshot directory always exists before any reporter tries
    // to write into it on a brand-new checkout.
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    [
      env.allure.resultsDir,
      './test-results/screenshots',
      './test-results/wdio-logs'
    ].forEach((dir) => {
      if (!fs.existsSync(path.resolve(dir))) fs.mkdirSync(path.resolve(dir), { recursive: true });
    });
  },

  // Capture a screenshot and a brief failure log whenever a test fails.
  // The Allure reporter above also bundles screenshots automatically, but
  // this hook keeps a stable on-disk path for human inspection.
  afterTest: async function (test, _context, { error, passed }): Promise<void> {
    if (passed) return;
    if (!driver) {
      console.warn('afterTest: no driver bound (session never started)');
      return;
    }
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const safeParent = String(test.parent ?? 'root').replace(/[^a-z0-9-_]+/gi, '_');
    const safeTitle = String(test.title ?? 'untitled').replace(/[^a-z0-9-_]+/gi, '_');
    const outDir = path.resolve('./test-results/screenshots', safeParent);
    const outFile = path.join(outDir, `${safeTitle}_${Date.now()}.png`);
    try {
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      await driver.saveScreenshot(outFile);
      if (error) {
        console.warn(`[failure] ${safeParent} :: ${safeTitle} -> ${outFile}`);
        console.warn(`[failure] reason: ${error.message ?? String(error)}`);
      }
    } catch (e) {
      console.warn('afterTest: could not save screenshot:', e);
    }
  }
};
