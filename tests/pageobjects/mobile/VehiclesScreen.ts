/**
 * tests/pageobjects/mobile/VehiclesScreen.ts
 *
 * Two screens exported here:
 *
 *   VehiclesScreen      – list page (with the "Add" affordance)
 *   NewVehicleScreen    – the create form at /app/vehicles/new
 *
 * The /app/vehicles route is also reachable by the service role — and
 * since both roles see the same UI tree, Screen objects are reused.
 */
import { BaseScreen } from './BaseScreen';
import { env } from '../../../config/env';
import type { VehicleDraft } from '../../utils/testData';
import type { ChainablePromiseElement } from 'webdriverio';

export class VehiclesScreen extends BaseScreen {
  protected readonly path = '/app/vehicles';

  private get rows() { return $$('table tr, mat-card, .vehicle-card, [data-testid="vehicle-row"]'); }
  private get addButton() {
    return $('a[href*="/vehicles/new"], button:has-text("Add"), button:has-text("New")');
  }
  private get emptyState() {
    return $('.empty-state, .no-data, mat-card:has-text("No"), :text("No vehicles")');
  }

  async rowCount(): Promise<number> {
    return this.rows.length;
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  async expectAtList(): Promise<void> {
    await this.expectAt('/app/vehicles');
  }

  async expectVehicleVisible(text: RegExp): Promise<void> {
    const all = await this.rows;
    for (const row of all) {
      const txt = await row.getText().catch(() => '');
      if (text.test(txt)) return;
    }
    throw new Error(`No vehicle row matched ${text}`);
  }
}

export class NewVehicleScreen extends BaseScreen {
  protected readonly path = '/app/vehicles/new';

  private get brand()         { return $('input[formcontrolname="brand"], input[name="brand"]'); }
  private get model()         { return $('input[formcontrolname="model"], input[name="model"]'); }
  private get version()       { return $('input[formcontrolname="version"]'); }
  private get regNumber()     { return $('input[formcontrolname="registrationNumber"]'); }
  private get vin()           { return $('input[formcontrolname="vin"]'); }
  private get year()          { return $('input[formcontrolname="year"]'); }
  private get mileage()       { return $('input[formcontrolname="mileage"]'); }
  private get fuelType()      { return $('select[formcontrolname="fuelType"], mat-select[formcontrolname="fuelType"]'); }
  private get engineCapacity(){ return $('input[formcontrolname="engineCapacity"]'); }
  private get enginePowerHp() { return $('input[formcontrolname="enginePowerHp"]'); }
  private get firstRegDate()  { return $('input[formcontrolname="firstRegistrationDate"], input[type="date"]'); }
  private get notes()         { return $('textarea[formcontrolname="notes"]'); }
  private get allowOffers()   { return $('mat-checkbox[formcontrolname="allowInsuranceOffers"], input[type="checkbox"]'); }
  private get submit()        { return $('button[type="submit"]'); }
  private get cancel()        { return $('button:has-text("Cancel"), a:has-text("Cancel")'); }

  async fillForm(partial: Partial<VehicleDraft>): Promise<void> {
    if (partial.brand)        await this.fillIfPresent(this.brand, partial.brand);
    if (partial.model)        await this.fillIfPresent(this.model, partial.model);
    if (partial.version)      await this.fillIfPresent(this.version, partial.version);
    if (partial.registrationNumber)
                             await this.fillIfPresent(this.regNumber, partial.registrationNumber);
    if (partial.vin)          await this.fillIfPresent(this.vin, partial.vin);
    if (partial.year != null) await this.fillIfPresent(this.year, String(partial.year));
    if (partial.mileage != null) await this.fillIfPresent(this.mileage, String(partial.mileage));
    if (partial.engineCapacity != null)
                             await this.fillIfPresent(this.engineCapacity, String(partial.engineCapacity));
    if (partial.enginePowerHp != null)
                             await this.fillIfPresent(this.enginePowerHp, String(partial.enginePowerHp));
    if (partial.firstRegistrationDate)
                             await this.fillIfPresent(this.firstRegDate, partial.firstRegistrationDate.slice(0, 10));
    if (partial.notes)        await this.fillIfPresent(this.notes, partial.notes);
    try { await driver.hideKeyboard(); } catch { /* no-op */ }
  }

  /** Material `<mat-select>` is a button with a popup — click + pick option. */
  async selectFuelType(label: string): Promise<void> {
    const select = this.fuelType;
    if (!(await select.isExisting().catch(() => false))) return;
    // Native <select>
    const tagName = await select.getAttribute('tagName').catch(() => '');
    if (tagName && tagName.toLowerCase() === 'select') {
      await select.selectByVisibleText(label);
      return;
    }
    await select.click();
    const opt = $(`mat-option:has-text("${label}")`);
    await opt.waitForDisplayed({ timeout: 5_000 });
    await opt.click();
  }

  async submitForm(): Promise<void> {
    await this.submit.click();
  }

  async cancelForm(): Promise<void> {
    await this.cancel.click();
  }

  async expectFieldError(fieldLabel: string): Promise<void> {
    const err = $(`mat-error:has-text("${fieldLabel}"), .mat-mdc-form-field-error:has-text("${fieldLabel}")`);
    await err.waitForDisplayed({ timeout: 5_000 });
  }

  private async fillIfPresent(el: ChainablePromiseElement, value: string): Promise<void> {
    if (!(await el.isExisting().catch(() => false))) return;
    await el.clearValue();
    await el.setValue(value);
  }

  /** Public alias for tests that want to scroll to a control first. */
  async scrollToSubmit(): Promise<void> {
    const visible = await this.scrollIntoView(this.submit);
    if (!visible) throw new Error('Submit button never became visible after scrolling.');
  }
  // Reference env so test runners don't complain about unused imports
  // when iterating on test code that uses timeouts only.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _timeout = env.test.expectTimeoutMs;
}
