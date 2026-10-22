import { h } from "../dom.ts";
import { appHref, bundled } from "../evidence.ts";
import { groupByScenario } from "../state.ts";
import { badge, link, list, p, section } from "../ui.ts";

export function renderScenarios(): HTMLElement {
  const sets = bundled();
  const ids: string[] = [];
  for (const s of sets) for (const g of groupByScenario(s.suite)) if (!ids.includes(g.id)) ids.push(g.id);

  const blocks: HTMLElement[] = [];
  for (const id of ids) {
    let first = null as null | ReturnType<typeof groupByScenario>[number]["runs"][number]["report"];
    const rows: HTMLElement[] = [];
    const where: string[] = [];
    const missing: string[] = [];
    for (const s of sets) {
      const g = groupByScenario(s.suite).find((x) => x.id === id);
      if (!g) {
        missing.push(s.label);
        continue;
      }
      where.push(s.label);
      for (const { index, report: r } of g.runs) {
        first ??= r;
        rows.push(
          h(
            "tr",
            {},
            h("td", {}, s.label),
            h("td", {}, r.deployment.store === "memory" ? "isolated memory" : "shared sqlite"),
            h("td", {}, r.deployment.mode),
            h("td", {}, r.scenario.variant ?? "none"),
            h("td", {}, badge(r.verdict.toUpperCase(), r.verdict === "pass" ? "ok" : r.verdict === "fail" ? "bad" : "warn"), ` expected ${r.expectation.toUpperCase()}`),
            h("td", {}, link(appHref(s.id, index), "Open")),
          ),
        );
      }
    }
    if (!first) continue;
    blocks.push(
      section(
        `sc-${id}`,
        `${first.scenario.title} (${id})`,
        p(h("strong", {}, "Invariant: "), first.scenario.invariant),
        h("h3", {}, "What it does"),
        list(first.scenario.faultSchedule.map((s) => [s])),
        p(h("strong", {}, "Ran against: "), where.join("; "), missing.length ? `. Not in the bundled ${missing.join(" or ")} suite.` : "."),
        h(
          "div",
          { class: "tablewrap" },
          h(
            "table",
            {},
            h("caption", {}, `Recorded runs of ${id}`),
            h("thead", {}, h("tr", {}, ...["Evidence", "Store", "Mode", "Variant", "Verdict", "Result"].map((t) => h("th", { scope: "col" }, t)))),
            h("tbody", {}, ...rows),
          ),
        ),
      ),
    );
  }
  const total = sets.reduce((n, s) => n + s.suite.reports.length, 0);
  return h(
    "div",
    { class: "page" },
    h("h1", {}, "Scenarios"),
    p(`${ids.length} scenarios, ${total} recorded runs across ${sets.length} bundled suites. Verdicts are read from the recorded reports. A FAIL on an isolated-memory run is the expected demonstration, not a defect of the page. Nothing runs in your browser.`),
    ...blocks,
  );
}
