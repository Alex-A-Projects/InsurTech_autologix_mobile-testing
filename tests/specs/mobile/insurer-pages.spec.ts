/**
 * tests/specs/mobile/insurer-pages.spec.ts
 *
 * The SPA exposes only the four insurer-side routes listed in this file.
 * Other entity-routes (list of vehicles, expiring list) live in the API
 * but not the SPA bundle.
 */
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';
import { makeOffer } from '../../utils/testData';

describe('Insurer pages (mobile web)', () => {
  it('@smoke offer requests page loads', async () => {
    const bundle = await loginAs('insurer');
    await bundle.offerRequests.open();
    await bundle.offerRequests.expectAtList();
  });

  it('@smoke offers page loads with a New affordance', async () => {
    const bundle = await loginAs('insurer');
    await bundle.offers.open();
    await bundle.offers.expectAtList();
    const newButton = $('a:has-text("New"), button:has-text("New")');
    expect(await newButton.isExisting()).toBe(true);
  });

  it('can open the new-offer form', async () => {
    const bundle = await loginAs('insurer');
    await browser.url('/app/insurer/offers');
    await bundle.offers.openInApp(); // SPA route push
    expect(await browser.getUrl()).toMatch(/\/app\/insurer\/offers\/new/);
  });

  it('new-offer form renders and accepts the price input', async () => {
    const bundle = await loginAs('insurer');
    await bundle.newOffer.open();
    const offer = makeOffer();
    await bundle.newOffer.fillForm(offer);
    const priceField = $('input[formcontrolname="price"], input[type="number"]');
    expect(await priceField.getValue()).toBe(String(offer.price));
  });
});
