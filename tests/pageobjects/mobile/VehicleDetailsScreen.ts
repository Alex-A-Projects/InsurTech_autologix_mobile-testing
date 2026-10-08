/**
 * tests/pageobjects/mobile/VehicleDetailsScreen.ts
 *
 * One vehicle's detail page. On mobile this is a long-form card stack
 * with tabs for services. Most CTAs are pinned to the bottom of the
 * screen so we scroll-into-view rather than trusting absolute coords.
 */
import { BaseScreen } from './BaseScreen';

export class VehicleDetailsScreen extends BaseScreen {
  /**
   * The id is supplied at construction time so the URL helper can hit the
   * correct path under /app/vehicles/:id.
   */
  constructor(private readonly id: string) {
    super();
  }
  protected readonly path = '/app/vehicles/';

  private get heading()     { return $('h1, h2, mat-card-title'); }
  private get servicesTab() {
    return $('a:has-text("Services"), button:has-text("Services"), [role="tab"]:has-text("Services")');
  }
  private get addServiceBtn() {
    return $('button:has-text("Add service"), a:has-text("Add service")');
  }
  private get editBtn() {
    return $('button:has-text("Edit"), a:has-text("Edit")');
  }
  private get deleteBtn() {
    return $('button:has-text("Delete")');
  }

  override async open(): Promise<void> {
    await browser.url(`${this.path}${this.id}`);
    await this.waitForLoaded();
  }

  async openServicesTab(): Promise<void> {
    await this.servicesTab.click();
  }

  async clickAddService(): Promise<void> {
    if (!(await this.scrollIntoView(this.addServiceBtn))) {
      throw new Error('Add service button never became visible.');
    }
    await this.addServiceBtn.click();
  }

  async clickEdit(): Promise<void> {
    if (!(await this.scrollIntoView(this.editBtn))) {
      throw new Error('Edit button never became visible.');
    }
    await this.editBtn.click();
  }

  async clickDelete(): Promise<void> {
    if (!(await this.scrollIntoView(this.deleteBtn))) {
      throw new Error('Delete button never became visible.');
    }
    await this.deleteBtn.click();
  }

  async expectHeading(matcher: RegExp): Promise<void> {
    const text = await this.heading.getText();
    if (!matcher.test(text)) {
      throw new Error(`Heading "${text}" did not match ${matcher}.`);
    }
  }
}
