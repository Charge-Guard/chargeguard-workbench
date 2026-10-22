import { h } from "./dom.ts";

type Child = Node | string | null | undefined | false;

/** Internal link: the router intercepts clicks on it. */
export const link = (href: string, text: string, cls?: string): HTMLAnchorElement => h("a", { href, class: cls }, text);

/** External link: plain navigation, no opener, no referrer. */
export const ext = (href: string, text: string, cls?: string): HTMLAnchorElement => h("a", { href, class: cls, rel: "noopener noreferrer" }, text);

export const p = (...c: Child[]): HTMLParagraphElement => h("p", {}, ...c);

export function list(items: Child[][], ordered = false): HTMLElement {
  const el = h(ordered ? "ol" : "ul", {});
  for (const it of items) el.append(h("li", {}, ...it));
  return el;
}

export function section(id: string, title: string, ...c: Child[]): HTMLElement {
  return h("section", { class: "block", "aria-labelledby": id }, h("h2", { id }, title), ...c);
}

/** A code block with a copy button. Falls back to selecting the text when the clipboard is unavailable. */
export function codeBlock(text: string, label: string): HTMLElement {
  const pre = h("pre", { class: "code" }, h("code", {}, text));
  const status = h("span", { class: "copy-status", role: "status" });
  const btn = h("button", { type: "button", class: "btn small" }, "Copy");
  btn.setAttribute("aria-label", `Copy ${label}`);
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied";
    } catch {
      const r = document.createRange();
      r.selectNodeContents(pre);
      const s = getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
      status.textContent = "Select and copy";
    }
  });
  return h("div", { class: "codewrap" }, pre, h("div", { class: "codebar" }, btn, status));
}

export const badge = (text: string, tone: string): HTMLElement => h("span", { class: `badge tone-${tone}` }, text);
