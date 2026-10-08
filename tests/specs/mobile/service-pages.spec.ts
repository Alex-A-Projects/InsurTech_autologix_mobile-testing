/**
 * tests/specs/mobile/service-pages.spec.ts
 *
 * The service role shares its UI with customers. The role-specific
 * features are exposed only via the API (which is not part of this
 * mobile-web spec).
 */
describe('Service role pages (mobile web)', () => {
  it('@smoke service dashboard loads', async () => {
    const { loginAs } = await import('../../fixtures/auth.fixture');
    const bundle = await loginAs('service');
    await bundle.dashboard.expectLoaded();
  });

  it('@smoke service vehicles list loads via shared customer view', async () => {
    const { loginAs } = await import('../../fixtures/auth.fixture');
    const bundle = await loginAs('service');
    await bundle.vehicles.open();
    await bundle.vehicles.expectAtList();
  });
});
