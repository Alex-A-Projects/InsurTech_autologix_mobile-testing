/**
 * tests/pageobjects/mobile/LoginScreen.ts
 *
 * Mobile-web login screen.
 *
 * Selector strategy: the Angular Material template wraps the `<input>`
 * inside a `mat-form-field` whose label text is rendered with the
 * material-language hints. We therefore prefer stable selectors
 * (formControlName, name, type) that survive copy changes.
 *
 * The form is filled with the supplied credentials and submitted; the
 * fixture above waits for the SPA to land somewhere other than /login.
 */
import { BaseScreen } from './BaseScreen';
import { env } from '../../../config/env';

export class LoginScreen extends BaseScreen {
  protected readonly path = '/login';

  private get emailInput() {
    return $('input[type="email"], input[formcontrolname="email"], input[name="email"]');
  }
  private get passwordInput() {
    return $('input[type="password"]');
  }
  private get submitButton() {
    return $('button[type="submit"]');
  }
  private get registerLink() {
    return $('a[href*="/register"]');
  }
  private get errorBanner() {
    return $('[role="alert"], .error-message, .login-error, mat-error');
  }
  private get formHeading() {
    return $('h1, h2, mat-card-title');
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailInput.waitForDisplayed({ timeout: env.test.expectTimeoutMs });
    await this.emailInput.setValue(value);
    await this.hideKeyboardIfAny();
  }

  async fillPassword(value: string): Promise<void> {
    await this.passwordInput.waitForDisplayed({ timeout: env.test.expectTimeoutMs });
    await this.passwordInput.setValue(value);
    await this.hideKeyboardIfAny();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async loginAs(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    // Wait until SPA leaves /login (route guard / dashboard).
    await browser.waitUntil(
      async () => !(await this.currentPath()).endsWith('/login'),
      { timeout: 20_000, timeoutMsg: 'Login form did not navigate away from /login.' }
    );
    await this.waitForLoaded();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  async expectFormVisible(): Promise<void> {
    await this.emailInput.waitForDisplayed({ timeout: 8_000 });
    await this.passwordInput.waitForDisplayed({ timeout: 8_000 });
    await this.submitButton.waitForDisplayed({ timeout: 8_000 });
  }

  async expectHeadingMatches(re: RegExp): Promise<void> {
    const heading = await this.formHeading.getText();
    if (!re.test(heading)) {
      throw new Error(`Login heading "${heading}" did not match ${re}`);
    }
  }

  async expectErrorVisible(): Promise<void> {
    await this.errorBanner.waitForDisplayed({ timeout: 8_000 });
  }

  async expectSubmitDisabled(): Promise<void> {
    await browser.waitUntil(async () => (await this.submitButton.getAttribute('disabled')) !== null, {
      timeout: 4_000,
      timeoutMsg: 'Submit button should be disabled when form is invalid.'
    });
  }

  async expectPasswordMasked(): Promise<void> {
    const type = await this.passwordInput.getAttribute('type');
    if (type !== 'password') {
      throw new Error(`Password input type was "${type}", expected "password".`);
    }
  }

  /** Some passwords autocomplete on Safari — verify the autocomplete hint. */
  async expectPasswordAutocompleteAcceptable(): Promise<void> {
    const ac = await this.passwordInput.getAttribute('autocomplete');
    if (ac === null || ['current-password', ''].includes(ac)) return;
    throw new Error(`Password autocomplete attribute "${ac}" is suspicious.`);
  }

  private async hideKeyboardIfAny(): Promise<void> {
    try {
      // Both iOS Simulator and Android Emulator respond to this command;
      // catch makes the helper safe even when the soft keyboard isn't open.
      await driver.hideKeyboard();
    } catch {
      // no-op
    }
  }
}
