import type { Route } from "./router.ts";
import { renderAbout } from "./pages/about.ts";
import { mountWorkbench, renderAppHost } from "./pages/app.ts";
import { renderDocs } from "./pages/docs.ts";
import { renderLanding } from "./pages/landing.ts";
import { renderLevels } from "./pages/levels.ts";
import { renderNotFound } from "./pages/notfound.ts";
import { renderPrivacy } from "./pages/privacy.ts";
import { renderScenarios } from "./pages/scenarios.ts";
import { renderTerms } from "./pages/terms.ts";

export const HOME_TITLE = "ChargeGuard · Replay protection tests for Stellar MPP charge";

export const ROUTES: Route[] = [
  { path: "/", title: "Home", description: "Test Stellar MPP charge replay protection across workers. Recorded runs, four levels per payment, open source.", render: renderLanding },
  { path: "/app", title: "App", description: "Recorded ChargeGuard evidence: two worker processes behind one Stellar MPP charge endpoint, with isolated memory stores failing a repeated credential and a shared store passing.", render: renderAppHost, after: mountWorkbench },
  { path: "/scenarios", title: "Scenarios", description: "Every scenario in the bundled ChargeGuard suites, the stores it ran against and the recorded verdict for each.", render: renderScenarios },
  { path: "/levels", title: "The four levels", description: "Accepted credential, submitted transaction, confirmation and fulfillment explained with a worked example from a recorded run.", render: renderLevels },
  { path: "/docs", title: "Docs", description: "Run the ChargeGuard runner locally, record a suite and open it in the app.", render: renderDocs },
  { path: "/about", title: "About", description: "What ChargeGuard is, why it exists, who maintains it and how to contribute.", render: renderAbout },
  { path: "/privacy", title: "Privacy", description: "Privacy policy for the ChargeGuard app.", render: renderPrivacy },
  { path: "/terms", title: "Terms", description: "Terms of use for the ChargeGuard app.", render: renderTerms },
];

export const NOT_FOUND: Route = { path: "*", title: "Page not found", description: "This address does not match a page on this site.", render: renderNotFound };
