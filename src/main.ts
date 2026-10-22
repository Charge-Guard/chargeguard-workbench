import "./style.css";
import { h } from "./dom.ts";
import { renderPage, pageTitle, ROUTES } from "./pages.ts";
import { APP_REPO, NAME, RUNNER_REPO, VERSION, SITE_URL } from "./site.ts";
import { ext, link, p } from "./ui.ts";
import { mountWorkbench } from "./workbench.ts";

export function renderSite(focus = false): void {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const root = document.getElementById("site")!;
  const nav = h("nav", { id: "site-nav", "aria-label": "Main navigation" });
  for (const [href, name] of ROUTES.slice(0, 5)) {
    const a = link(href, name);
    if (href === path) a.setAttribute("aria-current", "page");
    nav.append(a);
  }
  const menu = h("button", { type: "button", class: "menu-toggle", "aria-expanded": "false", "aria-controls": "site-nav" }, "Menu");
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
  const main = h("main", { id: "main", tabindex: "-1" });
  if (path === "/app") main.append(h("div", { id: "app" }));
  else main.append(renderPage(path));
  root.replaceChildren(
    link("#main", "Skip to content", "skip"),
    h("header", { class: "site-header" }, link("/", NAME, "brand"), menu, nav),
    main,
    h("footer", { class: "site-footer" }, p(`${NAME} ${VERSION}. MIT licensed. Recorded evidence has finite scope.`), h("nav", { "aria-label": "Footer navigation" }, link("/about", "About"), link("/privacy", "Privacy"), link("/terms", "Terms"), ext(APP_REPO, "App source"), ext(RUNNER_REPO, "Runner source"))),
  );
  document.title = `${pageTitle(path)} | ${NAME}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", SITE_URL + path);
  if (path === "/app") mountWorkbench();
  if (focus) main.focus();
}

document.addEventListener("click", (event) => {
  if (!(event instanceof MouseEvent) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = event.target instanceof Element ? event.target.closest("a") : null;
  if (!target || target.target || target.hasAttribute("download")) return;
  const url = new URL(target.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
  event.preventDefault();
  history.pushState(null, "", url.pathname + url.search + url.hash);
  renderSite(true);
  window.scrollTo?.(0, 0);
});
window.addEventListener("popstate", () => renderSite(true));
renderSite();
