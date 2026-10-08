/**
 * tests/pageobjects/mobile/OffersScreen.ts
 *
 * Customer-side offer & insurance screens.
 *
 *   CustomerOffersScreen   — /app/offers  (table of offers the customer received)
 *   InsuranceScreen        — /app/insurance (insurance listing)
 */
import { BaseScreen } from './BaseScreen';

export class CustomerOffersScreen extends BaseScreen {
  protected readonly path = '/app/offers';

  private get rows()          { return $$('table tr, mat-card, .offer-card'); }
  private get requestButton() {
    return $('a:has-text("Request"), button:has-text("Request"), button:has-text("New request")');
  }
  private get acceptButtons() { return $$('button:has-text("Accept")'); }
  private get rejectButtons() { return $$('button:has-text("Reject")'); }
  private get cancelButtons() { return $$('button:has-text("Cancel")'); }

  async clickRequest(): Promise<void> {
    if (!(await this.scrollIntoView(this.requestButton))) {
      throw new Error('Request button never became visible.');
    }
    await this.requestButton.click();
  }

  async acceptFirst(): Promise<void> {
    const buttons = await this.acceptButtons;
    const btn = buttons[0];
    if (!btn) throw new Error('No Accept button rendered.');
    await btn.click();
  }

  async rejectFirst(): Promise<void> {
    const buttons = await this.rejectButtons;
    const btn = buttons[0];
    if (!btn) throw new Error('No Reject button rendered.');
    await btn.click();
  }

  async cancelFirst(): Promise<void> {
    const buttons = await this.cancelButtons;
    const btn = buttons[0];
    if (!btn) throw new Error('No Cancel button rendered.');
    await btn.click();
  }

  async rowCount(): Promise<number> {
    return this.rows.length;
  }

  async expectAtList(): Promise<void> {
    await this.expectAt('/app/offers');
  }
}

export class InsuranceScreen extends BaseScreen {
  protected readonly path = '/app/insurance';
  async expectInsurancePage(): Promise<void> { await this.expectAt('/app/insurance'); }
}
