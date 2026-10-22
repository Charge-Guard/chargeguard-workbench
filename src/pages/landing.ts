import { h } from "../dom.ts";
import { appHref, findRun, presentationStatuses } from "../evidence.ts";
import { APP_REPO, DISCUSSIONS, ISSUES, RUNNER_REPO, VALUE } from "../site.ts";
import { PAIRING } from "../data.ts";
import { badge, codeBlock, ext, link, list, p, section } from "../ui.ts";

function exampleTable(): HTMLElement | null {
  const a = findRun("integration", (r) => r.scenario.id === "repeated-credential" && r.deployment.store === "memory" && r.deployment.mode === "push");
  const b = findRun("integration", (r) => r.scenario.id === "repeated-credential" && r.deployment.store === "sqlite" && r.deployment.mode === "push");
  if (!a || !b) return null;
  const row = (label: string, x: { index: number; report: typeof a.report }) => {
    const pay = x.report.payments[0]!;
    return h(
      "tr",
      {},
      h("th", { scope: "row" }, label),
      h("td", {}, presentationStatuses(x.report).join(", ")),
      h("td", {}, String(pay.levels.accepted)),
      h("td", {}, String(pay.levels.fulfilled)),
      h("td", {}, badge(x.report.verdict.toUpperCase(), x.report.verdict === "pass" ? "ok" : "bad"), " ", link(appHref("integration", x.index), "Open this run")),
    );
  };
  return h(
    "div",
    { class: "tablewrap" },
    h(
      "table",
      {},
      h("caption", {}, "One push credential presented to worker-a, then worker-b, then worker-a again. Recorded against the local stub chain."),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Store"), h("th", { scope: "col" }, "HTTP statuses"), h("th", { scope: "col" }, "Accepted"), h("th", { scope: "col" }, "Delivered"), h("th", { scope: "col" }, "Verdict"))),
      h("tbody", {}, row("One in-memory store per worker", a), row("One shared SQLite store", b)),
    ),
  );
}

export function renderLanding(): HTMLElement {
  const example = exampleTable();
  return h(
    "div",
    { class: "page landing" },
    h(
      "section",
      { class: "hero" },
      h("h1", {}, "ChargeGuard"),
      p(h("strong", { class: "value" }, VALUE)),
      p("ChargeGuard starts two real worker processes on the official Stellar MPP charge integration and points both at a replay-protection store you choose. It repeats, races, kills, locks and starves that store while a real client pays, and reports every payment at four separate levels."),
      h("div", { class: "actions" }, link("/app", "Open the app", "btn"), link("/docs", "Read the docs", "btn secondary")),
      p("Runs on: Stellar MPP charge mode (@stellar/mpp 0.7.1, mppx 0.6.31) · local stub chain and Stellar testnet. Not mainnet."),
    ),
    section(
      "problem",
      "The problem",
      p("The SDK states that replay protection needs a store whose update() is a linearizable compare-and-set shared by every instance, and that a per-instance Store.memory() is not enough. Your SDK can be correct while your deployment breaks that assumption."),
      p("In the recorded run with one private in-memory store per worker, the same credential was accepted by both workers and one payment bought two deliveries."),
      p("A single paid flag hides this. A payment can be confirmed on chain and never delivered, or delivered twice. ChargeGuard keeps those facts apart."),
    ),
    section(
      "how",
      "How it works",
      list(
        [
          ["Start two worker OS processes that serve one paid HTTP endpoint on @stellar/mpp, both using the store you name: memory or a shared sqlite file."],
          ["A real client pays, then the runner repeats the credential, races it, kills a worker, locks the store or delays settlement."],
          ["The runner records every request, every injected fault and every transaction the chain endpoint saw, and asks the chain for confirmation itself."],
          ["It writes a versioned JSON report. This app validates it against the v1 schema in your browser and shows it without recomputing the verdict."],
        ],
        true,
      ),
    ),
    section(
      "checks",
      "What you get",
      h(
        "div",
        { class: "grid" },
        ...[
          ["Six scenarios", "Repeated credential, concurrent submission, restart persistence, storage unavailable, challenge consumption and ambiguous settlement."],
          ["Four levels per payment", "Accepted credential, submitted transaction, chain confirmation and service fulfillment, never merged into one flag."],
          ["Push and pull credentials", "Pull: the worker broadcasts. Push: the payer broadcasts and the worker looks the hash up."],
          ["A shared atomic store", "A SQLite adapter on node:sqlite that fails closed with HTTP 503 and never falls back to local state."],
          ["Labelled evidence classes", "In-process, integration (stub chain) and testnet settlement are never mixed in one report."],
          ["Reports that are checked", "Verdicts, expectations and totals that contradict their own checks are rejected on load."],
        ].map(([t, d]) => h("div", { class: "card" }, h("h3", {}, t!), p(d!))),
      ),
    ),
    section(
      "example",
      "A recorded example",
      p("This table is read from the bundled integration suite, not typed in."),
      example,
      p(link("/levels", "Read how the four levels differ"), " · ", link("/scenarios", "Browse every scenario and verdict")),
    ),
    section(
      "stellar",
      "Built on Stellar",
      list([
        ["MPP charge mode on Stellar: the system under test is the official @stellar/mpp charge method, unsponsored, behind mppx."],
        ["Stellar Asset Contract transfers on testnet: the testnet suite settles real payments through a logging pass-through to Soroban testnet RPC."],
        ["The shared store's atomic consume: a challenge is claimed through the store's update(), which the SQLite adapter runs as BEGIN IMMEDIATE."],
      ]),
    ),
    section(
      "stack",
      "Use it in your stack",
      codeBlock("npm install @anas.abubakar/chargeguard-runner", "install command"),
      codeBlock("chargeguard suite --backend stub --out suite.json --text-out suite.txt", "suite command"),
      p("The CLI is called chargeguard. Open the resulting suite.json in the ", link("/app", "app"), ". See ", link("/docs", "the docs"), " for the commands in the runner README."),
    ),
    section(
      "limits",
      "What it does not do",
      list([
        ["A finite number of runs is evidence, not proof. It does not show linearizability or exactly-once delivery."],
        ["Charge mode only, unsponsored, testnet only. No payment channels, no sponsored feePayer path, no mainnet."],
        ["It tests the runner's reference server, a thin wrapper on the SDK, not your own server code."],
        ["The stub chain is a stub: its confirmations are simulated. Testnet runs are a single observation of a shared network."],
        ["SQLite needs a local filesystem. Redis and PostgreSQL stores are not exercised."],
        ["Not an audit, and not endorsed by Stellar, the SDK authors or the mppx maintainers."],
      ]),
    ),
    section(
      "open",
      "Open source",
      p(`MIT licensed. The runner (${PAIRING.package} ${PAIRING.version}) and this app are developed in public. Read `, ext(RUNNER_REPO, "the runner"), " and ", ext(APP_REPO, "this app"), ", file or pick up an ", ext(`${ISSUES}?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`, "good first issue"), ", read ", ext(`${APP_REPO}/blob/main/CONTRIBUTING.md`, "CONTRIBUTING.md"), " or ask in ", ext(DISCUSSIONS, "Discussions"), "."),
    ),
  );
}
