/**
 * tests/specs/mobile/navigation.spec.ts
 *
 * Mobile Safari / Chrome coverage of authenticated + public routes.
 * On a phone there is no visible URL bar — the SPA's history API and
 * the `mat-toolbar` user-menu are the only navigation surface we can
 * observe, so we lean on URL assertions primarily.
 */
import { expect } from 'expect-webdriverio';
import { loginAs, openLogin } from '../../fixtures/auth.fixture';
import { HeaderComponent } from '../../pageobjects/mobile/components/HeaderComponent';

const SHARED_PAGES = ['/app/dashboard', '/app/vehicles', '/app/offers', '/app/insurance'];

describe('Navigation — authenticated (mobile web)', () => {
  it('shows the header on the customer dashboard', async () => {
    const bundle = await loginAs('customer');
    await bundle.dashboard.expectLoaded();
    const header = new HeaderComponent();
    await header.expectVisible();
  });

  for (const path of SHARED_PAGES) {
    it(`customer can open ${path}`, async () => {
      const bundle = await loginAs('customer');
      await browser.url(path);
      expect(await browser.getUrl()).toContain(path);
    });
  }

  it('insurer can open the offer requests page', async () => {
    const bundle = await loginAs('insurer');
    await browser.url('/app/insurer/offer-requests');
    expect(await browser.getUrl()).toContain('/app/insurer/offer-requests');
  });

  it('insurer can open the offers list page', async () => {
    const bundle = await loginAs('insurer');
    await browser.url('/app/insurer/offers');
    expect(await browser.getUrl()).toContain('/app/insurer/offers');
  });

  it('insurer can open the new offer form (in-app nav)', async () => {
    const bundle = await loginAs('insurer');
    await browser.url('/app/insurer/offers');
    await bundle.offers.openInApp();
    expect(await browser.getUrl()).toContain('/app/insurer/offers/new');
  });

  it('service role can open the shared vehicles view', async () => {
    const bundle = await loginAs('service');
    await browser.url('/app/vehicles');
    expect(await browser.getUrl()).toMatch(/\/app\/vehicles/);
  });

  it('logout clears the session and returns to /login', async () => {
    const bundle = await loginAs('customer');
    await browser.url('/app/dashboard');
    const header = new HeaderComponent();
    const loggedOut = await header.logoutIfVisible();
    if (!loggedOut) {
      // The SPA sometimes places Logout under the user-menu — best-effort.
      await header.openUserMenu();
      expect(await header.logoutIfVisible()).toBe(true);
    }
    expect(await browser.getUrl()).toMatch(/\/login/);
  });
});

describe('Navigation — public (mobile web)', () => {
  it('visiting /login renders the login form', async () => {
    const login = await openLogin();
    expect(await login.currentPath()).toMatch(/\/login/);
    await login.expectFormVisible();
  });

  it('visiting /register renders the registration form', async () => {
    await browser.url('/register');
    expect(await browser.getUrl()).toMatch(/\/register/);
    const inputs = await $$('input');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
