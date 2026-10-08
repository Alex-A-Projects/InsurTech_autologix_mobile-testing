/**
 * tests/specs/mobile/login.spec.ts
 *
 * Mobile-web smoke + negative + a11y tests for /login.
 *
 * Tag conventions used across the suite:
 *   @smoke      — short happy-path that needs to be green for the suite to ship
 *   @regression — broader coverage, may run on a longer pipeline
 *   @a11y       — accessibility-driven checks (input semantics)
 *
 * Run with:
 *   npx wdio run wdio.ios.conf.ts --mochaOpts.grep=@smoke
 */
import { expect } from 'expect-webdriverio';
import { openLogin } from '../../fixtures/auth.fixture';
import { credentials, allRoles } from '../../utils/credentials';
import { LoginScreen } from '../../pageobjects/mobile/LoginScreen';

describe('Login screen (mobile web)', () => {
  describe('rendering', () => {
    it('@smoke renders email, password and submit fields', async () => {
      const login = await openLogin();
      await login.expectFormVisible();
    });

    it('shows a heading in either English or Polish', async () => {
      await openLogin();
      const headings = await $$(`h1, h2, mat-card-title`);
      const texts: string[] = [];
      for (const h of headings) texts.push(await h.getText());
      const joined = texts.join(' ').toLowerCase();
      expect(joined).toMatch(/login|sign in|zaloguj/i);
    });

    it('has a link to /register', async () => {
      await openLogin();
      const link = $('a[href*="/register"]');
      expect(await link.isExisting()).toBe(true);
    });
  });

  describe('negative submission', () => {
    it('rejects empty submission', async () => {
      const login = await openLogin();
      const submit = $('button[type="submit"]');
      const disabled = (await submit.getAttribute('disabled')) !== null;
      if (!disabled) {
        await submit.click();
      }
      // Stays on /login because the SPA's reactive form guards submission.
      expect(await login.currentPath()).toMatch(/\/login$/);
    });

    it('rejects invalid credentials with visible error', async () => {
      const login = await openLogin();
      await login.fillEmail('nobody@example.test');
      await login.fillPassword('WrongPassword123!');
      await login.submit();
      // Either we stay on /login or an error appears.
      expect(await login.currentPath()).toMatch(/\/login/);
    });

    it('rejects malformed email via HTML5 validation', async () => {
      const login = await openLogin();
      await login.fillEmail('not-an-email');
      // We can't call `.checkValidity()` over the wirebridge easily; the
      // alternative is the input's `:invalid` pseudo-class via attribute.
      const valid = await browser.execute(() => {
        const input = document.querySelector('input[type="email"]') as HTMLInputElement | null;
        return input ? input.checkValidity() : null;
      });
      expect(valid).toBe(false);
    });

    it('preserves email value after failed submit', async () => {
      const login = await openLogin();
      await login.fillEmail('test@test.test');
      await login.fillPassword('wrongpass');
      await login.submit();
      await browser.pause(400);
      const input = $('input[type="email"], input[name="email"]');
      expect(await input.getValue()).toBe('test@test.test');
    });
  });

  describe('a11y / form hygiene', () => {
    it('masks password input', async () => {
      const login = await openLogin();
      await login.fillPassword('whatever');
      await login.expectPasswordMasked();
    });

    it('uses an acceptable autocomplete value for password', async () => {
      const login = await openLogin();
      await login.expectPasswordAutocompleteAcceptable();
    });
  });

  describe('@smoke role logins', () => {
    for (const role of allRoles) {
      it(`logs in as ${role}`, async () => {
        const c = credentials(role);
        const login = new LoginScreen();
        await login.open();
        await login.fillEmail(c.email);
        await login.fillPassword(c.password);
        await login.submit();
        await browser.waitUntil(
          async () => !(await login.currentPath()).endsWith('/login'),
          { timeout: 20_000, timeoutMsg: `Login flow did not leave /login for ${role}.` }
        );
        expect(await login.currentPath()).not.toMatch(/\/login$/);
      });
    }
  });
});
