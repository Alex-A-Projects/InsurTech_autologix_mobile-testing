/**
 * tests/fixtures/auth.fixture.ts
 *
 * Reusable login helper for spec files. WebdriverIO + Mocha don't have
 * fixture scopes like Playwright — instead, we expose a single
 * `loginAs(role)` function that drives the login flow and returns a
 * bundle of role-specific screens. Each spec calls it in `before()` to
 * produce one bundle, then uses the screens in `it()`.
 *
 *     before(async () => { bundle = await loginAs('customer'); });
 *     it('sees dashboard', async () => {
 *       await bundle.dashboard.expectLoaded();
 *     });
 *
 * Why a bundle rather than test arguments?
 *  - Keeps the spec bodies short — no `function() { ... }` wrappers
 *    needed at the `it()` boundary.
 *  - Lints cleanly with explicit return types.
 *  - Trivially mockable: tests can build a stub bundle for offline runs.
 */
import { LoginScreen } from '../pageobjects/mobile/LoginScreen';
import { DashboardScreen } from '../pageobjects/mobile/DashboardScreen';
import { VehiclesScreen, NewVehicleScreen } from '../pageobjects/mobile/VehiclesScreen';
import { CustomerOffersScreen, InsuranceScreen } from '../pageobjects/mobile/OffersScreen';
import {
  InsurerOfferRequestsScreen,
  InsurerOffersScreen,
  NewInsurerOfferScreen
} from '../pageobjects/mobile/InsurerScreens';
import { ServiceDashboardScreen, ServiceVehiclesScreen } from '../pageobjects/mobile/ServiceScreens';
import { credentials, Role } from '../utils/credentials';
import { requireCredentials } from '../utils/validators';
import { logger } from '../utils/logger';

export interface CustomerBundle {
  role: 'customer';
  login: LoginScreen;
  dashboard: DashboardScreen;
  vehicles: VehiclesScreen;
  newVehicle: NewVehicleScreen;
  offers: CustomerOffersScreen;
  insurance: InsuranceScreen;
}

export interface InsurerBundle {
  role: 'insurer';
  login: LoginScreen;
  dashboard: DashboardScreen;
  offerRequests: InsurerOfferRequestsScreen;
  offers: InsurerOffersScreen;
  newOffer: NewInsurerOfferScreen;
}

export interface ServiceBundle {
  role: 'service';
  login: LoginScreen;
  dashboard: ServiceDashboardScreen;
  vehicles: ServiceVehiclesScreen;
}

export type SessionBundle = CustomerBundle | InsurerBundle | ServiceBundle;

/**
 * Drives the SPA through the login flow and returns role-specific screen
 * handles ready to be queried. Throws when credentials are missing.
 */
export async function loginAs(role: 'customer'): Promise<CustomerBundle>;
export async function loginAs(role: 'insurer'): Promise<InsurerBundle>;
export async function loginAs(role: 'service'): Promise<ServiceBundle>;
export async function loginAs(role: Role): Promise<SessionBundle> {
  requireCredentials(role);
  const c = credentials(role);

  const login = new LoginScreen();
  await login.open();
  await login.expectFormVisible();
  await login.loginAs(c.email, c.password);

  switch (role) {
    case 'customer': {
      const dashboard = new DashboardScreen();
      await dashboard.expectLoaded();
      return {
        role: 'customer',
        login,
        dashboard,
        vehicles: new VehiclesScreen(),
        newVehicle: new NewVehicleScreen(),
        offers: new CustomerOffersScreen(),
        insurance: new InsuranceScreen()
      };
    }
    case 'insurer': {
      const dashboard = new DashboardScreen();
      await dashboard.expectLoaded();
      return {
        role: 'insurer',
        login,
        dashboard,
        offerRequests: new InsurerOfferRequestsScreen(),
        offers: new InsurerOffersScreen(),
        newOffer: new NewInsurerOfferScreen()
      };
    }
    case 'service': {
      const dashboard = new ServiceDashboardScreen();
      await dashboard.expectLoaded();
      return {
        role: 'service',
        login,
        dashboard,
        vehicles: new ServiceVehiclesScreen()
      };
    }
  }
}

/** Convenience for unauthenticated login-screen-only specs. */
export async function openLogin(): Promise<LoginScreen> {
  const login = new LoginScreen();
  await login.open();
  await login.expectFormVisible();
  return login;
}

export const sessions = { loginAs, openLogin };
logger.debug('auth.fixture.ts ready');
