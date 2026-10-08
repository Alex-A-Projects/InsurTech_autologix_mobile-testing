# AutoLogix — Mobile-Web Automation (WebdriverIO + Appium)

A portfolio-grade **mobile-web** automation framework that exercises the
[AutoLogix InsurTech SPA](https://autologix.vercel.app) on real Apple
Safari (iOS Simulator) and real Google Chrome (Android Emulator).

> The same scenarios also exist in a Playwright-based framework
> (`InsurTech_autologix_playwright-typescript`) that drives the *desktop*
> SPA. This project is the mobile counterpart.

---

## Table of contents

- [What's in the box](#whats-in-the-box)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Target runtime environments](#target-runtime-environments)
- [Setup](#setup)
- [Running the tests](#running-the-tests)
- [Reports](#reports)
- [Selector strategy](#selector-strategy)
- [Architecture notes](#architecture-notes)
- [Adding a new test](#adding-a-new-test)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What's in the box

| Feature | Where it lives |
| --- | --- |
| TypeScript everywhere | `tsconfig.json`, `wdio.*.conf.ts`, `tests/**/*.ts` |
| WebdriverIO v9 runner | `wdio.shared.conf.ts` + per-platform configs |
| Appium 2 driver orchestration | `@wdio/appium-service` in each platform config |
| Mobile Safari on iOS | `config/capabilities/ios.iphone.ts` (XCUITest) |
| Mobile Chrome on Android | `config/capabilities/android.samsung.ts` (UiAutomator2) |
| Screen Object Model | `tests/pageobjects/mobile/**` |
| Shared test logic | `tests/specs/mobile/**` re-used by both runners |
| Mocha + expect-webdriverio | imported in `wdio.shared.conf.ts` |
| Screenshots on failure | `afterTest` hook in `wdio.shared.conf.ts` |
| Allure reporting | `@wdio/allure-reporter` configured per platform |
| Smoke / regression tags | `@smoke`, `@regression` mocha grep filters |

---

## Tech stack

| Piece | Version | Why |
| --- | --- | --- |
| Node.js | 20.18+ | Aligns with WebdriverIO v9; Appium 2 requires `uuid` ESM-friendly runtime |
| TypeScript | ^5.4 | Strict-typed POM, no `any` in fixtures or screens |
| WebdriverIO | ^9.32 | Current stable; full async model + native W3C action support |
| `@wdio/cli` | ^9.32 | The `wdio` runner used by the npm scripts |
| `@wdio/mocha-framework` | ^9.32 | Mocha hooks (`describe` / `it` / `before` / `after`) |
| `@wdio/spec-reporter` | ^9.32 | Console-friendly live output |
| `@wdio/appium-service` | ^9.32 | Spawns Appium + tear-down on every `wdio run` |
| `@wdio/local-runner` | ^9 | In-process worker (one mobile session at a time) |
| `@wdio/allure-reporter` | ^9.32 | Allure JSON dataset per run |
| `allure-commandline` | ^2.27 | Renders `allure-results/` into a static site |
| Appium server | ^2.19 | Mature, W3C-protocol server; pairs with mature driver set |
| `appium-xcuitest-driver` | ^8.4 | Real Mobile Safari on the iPhone Simulator via XCUITest |
| `appium-uiautomator2-driver` | ^2.45 | Real Mobile Chrome on the Android Emulator via UiAutomator2 |
| Mocha | ^10 | Actually driven by `@wdio/mocha-framework`'s embedded Mocha |
| `expect-webdriverio` | ^4.15 | Fluent async assertions (matches for `element`, `browser`, etc.) |
| `dotenv` | ^16.4 | `.env` lookup for `config/env.ts` |
| `ts-node` | ^10.9 | TS config bootstrap when WDIO doesn't apply its own transformer |

### Why this Appium 2 / driver combination?

Appium 3 has a `uuid@11` transitive dependency that is **ESM-only**, and
that breaks under Node ≤ 20.18. The stable combination used here — Appium
2.19 + uiautomator2 2.45 + XCUITest 8.4 — works on every current macOS
host without surprising the user. The W3C protocol surface is identical to
Appium 3, so all the Appium 3-style `appium:` capability names remain
valid. When the user upgrades Node to ≥ 20.19 in the future they can swap
the pinned versions in `package.json` for the newer ones without touching
any test code.

---

## Repository layout

```
InsurTech_autologix_mobile-testing/
├── package.json
├── tsconfig.json
├── wdio.shared.conf.ts          # Shared runner settings
├── wdio.ios.conf.ts             # iOS-only runner (XCUITest)
├── wdio.android.conf.ts         # Android-only runner (UiAutomator2)
├── config/
│   ├── env.ts                   # Centralised env-var accessor
│   └── capabilities/
│       ├── ios.iphone.ts        # iPhone 17 + Safari via XCUITest
│       └── android.samsung.ts   # Samsung Galaxy + Chrome via UiAutomator2
├── tests/
│   ├── pageobjects/mobile/      # Screen Object Model
│   │   ├── BaseScreen.ts
│   │   ├── LoginScreen.ts
│   │   ├── RegisterScreen.ts
│   │   ├── DashboardScreen.ts
│   │   ├── VehiclesScreen.ts
│   │   ├── VehicleDetailsScreen.ts
│   │   ├── OffersScreen.ts
│   │   ├── InsurerScreens.ts
│   │   ├── ServiceScreens.ts
│   │   └── components/          # Re-usable HeaderComponent / SidebarComponent
│   ├── specs/mobile/            # The actual spec files
│   ├── fixtures/                # Session/login helpers
│   └── utils/                   # logger, validators, credentials, testData, apiClient
├── allure-results/              # generated by the reporter (gitignored)
├── test-results/                # screenshots + Appium logs (gitignored)
└── README.md
```

---

## Target runtime environments

These must already be present on the host. This repository does **not**
install them — it only points Appium at them.

| Runner | What's required on the macOS host |
| --- | --- |
| **iOS Safari** | Xcode 16+ (Apple ships iPhone 17 simulators from Xcode 16 onward), an active iPhone 17-series simulator, `appium-xcuitest-driver`, WebDriverAgent |
| **Android Chrome** | Android Studio with a "Samsung Galaxy S25" (or compatible) AVD running API 34/35, the latest stable Chrome, `appium-uiautomator2-driver` |

Pinning the device name/version happens through `.env` (see `.env.example`).

---

## Setup

1. **Install Node.js dependencies**
   ```bash
   cd /Users/alex/QA/Automation/InsurTech_autologix_mobile-testing
   npm install
   ```
   This pulls in Appium and the driver packages; the first run will
   install Appium's CLI globally if not present.

2. **Install the Appium drivers** (idempotent)
   ```bash
   npm run appium:install-drivers
   ```
   That runs `appium driver install uiautomator2` and
   `appium driver install xcuitest` so the framework can talk to the
   emulators / simulators out of the box.

3. **Create the .env**
   ```bash
   cp .env.example .env
   # Edit .env and provide the role credentials. They are published:
   #   USER_EMAIL / USER_PASSWORD       (customer)
   #   INSURER_EMAIL / INSURER_PASSWORD (insurer)
   #   SERVICE_EMAIL / SERVICE_PASSWORD (service)
   ```

4. **Boot the target device**
   - iOS Simulator — open it from Xcode 16+, pick *iPhone 17 Pro* and press the play icon.
   - Android Emulator — open the AVD Manager and start the Samsung Galaxy AVD.

5. **Sanity check**
   ```bash
   npm run lint   # tsc --noEmit, ensures the TypeScript still compiles
   ```

---

## Running the tests

| Command | What runs |
| --- | --- |
| `npm run test:ios` | Boots Appium → Mobile Safari → all `tests/specs/mobile/**/*.spec.ts` |
| `npm run test:android` | Boots Appium → Mobile Chrome → all mobile specs |
| `npm run test:both` | Runs iOS, then Android |
| `npm run test:smoke:ios` | iOS run filtered to `@smoke` |
| `npm run test:smoke:android` | Android run filtered to `@smoke` |
| `npm run test:regression:ios` | iOS run filtered to `@regression` |
| `npm run test:regression:android` | Android run filtered to `@regression` |
| `npm run test:ios:single -- <file>` | Run a single spec on iOS |
| `npm run test:android:single -- <file>` | Run a single spec on Android |

Tip: WebdriverIO forwards unknown CLI flags directly to the runner, so
any Mocha grep is supported:

```bash
npx wdio run wdio.ios.conf.ts --mochaOpts.grep="Dashboard"
```

---

## Reports

Every run produces an Allure dataset in `allure-results/`. To inspect:

```bash
# Generate a static HTML report and open it in the browser
npm run allure:generate
npm run allure:open

# Or just serve the most recent results
npm run allure:serve
```

Screenshots captured by the `afterTest` hook land in
`test-results/screenshots/<spec>/<test>.png`. Appium server logs go to
`test-results/wdio-logs/`.

---

## Selector strategy

The SPA is an Angular Material application whose class names are
hashed and whose copy is currently Polish. Selectors in this framework:

1. **Prefer stable attribute hooks** — `formcontrolname`, `name`,
   `aria-label`, `role`, `data-testid`. Survive copy changes.
2. **Bundle English + Polish text** — e.g. `button:has-text("Logout"),
   a:has-text("Wyloguj")` so the same screen works whether or not the
   browser-translation pipeline fires.
3. **Open the overflow menu first** — Material hides destructive
   actions behind the user-menu avatar on mobile. `HeaderComponent`
   encapsulates `openUserMenu()` and `logoutIfVisible()`.

If you have control over the production app, adding `data-testid` to
the most-touched controls is highly recommended — please collaborate
upstream.

---

## Architecture notes

- **Single POM tree, two runners.** All `tests/pageobjects/mobile/**`
  files are platform-agnostic; we deliberately abstract the swipe
  gesture inside `BaseScreen` rather than splitting the Page Model.
  A new platform (e.g. iPad landcape) only requires a new capabilities
  file + WDIO config.

- **Fixtures in TypeScript, not Mocha globals.** WebdriverIO + Mocha
  doesn't expose Playwright-style `test.extend`. Instead we expose
  `loginAs('customer') → CustomerBundle` so each spec builds the
  bundle it needs in a `before()` hook and uses the screens directly.

- **`@smoke` is the gate.** Tag every MVP path. CI gates promotions on
  the smoke runs; regression gives developers a daily pill.

- **Screenshots on failure is enabled by default**, but not screenshots
  on success — keeps Allure lean.

---

## Adding a new test

1. Pick (or add) a Screen in `tests/pageobjects/mobile/`.
2. Add a spec file in `tests/specs/mobile/`.
3. Use the `loginAs(role)` fixture for authenticated flows, or
   `openLogin()` for the public login screen.
4. Tag the spec with `@smoke` if it must always pass; `@regression` for
   broader coverage.

Example minimal spec:

```ts
import { expect } from 'expect-webdriverio';
import { loginAs } from '../../fixtures/auth.fixture';

describe('My new screen (mobile web)', () => {
  it('@smoke opens the dashboard', async () => {
    const bundle = await loginAs('customer');
    await bundle.dashboard.expectLoaded();
    expect(await bundle.dashboard.currentPath()).toMatch(/dashboard/);
  });
});
```

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| `ECONNREFUSED 127.0.0.1:4723` | Appium failed to start. Inspect `test-results/wdio-logs/appium-*.log`. The most common cause is a missing driver — run `npm run appium:install-drivers`. |
| `Unable to find a matching destination ...` | Simulator/Emulator wasn't booted. Open Xcode/Studio and start the device. |
| `Could not find iPhone 17` | Install the iPhone 17 simulator in Xcode → Settings → Platforms. |
| `chromedriver version mismatch` | Disable `ANDROID_CHROMEDRIVER_AUTODOWNLOAD` and pin a matching version, or let Appium auto-download a compatible build. |
| `document.readyState never reached complete` | The SPA hung. Confirm `APP_BASE_URL` is reachable from the host and the device can reach it. Sometimes the emulator's network is in airplane mode. |
| Tests look Polish-only | The page locale is `pl-PL`. We accept either language in assertions, but if you need pristine English, raise the translation issue upstream. |
| `No credentials configured for role "service"` | You haven't filled in `.env`. Copy `.env.example`, replace placeholder credentials. |

---

## License

MIT — feel free to fork and adapt for your own mobile-web QA efforts.
