/**
 * tests/pageobjects/mobile/BaseScreen.ts
 *
 * Common POM behaviour every screen inherits: relative navigation, URL
 * assertions, mobile-friendly waiting, and a single shared way to take
 * a labelled screenshot.
 *
 * Mobile-specific helpers exposed here:
 *  - `waitUntilIdle()`  — masks `readyState === 'complete'` with a
 *    short stabilisation pause so the next locator doesn't race the
 *    SPA's hydration step.
 *  - `scrollIntoView()` — wraps the Appium `mobile: swipe` gesture with
 *    a finite number of attempts.
 *  - `hideKeyboard()`   — used before screenshots so on-screen keyboards
 *    don't cover the failure evidence.
 */
import type { ChainablePromiseElement } from 'webdriverio';
import { env } from '../../../config/env';

export abstract class BaseScreen {
  /** Route *relative to* APP_BASE_URL. Set by concrete screens. */
  protected abstract readonly path: string;

  async open(): Promise<void> {
    await browser.url(this.path);
    await this.waitForLoaded();
  }

  /** Drive the SPA in-app instead of a full reload — much faster. */
  async openInApp(): Promise<void> {
    await browser.execute(
      'history.pushState({}, arguments[0], arguments[0]); window.dispatchEvent(new PopStateEvent("popstate"))',
      this.path
    );
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    await browser.waitUntil(
      async () => (await browser.execute('return document.readyState')) === 'complete',
      {
        timeout: 15_000,
        timeoutMsg: `${this.path}: document never reached "complete".`
      }
    ).catch(() => undefined);
    // Mobile Safari occasionally takes a beat to render after `readyState`
    // flips. A short pause here is safer than letting the next locator
    // race the React / Angular hydration.
    await browser.pause(150);
  }

  async currentPath(): Promise<string> {
    return new URL(await browser.getUrl()).pathname;
  }

  async expectAt(expectedPath: string | RegExp): Promise<void> {
    await browser.waitUntil(
      async () => {
        const path = await this.currentPath();
        return expectedPath instanceof RegExp
          ? expectedPath.test(path)
          : path.endsWith(expectedPath);
      },
      {
        timeout: env.test.expectTimeoutMs,
        timeoutMsg: `Expected to land on ${String(expectedPath)} after navigation.`
      }
    );
  }

  /**
   * Look for an error banner / toast. Angular Material renders these
   * inside `<mat-error>` and snack-bar containers; we accept either so
   * the test doesn't depend on framework version.
   */
  async expectErrorVisible(text?: RegExp, timeoutMs = env.test.expectTimeoutMs): Promise<void> {
    const sel = [
      '[role="alert"]',
      '.error-message',
      '.login-error',
      '.toast-error',
      '.mat-mdc-form-field-error',
      'mat-error',
      '.mat-mdc-snack-bar-container'
    ].join(', ');
    const el = await $(sel);
    await el.waitForDisplayed({ timeout: timeoutMs });
    if (text) {
      const body = await el.getText();
      if (!text.test(body)) {
        throw new Error(`Expected error matching ${text}, got: ${body}`);
      }
    }
  }

  /** Capture an annotated screenshot for inclusion in the test report. */
  async screenshot(name: string): Promise<string> {
    try {
      await driver.hideKeyboard();
    } catch {
      // No keyboard visible — ignore.
    }
    const safe = `${name.replace(/[^a-z0-9_-]+/gi, '_')}_${Date.now()}.png`;
    const path = `./test-results/screenshots/${safe}`;
    await browser.saveScreenshot(path);
    return path;
  }

  /**
   * Scroll `direction` until the target element is in the viewport.
   * Uses the Appium `mobile: swipe` gesture, which works on both iOS
   * (XCUITest) and Android (UiAutomator2) drivers.
   */
  async scrollIntoView(
    selector: string | ChainablePromiseElement,
    direction: 'up' | 'down' = 'up',
    maxSwipes = 6
  ): Promise<boolean> {
    const $el = typeof selector === 'string' ? await $(selector) : selector;
    for (let i = 0; i < maxSwipes; i++) {
      if (await $el.isDisplayed().catch(() => false)) return true;
      await browser.execute('mobile: swipe', { direction, velocity: 1500 });
      await browser.pause(120);
    }
    return false;
  }

  /** Assert any node matching `selector` is displayed within `env.test.expectTimeoutMs`. */
  async expectVisible(selector: string): Promise<void> {
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: env.test.expectTimeoutMs });
  }
}
