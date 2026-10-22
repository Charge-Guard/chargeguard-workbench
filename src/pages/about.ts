import { PAIRING } from "../data.ts";
import { h } from "../dom.ts";
import { APP_REPO, DISCUSSIONS, ISSUES, RUNNER_REPO, VERSION } from "../site.ts";
import { ext, link, list, p, section } from "../ui.ts";

export function renderAbout(): HTMLElement {
  return h(
    "div",
    { class: "page" },
    h("h1", {}, "About ChargeGuard"),
    section("what", "What it is", p("ChargeGuard tests a deployment, not an SDK. The runner starts two worker processes on the official Stellar MPP charge integration and exercises challenge consumption, restart persistence, storage unavailability and ambiguous settlement against a replay-protection store you choose. This app shows the recorded results.")),
    section(
      "why",
      "Why it exists",
      p("The SDK says a per-instance in-memory store is not enough for replay protection across instances. That is easy to read and easy to miss in a real deployment with more than one worker."),
      p("ChargeGuard turns the sentence into a recorded failure and a recorded pass, and it reports each payment at four separate levels so that a payment that is paid but not delivered, or delivered twice, is visible."),
    ),
    section("fit", "How the core and the app fit together", p(ext(RUNNER_REPO, "chargeguard-runner"), " is the core: the CLI, the workers, the stores and the report schemas. ", ext(APP_REPO, "chargeguard-workbench"), " is this static app. It holds a copy of the runner's schemas and recorded suites, stamped with version and checksums, and it computes no verdicts of its own.")),
    section(
      "people",
      "Maintainers",
      h(
        "div",
        { class: "tablewrap" },
        h(
          "table",
          {},
          h("caption", {}, "From the repository README"),
          h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Maintainer"), h("th", { scope: "col" }, "Role"), h("th", { scope: "col" }, "GitHub"))),
          h("tbody", {}, h("tr", {}, h("td", {}, "Anas Abubakar"), h("td", {}, "Lead maintainer"), h("td", {}, ext("https://github.com/Anasabubakar", "@Anasabubakar"))), h("tr", {}, h("td", {}, "Abdulbasit Fazazi"), h("td", {}, "Co-maintainer"), h("td", {}, ext("https://github.com/fazaziishola-coder", "@fazaziishola-coder")))),
        ),
      ),
    ),
    section("license", "License", p("MIT. See ", ext(`${APP_REPO}/blob/main/LICENSE`, "LICENSE"), ". It is not an audit and is not endorsed by Stellar, the SDK authors or the mppx maintainers.")),
    section("contribute", "How to contribute", list([[ext(ISSUES, "Open issues"), " are scoped so one person can finish one in a single cycle. Say you are taking one before you start."], ["Read ", ext(`${APP_REPO}/blob/main/CONTRIBUTING.md`, "CONTRIBUTING.md"), "."], ["Ask questions in ", ext(DISCUSSIONS, "Discussions"), "."], ["Report security problems as described in ", ext(`${APP_REPO}/blob/main/SECURITY.md`, "SECURITY.md"), ", not in public issues."]])),
    section("release", "Current release", p(`App version ${VERSION}, paired with ${PAIRING.package} ${PAIRING.version} (report version ${PAIRING.reportVersion}). See the `, ext(`${APP_REPO}/blob/main/CHANGELOG.md`, "changelog"), ". "), p(link("/docs", "Getting started"))),
  );
}
