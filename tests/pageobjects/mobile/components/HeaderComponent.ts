/**
 * tests/pageobjects/mobile/components/HeaderComponent.ts
 *
 * App header rendered by the SPA. On mobile (which is always the case for
 * this framework), Angular Material collapses the toolbar behind a
 * hamburger icon and the user-menu becomes a top-right avatar.
 */
export class HeaderComponent {
  private get root() {
    return $('mat-toolbar, header, app-header');
  }
  private get brand() {
    return $('mat-toolbar a, header a');
  }
  private get menuToggle() {
    return $('button[aria-label*="menu" i], .menu-toggle, mat-toolbar button:has-text("menu")');
  }
  private get logoutButton() {
    return $([
      'button:has-text("Logout")',
      'button:has-text("Wyloguj")',
      'a:has-text("Logout")',
      'a:has-text("Wyloguj")',
      'button:has-text("Sign out")',
      'button[aria-label*="logout" i]',
      'a[aria-label*="logout" i]'
    ].join(', '));
  }
  private get userMenu() {
    return $('[aria-label*="user" i], button[aria-haspopup="menu"], button:has-text("Profile")');
  }

  async expectVisible(): Promise<void> {
    await this.root.waitForDisplayed({ timeout: 10_000 });
  }

  async expectBrand(): Promise<void> {
    await this.brand.waitForDisplayed({ timeout: 8_000 });
  }

  async openMenu(): Promise<void> {
    if (await this.menuToggle.isDisplayed().catch(() => false)) {
      await this.menuToggle.click();
      await browser.pause(200);
    }
  }

  async openUserMenu(): Promise<void> {
    if (await this.userMenu.isDisplayed().catch(() => false)) {
      await this.userMenu.click();
      await browser.pause(200);
    }
  }

  async logoutIfVisible(): Promise<boolean> {
    if (!(await this.logoutButton.isDisplayed().catch(() => false))) return false;
    await this.logoutButton.click();
    await browser.waitUntil(
      async () => /\/login/.test(await browser.getUrl()),
      { timeout: 10_000, timeoutMsg: 'Did not land on /login after logout.' }
    );
    return true;
  }
}
