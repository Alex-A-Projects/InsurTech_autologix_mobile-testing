/**
 * tests/specs/mobile/customer-offers.spec.ts
 */
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';

describe('Customer offers (mobile web)', () => {
  it('@smoke offers page loads after login', async () => {
    const bundle = await loginAs('customer');
    await bundle.offers.open();
    await bundle.offers.expectAtList();
  });

  it('exposes a request-offer affordance (button or link)', async () => {
    const bundle = await loginAs('customer');
    await bundle.offers.open();
    const req = $('a:has-text("Request"), button:has-text("Request"), button:has-text("New request")');
    expect(await req.isExisting()).toBe(true);
  });

  it('@smoke insurance page loads', async () => {
    const bundle = await loginAs('customer');
    await bundle.insurance.open();
    await bundle.insurance.expectInsurancePage();
  });

  it('does not throw when empty', async () => {
    const bundle = await loginAs('customer');
    await bundle.offers.open();
    await bundle.offers.expectAtList();
    await $('body').waitForDisplayed({ timeout: 5_000 });
  });
});
