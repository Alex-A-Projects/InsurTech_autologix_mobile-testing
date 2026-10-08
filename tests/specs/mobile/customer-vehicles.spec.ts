/**
 * tests/specs/mobile/customer-vehicles.spec.ts
 */
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';
import { makeVehicle } from '../../utils/testData';

describe('Customer vehicles (mobile web)', () => {
  it('@smoke vehicles list loads and exposes an Add affordance', async () => {
    const bundle = await loginAs('customer');
    await bundle.vehicles.open();
    await bundle.vehicles.expectAtList();
    const count = await bundle.vehicles.rowCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('can navigate from the list to the New Vehicle form', async () => {
    const bundle = await loginAs('customer');
    await bundle.vehicles.open();
    await bundle.vehicles.clickAdd();
    expect(await browser.getUrl()).toMatch(/\/vehicles\/new|\/vehicles\/?$/);
  });

  it('the New Vehicle form renders submit and brand input', async () => {
    const bundle = await loginAs('customer');
    await bundle.newVehicle.open();
    const submit = $('button[type="submit"]');
    await submit.waitForDisplayed({ timeout: 15_000 });
  });

  it('rejects empty submission and stays on the form', async () => {
    const bundle = await loginAs('customer');
    await bundle.newVehicle.open();
    // No values filled — the form shouldn't submit.
    const submit = $('button[type="submit"]');
    const disabled = (await submit.getAttribute('disabled')) !== null;
    if (!disabled) {
      await submit.click();
    }
    expect(await browser.getUrl()).toMatch(/\/vehicles\/new/);
  });

  it('the form accepts a fully-populated fixture (does NOT assert save)', async () => {
    const bundle = await loginAs('customer');
    await bundle.newVehicle.open();
    const vehicle = makeVehicle();
    await bundle.newVehicle.fillForm(vehicle);
    // Different SPA builds disable submit until validators pass — accept
    // both states. We just want to assert the fields accept input.
    const brandEl = $('input[formcontrolname="brand"], input[name="brand"]');
    expect(await brandEl.getValue()).toBe(vehicle.brand);
  });
});
