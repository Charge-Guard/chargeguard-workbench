import { h } from "../dom.ts";
import { APP_REPO, ISSUES, POLICY_DATE } from "../site.ts";
import { ext, p, section, list } from "../ui.ts";

export function renderTerms(): HTMLElement {
  return h(
    "div",
    { class: "page legal" },
    h("h1", {}, "Terms of use"),
    p(`Dated ${POLICY_DATE}.`),
    section("license", "License", p("The software is open source under the MIT License. See ", ext(`${APP_REPO}/blob/main/LICENSE`, "LICENSE"), ".")),
    section("warranty", "No warranty", p("It is provided as is, without warranty of any kind, as the license states.")),
    section("use", "What it is for", list([["It is an engineering and diagnostic tool."], ["It is not financial, legal, investment, compliance or security advice. It is not an audit."], ["Its results are not a guarantee of anything about a contract, anchor, payment or network. A finite number of runs is evidence, not proof."]])),
    section("data", "Recorded data", p("The bundled reports are recorded results and are labelled with their evidence class. Stub-chain results are simulated. Testnet results say nothing about mainnet.")),
    section("yours", "Your responsibility", p("You are responsible for what you load into the app. The app contacts no network endpoint of your choosing.")),
    section("fees", "Accounts and fees", p("There are no accounts and no fees.")),
    section("contact", "Contact", p("Use ", ext(ISSUES, "the GitHub repository"), ".")),
  );
}
