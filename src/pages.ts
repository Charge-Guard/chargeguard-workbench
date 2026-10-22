import { DATASETS } from "./data.ts";
import { h } from "./dom.ts";
import { groupByScenario } from "./state.ts";
import { APP_DOCS, APP_REPO, POLICY_DATE, RUNNER_DOCS, RUNNER_REPO, VALUE } from "./site.ts";
import { codeBlock, ext, link, list, p, section } from "./ui.ts";

export const ROUTES = [["/", "Home"], ["/app", "Workbench"], ["/scenarios", "Scenarios"], ["/levels", "Four levels"], ["/docs", "Docs"], ["/about", "About"], ["/privacy", "Privacy"], ["/terms", "Terms"]] as const;
export const pageTitle = (path: string): string => ROUTES.find(([href]) => href === path)?.[1] ?? "Page not found";
const article = (title: string, ...children: Node[]) => h("article", { class: "page" }, h("h1", {}, title), ...children);

export function renderPage(path: string): HTMLElement {
  switch (path) {
    case "/": return article("A payment can settle while replay protection fails.",
      p(VALUE),
      p("ChargeGuard records the same charge endpoint behind two worker processes. Compare isolated stores with a shared store, then inspect acceptance, submission, confirmation and delivery separately."),
      h("div", { class: "actions" }, link("/app", "Open the recorded workbench", "btn"), link("/docs", "Run the CLI yourself", "btn secondary")),
      section("evidence", "Start with evidence", p("The workbench bundles integration runs against a stub chain and separate testnet settlement runs. An expected failure demonstrates the broken deployment; it is not hidden or converted to a pass."), link("/scenarios", "Browse scenarios and recorded verdicts")),
      section("scope", "What it covers", p("Stellar MPP charge mode with unsponsored payments. The runner drives its own fixture server; it does not test an arbitrary production endpoint. A finite run is not a proof of exactly-once delivery.")),
      section("workflow", "Run, inspect, compare", list([["Run a suite locally with the runner."], ["Open its report JSON in the workbench. Files stay in your browser."], ["Inspect worker timelines, checks and the four delivery levels."]], true)));
    case "/scenarios": {
      const cards: HTMLElement[] = [];
      for (const dataset of DATASETS) {
        if (!dataset.suite.ok) continue;
        for (const group of groupByScenario(dataset.suite.suite)) {
          const report = group.runs[0]!.report;
          cards.push(section(`${dataset.id}-${group.id}`, report.scenario.title,
            p(`${dataset.label}. Invariant: ${report.scenario.invariant}`),
            list(group.runs.map(({ index, report: r }) => [link(`/app#${dataset.id}/${index}`, `${r.deployment.store}, ${r.deployment.mode}${r.scenario.variant ? `, ${r.scenario.variant}` : ""}: ${r.verdict.toUpperCase()} (expected ${r.expectation.toUpperCase()})`)]))));
        }
      }
      return article("Scenario gallery", p("Every verdict below is read from the bundled runner report. Integration uses a stub chain; testnet settlement is labelled separately. No scenario runs in this page."), ...cards);
    }
    case "/levels": return article("Four levels, four different observations",
      p("HTTP acceptance is not ledger confirmation, and ledger confirmation is not delivery of the paid resource."),
      section("accepted", "1. Accepted", p("A worker verified a credential and answered 200. More than one acceptance for the same payment can expose a store failure even if the chain later refuses a duplicate.")),
      section("submitted", "2. Submitted", p("A transaction for the payment reached a Stellar node. Submission alone does not establish that the transaction succeeded.")),
      section("confirmed", "3. Confirmed", p("The runner observed the transaction's ledger status. Stub-chain observations and real testnet settlement remain separate evidence classes.")),
      section("fulfilled", "4. Fulfilled", p("A worker's fulfillment log records delivery of the paid resource. A settled payment can have no recorded delivery, or several deliveries.")),
      section("modes", "Push and pull credentials", p("In push mode the payer broadcasts first, so the replay store must prevent reuse of the confirmed hash. In pull mode the worker broadcasts the signed transaction; the ledger's sequence rule can reject a repeat even when the store has failed.")),
      link("/app", "Inspect the levels side by side"));
    case "/docs": return article("Run ChargeGuard and read its reports",
      section("install", "Install the runner", codeBlock("npm install -g @anas.abubakar/chargeguard-runner@0.1.1", "install command")),
      section("run", "Record a local stub suite", codeBlock("chargeguard suite --backend stub --out suite.json --text-out suite.txt", "suite command"), p("This command records integration evidence against a stub chain, not a real network. See the runner guide for testnet setup and its limits.")),
      section("open", "Open your evidence", p("Choose a run or suite JSON under 'Open a report you recorded' in the workbench. Schema and consistency checks run locally; malformed or contradictory reports are rejected."), link("/app", "Open the workbench")),
      section("references", "Reference and source", list([[ext(RUNNER_DOCS, "Runner documentation")], [ext(APP_DOCS, "Workbench documentation")], [ext(RUNNER_REPO, "Runner source and issues")], [ext(APP_REPO, "Workbench source and issues")]])));
    case "/about": return article("About ChargeGuard", p("ChargeGuard is maintained by Anas Abubakar and Abdulbasit Fazazi. It investigates replay-protection assumptions across workers in a Stellar MPP charge deployment."), p("The runner records observations. The workbench validates and displays them without recomputing verdicts. No maintainer, customer or outside reviewer has validated the deployment design."), p("MIT licensed. There is no claim of audit, certification, endorsement or production adoption."), ext(APP_REPO + "/issues", "Report an issue"));
    case "/privacy": return article("Privacy", p(`Updated ${POLICY_DATE}.`), p("Report files are parsed in memory in your browser and are not uploaded. This app has no analytics, cookies, local storage or third-party fonts. It makes no data API requests."), p("The hosting provider receives normal page and asset requests and may log your IP address and browser information. Opening an external documentation or source link sends a request to that destination."), p("Reloading clears any report you opened. Shared URLs can contain a bundled dataset and run index, but never your uploaded report."), ext(APP_REPO + "/issues", "Contact the maintainers through a public issue; do not include private reports"));
    case "/terms": return article("Terms", p(`Updated ${POLICY_DATE}.`), p("ChargeGuard is provided under the MIT license, without warranty. You are responsible for checking the evidence and its limits before making deployment decisions."), p("Recorded testnet or stub results do not establish behavior on mainnet, under every schedule or in your own infrastructure. This workbench does not hold keys, submit transactions or run scenarios."), ext(APP_REPO + "/blob/main/LICENSE", "Read the MIT license"));
    default: return article("Page not found", p("This address does not match a ChargeGuard page."), link("/", "Go home"), link("/app", "Open the workbench"));
  }
}
