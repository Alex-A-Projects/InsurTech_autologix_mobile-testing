/**
 * tests/pageobjects/mobile/components/SidebarComponent.ts
 *
 * Side menu / navigation drawer. On a phone the same DOM often drives a
 * full-screen drawer as a desktop sidebar. We match both.
 */
export class SidebarComponent {
  private get root() {
    return $('mat-sidenav, nav, aside, .sidebar, app-sidebar');
  }

  async expectVisible(): Promise<void> {
    await this.root.waitForDisplayed({ timeout: 8_000 });
  }

  async clickNavItem(name: RegExp): Promise<void> {
    const handles = await this.root.$$('a, button');
    for (const handle of handles) {
      const text = await handle.getText();
      if (name.test(text)) {
        await handle.click();
        return;
      }
    }
    throw new Error(`Sidebar item matching ${name} not found`);
  }

  async expectNavItem(name: RegExp): Promise<void> {
    const handles = await this.root.$$('a, button');
    for (const handle of handles) {
      const text = await handle.getText();
      if (name.test(text)) return;
    }
    throw new Error(`Sidebar item matching ${name} not rendered`);
  }
}
