import { h } from "../dom.ts";
import { appHref, bundled, findRun } from "../evidence.ts";
import { levelText } from "../state.ts";
import { shortHash } from "../state.ts";
import { badge, link, list, p, section } from "../ui.ts";

const LEVELS: Array<[string, string, string]> = [
  ["1. Accepted credential", "A worker verified the credential and answered 200 with a receipt.", "Seen in the workers' own logs, cross-checked with the client's responses. Replay protection decides this level."],
  ["2. Submitted transaction", "A transaction for the payment reached a Stellar node. In pull mode the worker sent it; in push mode the payer did.", "Seen in the chain endpoint's send log."],
  ["3. Confirmation", "The ledger reports SUCCESS, FAILED or not found for the transaction.", "Asked by the runner directly. It is never a worker's claim."],
  ["4. Fulfillment", "The paid resource was delivered. It can be delivered once, never, or more than once.", "Seen in the workers' fulfillment logs."],
];

export function renderLevels(): HTMLElement {
  const ex = findRun("integration", (r) => r.scenario.variant === "unconfirmed-then-lands");
  const memory = findRun("integration", (r) => r.scenario.id === "repeated-credential" && r.deployment.store === "memory" && r.deployment.mode === "push");
  const stops: HTMLElement[] = [];
  for (const b of bundled()) {
    b.suite.reports.forEach((r, i) => {
      for (const pay of r.payments) {
        if (pay.levels.submitted !== null && pay.levels.fulfilled === 0) {
          stops.push(
            h(
              "li",
              {},
              link(appHref(b.id, i), `${r.scenario.id}${r.scenario.variant ? ` / ${r.scenario.variant}` : ""}`),
              ` (${b.label}): accepted ${pay.levels.accepted}, submitted ${levelText(pay.levels, "submitted")}, confirmed ${levelText(pay.levels, "confirmed")}, ${levelText(pay.levels, "fulfilled")}.`,
            ),
          );
        }
      }
    });
  }

  const sections: Node[] = [
    h("h1", {}, "The four levels"),
    p("Every payment is reported at four levels that are kept apart. They are four different facts, observed in four different places. A single paid flag would hide the gaps between them."),
    h("ul", { class: "levels-list" }, ...LEVELS.map(([t, d, o]) => h("li", {}, h("strong", {}, t), p(d), p(h("span", { class: "muted" }, o))))),
  ];

  if (ex) {
    const pay = ex.report.payments[0]!;
    const store = ex.report.observations.find((o) => o.startsWith("While unresolved")) ?? "";
    sections.push(
      section(
        "worked",
        "A worked example from a recorded run",
        p(`Run: ${ex.report.scenario.id} / ${ex.report.scenario.variant}, ${ex.report.deployment.store} store, ${ex.report.deployment.mode} mode, recorded ${ex.report.generatedAt.slice(0, 10)} against the local stub chain. Its confirmations are simulated.`),
        h(
          "dl",
          { class: "facts" },
          h("dt", {}, "Level 1, accepted"), h("dd", {}, `${pay.levels.accepted}. No worker answered 200.`),
          h("dt", {}, "Level 2, submitted"), h("dd", {}, `${levelText(pay.levels, "submitted")}. Transaction ${shortHash(pay.txHash)} was sent once.`),
          h("dt", {}, "Level 3, confirmation"), h("dd", {}, `${pay.levels.confirmed}, after the runner landed the transaction on the stub.`),
          h("dt", {}, "Level 4, fulfilled"), h("dd", {}, `${pay.levels.fulfilled}. ${levelText(pay.levels, "fulfilled")}.`),
        ),
        p(h("strong", {}, "Recorded note: "), pay.note ?? ""),
        store ? p(h("strong", {}, "Recorded observation: "), store) : null,
        p(link(appHref("integration", ex.index), "Open this run in the app"), " ", badge(ex.report.verdict.toUpperCase(), ex.report.verdict === "pass" ? "ok" : "bad"), " The check set passed because the scenario's invariant is that nothing is delivered while settlement is unresolved. The payment still needs reconciliation by the operator."),
      ),
    );
  }

  sections.push(
    section(
      "why",
      "Why a payment can reach level two and stop",
      p("Submitting a transaction does not make a worker accept a credential, and acceptance is what triggers delivery. In the recorded runs the payment stopped after level two for these reasons:"),
      list([
        ["The worker broadcast but could not confirm in time, so it refused to deliver and refused to broadcast again. The challenge stayed claimed (unconfirmed-then-lands)."],
        ["The chain reported FAILED. The SDK treats an on-chain failure like an ambiguous one and leaves the challenge locked (onchain-failed)."],
        ["The store failed after the broadcast, so the payment was confirmed with no delivery (store-fault-after-broadcast)."],
        ["A lookup outage during push verification burned the challenge before the payer could be served (verification-rpc-outage)."],
      ]),
      p("Refusing to deliver is the intended behaviour in these runs. The cost is a payer who has paid and needs a reconciliation or a new challenge."),
      stops.length ? h("div", {}, h("h3", {}, "Every bundled payment that was submitted and never delivered"), h("ul", {}, ...stops)) : null,
    ),
  );

  if (memory) {
    const pay = memory.report.payments[0]!;
    sections.push(
      section(
        "opposite",
        "The opposite failure: more than one delivery",
        p(`With one in-memory store per worker (${memory.report.scenario.id}, push), the recorded payment shows accepted ${pay.levels.accepted}, confirmation ${pay.levels.confirmed}, ${levelText(pay.levels, "fulfilled")}. One payment, two deliveries. `, link(appHref("integration", memory.index), "Open this run")),
      ),
    );
  }

  sections.push(
    section(
      "claims",
      "What this does not claim",
      p("These are finite recorded runs. They are evidence, not a proof of linearizability or exactly-once delivery. The testnet suite has no ambiguous-settlement runs, so the examples above come from the stub chain."),
    ),
  );
  return h("div", { class: "page" }, ...sections);
}
