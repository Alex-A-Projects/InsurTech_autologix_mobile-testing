/**
 * tests/pageobjects/mobile/RegisterScreen.ts
 *
 * Sign-up screen. Angular reactive forms disable the submit button while
 * the form is invalid — we assert disabled-state rather than firing a
 * submit that would only time out anyway.
 */
import { BaseScreen } from './BaseScreen';

export class RegisterScreen extends BaseScreen {
  protected readonly path = '/register';

  private get firstNameInput() { return $('input[formcontrolname="firstName"], input[name="firstName"]'); }
  private get lastNameInput()  { return $('input[formcontrolname="lastName"], input[name="lastName"]'); }
  private get emailInput()     { return $('input[type="email"]'); }
  private get passwordInput()  { return $('input[type="password"]'); }
  private get passwordConfirm() {
    return $('input[formcontrolname="confirmPassword"], input[name="confirmPassword"]');
  }
  private get submitButton()   { return $('button[type="submit"]'); }

  async fillForm(p: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.firstNameInput.setValue(p.firstName);
    await this.lastNameInput.setValue(p.lastName);
    await this.emailInput.setValue(p.email);
    await this.passwordInput.setValue(p.password);
    if (await this.passwordConfirm.isExisting().catch(() => false)) {
      await this.passwordConfirm.setValue(p.password);
    }
    try { await driver.hideKeyboard(); } catch { /* no keyboard visible */ }
  }

  async expectVisible(): Promise<void> {
    await this.firstNameInput.waitForDisplayed({ timeout: 8_000 });
    await this.emailInput.waitForDisplayed({ timeout: 8_000 });
    await this.passwordInput.waitForDisplayed({ timeout: 8_000 });
  }

  async expectSubmitDisabled(): Promise<void> {
    await browser.waitUntil(
      async () => (await this.submitButton.getAttribute('disabled')) !== null,
      { timeout: 5_000, timeoutMsg: 'Submit button is enabled with invalid form.' }
    );
  }

  async hasBackToLogin(): Promise<boolean> {
    const link = $('a[href*="/login"]');
    if (await link.isExisting().catch(() => false)) return true;
    const toggle = $('button:has-text("Zaloguj"), button:has-text("Login")');
    return (await toggle.isExisting().catch(() => false));
  }
}
