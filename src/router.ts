export interface Route {
  path: string;
  /** Page name; the document title becomes "<title> · ChargeGuard". */
  title: string;
  description: string;
  render: () => Node;
  /** Called after the page is in the DOM (the workbench mounts itself here). */
  after?: () => void;
}

export interface RouterOptions {
  main: HTMLElement;
  routes: Route[];
  notFound: Route;
  brand: string;
  /** Full title used for "/" (no suffix). */
  homeTitle: string;
  onNavigate?: (path: string) => void;
}

export const normalize = (pathname: string): string => pathname.replace(/\/+$/, "") || "/";

function setDescription(text: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
  }
  meta.content = text;
}

/** A small History API router. Call `go` for programmatic navigation; link clicks are intercepted. */
export function createRouter(o: RouterOptions): { render: (moved: boolean) => void; go: (to: string) => void; stop: () => void } {
  function render(moved: boolean): void {
    const path = normalize(location.pathname);
    const route = o.routes.find((r) => r.path === path) ?? o.notFound;
    o.main.replaceChildren(route.render());
    document.title = route.path === "/" ? o.homeTitle : `${route.title} · ${o.brand}`;
    setDescription(route.description);
    o.onNavigate?.(path);
    route.after?.();
    if (moved) {
      try {
        window.scrollTo(0, 0);
      } catch {
        /* not available in every environment */
      }
      const h1 = o.main.querySelector<HTMLElement>("h1");
      if (h1) {
        h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
      }
    }
  }

  function go(to: string): void {
    history.pushState(null, "", to);
    render(true);
  }

  function onClick(e: MouseEvent): void {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a || !a.hasAttribute("href") || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return; // a static file, not a route
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // in-page anchor
    e.preventDefault();
    go(url.pathname + url.search + url.hash);
  }
  const onPop = (): void => render(true);
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPop);
  return {
    render,
    go,
    stop: () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    },
  };
}
