import { afterEach, describe, expect, it, vi } from "vitest";
import { renderPage, ROUTES } from "../src/pages.ts";
import { DATASETS } from "../src/data.ts";

afterEach(() => { document.body.replaceChildren(); });

describe("site routes", () => {
  it("renders every informational route and a 404", () => {
    for (const [route, title] of ROUTES.filter(([route]) => route !== "/app")) {
      const page = renderPage(route);
      expect(page.querySelector("h1"), title).not.toBeNull();
    }
    expect(renderPage("/missing").textContent).toContain("Page not found");
  });
  it("links every scenario to its actual dataset and recorded run", () => {
    const page = renderPage("/scenarios");
    let count = 0;
    for (const dataset of DATASETS) {
      if (!dataset.suite.ok) continue;
      dataset.suite.suite.reports.forEach((report, index) => {
        const link = page.querySelector(`a[href="/app#${dataset.id}/${index}"]`);
        expect(link?.textContent).toContain(report.verdict.toUpperCase());
        count++;
      });
    }
    expect(page.querySelectorAll("a")).toHaveLength(count);
  });
  it("navigates to the tool, supports back navigation, and toggles its mobile menu", async () => {
    document.body.append(Object.assign(document.createElement("div"), { id: "site" }));
    history.replaceState(null, "", "/");
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    await import("../src/main.ts");
    (document.querySelector(".menu-toggle") as HTMLButtonElement).click();
    expect(document.querySelector(".menu-toggle")?.getAttribute("aria-expanded")).toBe("true");
    (document.querySelector('a[href="/app"]') as HTMLAnchorElement).click();
    expect(location.pathname).toBe("/app");
    expect(document.querySelectorAll(".runbtn")).toHaveLength(21);
    history.replaceState(null, "", "/levels");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(document.querySelector("h1")?.textContent).toContain("Four levels");
    expect(document.activeElement?.id).toBe("main");
  });
});
