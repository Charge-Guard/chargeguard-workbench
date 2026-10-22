import { h } from "../dom.ts";
import { APP_DOCS, APP_REPO, NPM_URL, RUNNER_DOCS, RUNNER_REPO } from "../site.ts";
import { codeBlock, ext, link, list, p, section } from "../ui.ts";

export function renderDocs(): HTMLElement {
  return h(
    "div",
    { class: "page" },
    h("h1", {}, "Getting started"),
    p("The runner records evidence. This app shows it. You can read the bundled recordings without installing anything."),
    section("need", "What you need", list([["Node 22.13 or newer (the runner was developed on 24.19) and pnpm."], ["The openssl command line tool, which the stub chain uses for a per-run certificate."], ["For testnet runs only: two throwaway funded testnet accounts and the stellar CLI."]])),
    section(
      "run",
      "Run the core locally",
      p("From the runner README. The first command pair shows the failing deployment, then the passing one."),
      codeBlock("git clone https://github.com/Charge-Guard/chargeguard-runner chargeguard-runner && cd chargeguard-runner\npnpm install --frozen-lockfile && pnpm build\n\nnode dist/cli.js run repeated-credential --store memory --mode push   # exit 1: the failing deployment\nnode dist/cli.js run repeated-credential --store sqlite --mode push   # exit 0: shared atomic store", "runner quick start"),
      p("Other commands:"),
      codeBlock("node dist/cli.js list\nnode dist/cli.js run <scenario> [--store memory|sqlite] [--mode push|pull] [--variant <v>] [--rounds <n>] [--backend stub|testnet] [--out report.json] [--text-out report.txt]\nnode dist/cli.js suite [--backend stub|testnet] [--only <scenario,...>] [--out suite.json] [--text-out suite.txt]\nnode dist/cli.js validate report.json", "runner commands"),
      p("Or install the published package: "),
      codeBlock("npm install @anas.abubakar/chargeguard-runner", "npm install command"),
      p("Testnet needs throwaway funded keys in the environment. They are never written to a file or report."),
      codeBlock("stellar keys generate cg-payer --network testnet --fund && stellar keys generate cg-recipient --network testnet --fund\nexport CHARGEGUARD_PAYER_SECRETS=$(stellar keys show cg-payer) CHARGEGUARD_RECIPIENT=$(stellar keys address cg-recipient)\nnode dist/cli.js suite --backend testnet --out suite-testnet.json", "testnet commands"),
      p("Exit codes: 0 every invariant held (run) or every run matched its expectation (suite); 1 an invariant was violated or an expectation was not met; 2 invalid usage or an invalid report; 3 inconclusive. A control run on isolated memory stores expects to fail, so run exits 1 and suite counts it as matching."),
    ),
    section(
      "load",
      "Load your own data into this app",
      list([
        ["Record a run or a suite with --out, as above."],
        ["Open the ", link("/app", "app"), " and pick the JSON file under \"Open a report you recorded\"."],
        ["The file is validated against the v1 schema in your browser and is never uploaded. Reports whose verdict contradicts their checks are refused. Only report version 1 is read."],
      ]),
      p("To run this app locally:"),
      codeBlock("pnpm install --frozen-lockfile\npnpm dev          # or: pnpm build && pnpm preview\npnpm test", "app commands"),
      p(h("span", {}, "Deep links: "), h("code", {}, "/app?suite=testnet&run=3"), " opens run 3 of the testnet suite. Use ", h("code", {}, "suite=integration"), " for the stub-chain suite and add ", h("code", {}, "mode=pull"), " for the pull comparison."),
    ),
    section("more", "Full documentation", list([[ext(RUNNER_DOCS, "Runner documentation (GitBook)")], [ext(APP_DOCS, "App documentation (GitBook)")], [ext(RUNNER_REPO, "Runner repository")], [ext(APP_REPO, "App repository")], [ext(NPM_URL, "Runner package on npm")]])),
  );
}
