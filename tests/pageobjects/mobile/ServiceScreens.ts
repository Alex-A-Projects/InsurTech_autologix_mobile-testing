/**
 * tests/pageobjects/mobile/ServiceScreens.ts
 *
 * Service role: the SPA does NOT render dedicated /app/service/* routes
 * — the role shares the customer /app/vehicles list and accesses its
 * privileged features via the API. We expose the shared views here so
 * spec files stay readable.
 */
import { VehiclesScreen } from './VehiclesScreen';
import { DashboardScreen } from './DashboardScreen';

export class ServiceDashboardScreen extends DashboardScreen {
  // Same dashboard view as the customer.
}

export class ServiceVehiclesScreen extends VehiclesScreen {
  // The SPA reuses the customer /app/vehicles component for this role.
}
