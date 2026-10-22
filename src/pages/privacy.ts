import { h } from "../dom.ts";
import { APP_REPO, ISSUES, POLICY_DATE } from "../site.ts";
import { ext, list, p, section } from "../ui.ts";

export function renderPrivacy(): HTMLElement {
  return h(
    "div",
    { class: "page legal" },
    h("h1", {}, "Privacy policy"),
    p(`Dated ${POLICY_DATE}.`),
    section("who", "Who runs this", p("The project maintainers named in the ", ext(`${APP_REPO}#maintainers`, "README"), ". Contact us through ", ext(ISSUES, "the repository's issues"), ". Report security problems as described in ", ext(`${APP_REPO}/blob/main/SECURITY.md`, "SECURITY.md"), ". We do not publish an email address.")),
    section("data", "What the app does with data", list([["Report files you open are read and checked in your browser. The app does not upload them anywhere."], ["There are no accounts, no cookies, no analytics and no advertising."], ["The app uses no localStorage and no sessionStorage. Nothing is kept after you close the tab."], ["Links you share can contain the name of a bundled suite and a run number. They never contain a report you loaded."]])),
    section("network", "Network requests", p("The app requests only its own files from its own origin. It has no feature that contacts any other host. Links to GitHub, GitBook and npm leave this site only when you click them, and those operators' own policies then apply.")),
    section("hosting", "Hosting", p("The site is served by Vercel. Vercel may process standard request data such as your IP address and user agent in its server logs under ", ext("https://vercel.com/legal/privacy-policy", "its own privacy policy"), ".")),
    section("chain", "Public blockchain data", p("Transaction hashes and other values in the recorded reports come from Stellar testnet or from a local stub. Anything read from Stellar is public ledger data.")),
    section("changes", "Changes", p("Changes to this policy are made through the public repository, and its history is the record.")),
  );
}
