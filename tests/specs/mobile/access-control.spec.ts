/**
 * tests/specs/mobile/access-control.spec.ts
 *
 * Mobile-web access-control tests. The SPA enforces only one route
 * guard (any /app/* route requires authentication) — role boundaries
 * are enforced at the API layer.
 */
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';

describe('Access control (mobile web)', () => {
  it('@smoke unauthenticated user is redirected away from /app/*', async () => {
    await browser.url('/app/dashboard');
    await browser.pause(500);
    const url = await browser.getUrl();
    const atLogin = /\/login/.test(url);
    const showsForbidden = await $(':text("Unauthorized"), :text("Access denied"), :text("Brak dostępu")')
      .isExisting().catch(() => false);
    expect(atLogin || showsForbidden).toBeTruthy();
  });

  it('customer role lands on /app/dashboard after fresh login', async () => {
    const bundle = await loginAs('customer');
    expect(await browser.getUrl()).toContain('/app/dashboard');
    await bundle.dashboard.expectLoaded();
  });

  it('public /login does not require auth', async () => {
    await browser.url('/login');
    expect(await browser.getUrl()).toContain('/login');
  });

  it('public /register does not require auth', async () => {
    await browser.url('/register');
    expect(await browser.getUrl()).toContain('/register');
  });

  it('customer can navigate to insurer URLs (UI lets through; API blocks)', async () => {
    const bundle = await loginAs('customer');
    await browser.url('/app/insurer/offers');
    expect(await browser.getUrl()).toContain('/app/insurer/offers');
  });
});
