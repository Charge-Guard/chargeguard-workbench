import { h } from "../dom.ts";
import { mountWorkbench } from "../workbench.ts";

export function renderAppHost(): HTMLElement {
  return h("div", { id: "app", class: "app-host" });
}
export { mountWorkbench };
