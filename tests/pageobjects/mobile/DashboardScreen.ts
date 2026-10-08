/**
 * tests/pageobjects/mobile/DashboardScreen.ts
 *
 * Dashboard available to every authenticated role. On mobile, content is
 * presented as cards stacked vertically.
 */
import { BaseScreen } from './BaseScreen';
import { HeaderComponent } from './components/HeaderComponent';
import { SidebarComponent } from './components/SidebarComponent';

export class DashboardScreen extends BaseScreen {
  protected readonly path = '/app/dashboard';
  public header = new HeaderComponent();
  public sidebar = new SidebarComponent();

  private get body() { return $('body'); }

  async expectLoaded(): Promise<void> {
    await this.body.waitForDisplayed({ timeout: 12_000 });
  }

  async expectSubstantialContent(): Promise<void> {
    await this.body.waitForDisplayed({ timeout: 12_000 });
    const text = await this.body.getText();
    if (text.trim().length < 50) {
      throw new Error(`Dashboard body suspiciously short (${text.length} chars).`);
    }
  }
}
