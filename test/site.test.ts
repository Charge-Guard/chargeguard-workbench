import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bundled } from "../src/evidence.ts";

let current: { stop: () => void } | null = null;
async function boot(path: string): Promise<void> {
  current?.stop();
  document.body.replaceChildren();
  document.head.querySelector('meta[name="description"]')?.remove();
  document.body.append(Object.assign(document.createElement("div"), { id: "site" }));
  history.replaceState(null, "", path);
  vi.resetModules();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  current = (await import("../src/main.ts")).router;
}
const h1 = () => document.querySelector("h1")?.textContent ?? "";

describe("router", () => {
  afterEach(() => vi.restoreAllMocks());
  const cases: Array<[string, string]> = [
    ["/", "ChargeGuard"],
    ["/app", "ChargeGuard workbench"],
    ["/scenarios", "Scenarios"],
    ["/levels", "The four levels"],
    ["/docs", "Getting started"],
    ["/about", "About ChargeGuard"],
    ["/privacy", "Privacy policy"],
    ["/terms", "Terms of use"],
    ["/nope/at/all", "Page not found"],
  ];
  for (const [path, title] of cases) {
    it(`renders ${path}`, async () => {
      await boot(path);
      expect(h1()).toBe(title);
      expect(document.title.length).toBeGreaterThan(5);
      expect(document.querySelector('meta[name="description"]')?.getAttribute("content")?.length).toBeGreaterThan(20);
      expect(document.querySelectorAll("main, header, nav, footer").length).toBeGreaterThanOrEqual(4);
    });
  }

  it("navigates without reloading, marks the current page, moves focus and supports back", async () => {
    await boot("/");
    const marker = document.getElementById("site");
    (document.querySelector('.site-nav a[href="/docs"]') as HTMLAnchorElement).click();
    expect(location.pathname).toBe("/docs");
    expect(document.getElementById("site")).toBe(marker);
    expect(document.querySelector('.site-nav a[aria-current="page"]')?.getAttribute("href")).toBe("/docs");
    expect(document.activeElement?.tagName).toBe("H1");
    expect(document.title).toBe("Docs · ChargeGuard");
    history.back();
    await new Promise((r) => setTimeout(r, 30));
    expect(location.pathname).toBe("/");
    expect(h1()).toBe("ChargeGuard");
  });

  it("opens /app at a deep-linked run", async () => {
    await boot("/app?suite=testnet&run=1");
    expect(document.querySelector("#run-detail .run")).not.toBeNull();
    expect(document.querySelector("#tab-testnet")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("accepts the old hash deep link and rewrites it to query form", async () => {
    await boot("/app#testnet/2");
    expect(document.querySelector("#run-detail .run")).not.toBeNull();
    expect(location.search).toBe("?suite=testnet&run=2");
  });
});

describe("shell", () => {
  it("toggles the mobile menu with aria-expanded and closes it on Escape", async () => {
    await boot("/");
    const t = document.querySelector(".menu-toggle") as HTMLButtonElement;
    expect(t.getAttribute("aria-expanded")).toBe("false");
    t.click();
    expect(t.getAttribute("aria-expanded")).toBe("true");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(t.getAttribute("aria-expanded")).toBe("false");
  });
  it("has a skip link, and footer columns with legal links", async () => {
    await boot("/");
    expect(document.querySelector('a.skip[href="#main"]')).not.toBeNull();
    expect(document.querySelectorAll("footer .fcol").length).toBe(4);
    expect(document.querySelector("footer")?.textContent).toContain("0.2.0");
  });
});

describe("legal pages", () => {
  it("are dated 22 October 2026", async () => {
    for (const path of ["/privacy", "/terms"]) {
      await boot(path);
      expect(document.querySelector("main")?.textContent).toContain("22 October 2026");
    }
  });
});

describe("scenario and level pages", () => {
  it("link every bundled run to /app with its suite and index, with the recorded verdict", async () => {
    await boot("/scenarios");
    let n = 0;
    for (const b of bundled()) {
      b.suite.reports.forEach((r, i) => {
        const a = document.querySelector(`a[href="/app?suite=${b.id}&run=${i}"]`);
        expect(a, `${b.id}/${i}`).not.toBeNull();
        expect(a!.closest("tr")!.textContent).toContain(r.verdict.toUpperCase());
        n++;
      });
    }
    expect(n).toBe(30);
  });
  it("quotes the real values of the worked example", async () => {
    await boot("/levels");
    const r = bundled()[0]!.suite.reports.find((x) => x.scenario.variant === "unconfirmed-then-lands")!;
    const text = document.querySelector("main")!.textContent!;
    expect(text).toContain(r.payments[0]!.note!);
    expect(text).toContain(r.payments[0]!.txHash.slice(0, 8));
  });
});

describe("policy", () => {
  it("keeps the CSP meta tag and vercel.json in sync with no network origin beyond self", () => {
    const html = readFileSync("index.html", "utf8");
    const meta = /Content-Security-Policy" content="([^"]+)"/.exec(html)![1]!;
    const header = JSON.parse(readFileSync("vercel.json", "utf8")).headers[0].headers.find((x: { key: string }) => x.key === "Content-Security-Policy").value as string;
    expect(meta).toBe(header);
    expect(meta).toContain("connect-src 'self';");
    expect(meta).not.toMatch(/unsafe-/);
  });
  it("uses no banned words or emoji in page sources", () => {
    const banned = /seamless|robust|powerful|revolutioni|cutting-edge|leverage|unlock|empower|game-changer|next-generation|world-class|best-in-class|sparkle/i;
    for (const f of ["landing", "levels", "scenarios", "docs", "about", "privacy", "terms", "notfound"]) expect(readFileSync(`src/pages/${f}.ts`, "utf8"), f).not.toMatch(banned);
  });
});
