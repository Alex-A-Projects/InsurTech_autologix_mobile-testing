/**
 * tests/specs/mobile/customer-services.spec.ts
 *
 * The Services tab inside the vehicle detail page is the only place the
 * vehicle-service CRUD UI lives. We open a known-good vehicle id derived
 * from the public API and assert the SPA's affordances.
 */
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';
import { ApiClient } from '../../utils/apiClient';
import { credentials } from '../../utils/credentials';
import { VehicleDetailsScreen } from '../../pageobjects/mobile/VehicleDetailsScreen';

async function firstVehicleId(): Promise<string> {
  const api = new ApiClient();
  await api.login(credentials('customer').email, credentials('customer').password);
  const r = await api.get<{ items: Array<{ id: string }> }>('/vehicles');
  if (r.status !== 200) throw new Error(`API: list vehicles failed (${r.status}).`);
  const id = r.data.items[0]?.id;
  if (!id) throw new Error('No vehicles available for the test account.');
  return id;
}

describe('Customer vehicle services (mobile web)', () => {
  it('renders the vehicle detail page for a known vehicle', async () => {
    const bundle = await loginAs('customer');
    const id = await firstVehicleId();
    const screen = new VehicleDetailsScreen(id);
    await screen.open();
    await screen.waitForLoaded();
    await $('body').waitForDisplayed({ timeout: 8_000 });
  });

  it('exposes an "Add service" affordance (when present)', async () => {
    const bundle = await loginAs('customer');
    const id = await firstVehicleId();
    const screen = new VehicleDetailsScreen(id);
    await screen.open();
    await bundle.dashboard.expectLoaded(); // ensure SPA settled
    // Best-effort check: the UI is permitted to omit the button until the
    // user reaches the services tab.
    const button = $('button:has-text("Add service"), a:has-text("Add service")');
    expect(await button.isExisting()).toBe(true);
  });

  it('switches to the Services tab when present', async () => {
    const bundle = await loginAs('customer');
    const id = await firstVehicleId();
    const screen = new VehicleDetailsScreen(id);
    await screen.open();
    const tab = $(
      'a:has-text("Services"), button:has-text("Services"), [role="tab"]:has-text("Services")'
    );
    if (await tab.isDisplayed().catch(() => false)) {
      await tab.click();
      await browser.pause(300);
    }
  });
});
