import { h } from "../dom.ts";
import { link, p } from "../ui.ts";

export function renderNotFound(): HTMLElement {
  return h("div", { class: "page" }, h("h1", {}, "Page not found"), p("This address does not match a page on this site."), h("div", { class: "actions" }, link("/", "Go to the home page", "btn"), link("/app", "Open the app", "btn secondary")));
}
