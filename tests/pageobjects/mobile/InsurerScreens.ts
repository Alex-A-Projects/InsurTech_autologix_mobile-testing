/**
 * tests/pageobjects/mobile/InsurerScreens.ts
 *
 * Mobile-web insurer-side screens. The SPA exposes only these
 * /app/insurer/* routes (anything else is API-only — see the
 * wdio API config from a separate project).
 *
 *   InsurerOfferRequestsScreen    — /app/insurer/offer-requests
 *   InsurerOffersScreen           — /app/insurer/offers
 *   NewInsurerOfferScreen         — /app/insurer/offers/new
 *   InsurerVehicleDetailsScreen   — /app/insurer/vehicles/:id
 */
import { BaseScreen } from './BaseScreen';

export class InsurerOfferRequestsScreen extends BaseScreen {
  protected readonly path = '/app/insurer/offer-requests';
  private get rows()         { return $$('table tr, mat-card, .offer-card'); }
  private get offersLink()   { return $('a[href*="/insurer/offers"]'); }

  async openOffers(): Promise<void> { await this.offersLink.click(); }
  async expectAtList(): Promise<void> { await this.expectAt('/app/insurer/offer-requests'); }
}

export class InsurerOffersScreen extends BaseScreen {
  protected readonly path = '/app/insurer/offers';
  private get newButton() { return $('a[href*="/offers/new"], button:has-text("New")'); }
  private get rows() { return $$('table tr, mat-card, .offer-card'); }

  async clickNew(): Promise<void> {
    if (!(await this.scrollIntoView(this.newButton))) {
      throw new Error('New offer button never became visible.');
    }
    await this.newButton.click();
  }

  async expectAtList(): Promise<void> { await this.expectAt('/app/insurer/offers'); }
}

export class NewInsurerOfferScreen extends BaseScreen {
  protected readonly path = '/app/insurer/offers/new';
  private get price()           { return $('input[formcontrolname="price"], input[type="number"]'); }
  private get description()     { return $('textarea[formcontrolname="description"]'); }
  private get coverageMonths()  { return $('input[formcontrolname="coverageMonths"]'); }
  private get submit()          { return $('button[type="submit"]'); }

  async fillForm(p: { price: number; description: string; coverageMonths?: number }): Promise<void> {
    await this.price.setValue(String(p.price));
    await this.description.setValue(p.description);
    if (p.coverageMonths != null) await this.coverageMonths.setValue(String(p.coverageMonths));
    try { await driver.hideKeyboard(); } catch { /* no-op */ }
  }

  async submitForm(): Promise<void> { await this.submit.click(); }
}

export class InsurerVehicleDetailsScreen extends BaseScreen {
  constructor(private readonly vehicleId: string) { super(); }
  protected readonly path = '/app/insurer/vehicles/';

  override async open(): Promise<void> {
    await browser.url(`${this.path}${this.vehicleId}`);
    await this.waitForLoaded();
  }

  private get heading() { return $('h1, h2, mat-card-title'); }
  async expectHeading(matcher: RegExp): Promise<void> {
    const text = await this.heading.getText();
    if (!matcher.test(text)) {
      throw new Error(`Heading "${text}" did not match ${matcher}.`);
    }
  }
}
