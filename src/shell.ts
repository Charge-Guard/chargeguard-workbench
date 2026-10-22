import { h } from "./dom.ts";
import { APP_DOCS, APP_REPO, DISCUSSIONS, ISSUES, NAME, NPM_URL, RUNNER_DOCS, RUNNER_REPO, VERSION } from "./site.ts";
import { ext, link } from "./ui.ts";

export const NAV: Array<[string, string]> = [
  ["/", "Product"],
  ["/app", "App"],
  ["/scenarios", "Scenarios"],
  ["/levels", "Levels"],
  ["/docs", "Docs"],
  ["/about", "About"],
];

/** Logo mark: two workers above one shared store. */
export function logo(): SVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const add = (tag: string, attrs: Record<string, string>) => {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    svg.append(el);
  };
  add("rect", { width: "32", height: "32", rx: "7", fill: "#1f3a5f" });
  add("circle", { cx: "10.5", cy: "9.5", r: "3.2", fill: "#ffffff" });
  add("circle", { cx: "21.5", cy: "9.5", r: "3.2", fill: "#ffffff" });
  add("path", { d: "M10.5 13v5M21.5 13v5", stroke: "#ffffff", "stroke-width": "2", "stroke-linecap": "round" });
  add("rect", { x: "6", y: "19.5", width: "20", height: "6", rx: "2", fill: "#8fb4e8" });
  return svg;
}

export interface Shell {
  main: HTMLElement;
  setCurrent: (path: string) => void;
}

export function buildShell(root: HTMLElement): Shell {
  const nav = h("nav", { id: "site-nav", class: "site-nav", "aria-label": "Main" });
  const links = new Map<string, HTMLAnchorElement>();
  for (const [href, label] of NAV) {
    const a = link(href, label);
    links.set(href, a);
    nav.append(a);
  }
  nav.append(ext(APP_REPO, "GitHub", "gh"));

  const toggle = h("button", { type: "button", class: "menu-toggle", "aria-expanded": "false", "aria-controls": "site-nav" }, "Menu");
  const setOpen = (open: boolean): void => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest("a")) setOpen(false);
  });

  const brand = link("/", "", "brand");
  brand.append(logo(), h("span", {}, NAME));
  brand.setAttribute("aria-label", `${NAME} home`);

  const main = h("main", { id: "main", tabindex: "-1" });

  const col = (title: string, ...items: Node[]) => h("div", { class: "fcol" }, h("h2", {}, title), h("ul", {}, ...items.map((i) => h("li", {}, i))));
  const footer = h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "fgrid" },
      col("Product", link("/app", "App"), link("/scenarios", "Scenarios"), link("/levels", "The four levels"), link("/docs", "Docs"), link("/about", "About")),
      col("Open source", ext(RUNNER_REPO, "Runner repository"), ext(APP_REPO, "App repository"), ext(ISSUES, "Issues"), ext(DISCUSSIONS, "Discussions"), ext(NPM_URL, "Runner on npm")),
      col("Docs", ext(RUNNER_DOCS, "Runner docs (GitBook)"), ext(APP_DOCS, "App docs (GitBook)")),
      col("Legal", link("/privacy", "Privacy"), link("/terms", "Terms"), ext(`${APP_REPO}/blob/main/LICENSE`, "MIT License")),
    ),
    h("p", { class: "fbottom" }, `MIT licensed · version ${VERSION} · Built for the Stellar network`),
  );

  root.replaceChildren(
    h("a", { class: "skip", href: "#main" }, "Skip to main content"),
    h("header", { class: "site-header" }, h("div", { class: "hwrap" }, brand, toggle, nav)),
    main,
    footer,
  );
  return {
    main,
    setCurrent(path) {
      for (const [href, a] of links) {
        if (href === path) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      }
      setOpen(false);
    },
  };
}
