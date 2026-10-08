/**
 * tests/specs/mobile/register.spec.ts
 *
 * Registration page behaviour on mobile web.
 */
import { expect } from 'expect-webdriverio';
import { openLogin } from '../../fixtures/auth.fixture';
import { RegisterScreen } from '../../pageobjects/mobile/RegisterScreen';
import { uniqueEmail } from '../../utils/testData';

describe('Registration screen (mobile web)', () => {
  it('@smoke renders the registration form', async () => {
    const reg = new RegisterScreen();
    await reg.open();
    await reg.expectVisible();
  });

  it('keeps the submit button disabled when the password is missing', async () => {
    const reg = new RegisterScreen();
    await reg.open();
    await reg.fillForm({
      firstName: 'Test',
      lastName: 'User',
      email: uniqueEmail(),
      password: ''
    });
    await reg.expectSubmitDisabled();
    expect(await reg.currentPath()).toMatch(/\/register/);
  });

  it('keeps the submit button disabled for malformed email', async () => {
    const reg = new RegisterScreen();
    await reg.open();
    await reg.fillForm({
      firstName: 'Bad',
      lastName: 'Email',
      email: 'not-an-email',
      password: 'Pass1234!'
    });
    await reg.expectSubmitDisabled();
  });

  it('exposes a path back to login', async () => {
    const reg = new RegisterScreen();
    await reg.open();
    // /register and /login sometimes share a component with an internal toggle.
    const found = await reg.hasBackToLogin();
    expect(found).toBe(true);
  });

  it('renders the login screen via the /login route without auth', async () => {
    const login = await openLogin();
    await login.expectFormVisible();
  });
});
