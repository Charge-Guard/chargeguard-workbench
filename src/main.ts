import "./style.css";
import "./site.css";
import { createRouter } from "./router.ts";
import { HOME_TITLE, NOT_FOUND, ROUTES } from "./routes.ts";
import { buildShell } from "./shell.ts";
import { NAME } from "./site.ts";

export function start(root: HTMLElement) {
  const shell = buildShell(root);
  const router = createRouter({ main: shell.main, routes: ROUTES, notFound: NOT_FOUND, brand: NAME, homeTitle: HOME_TITLE, onNavigate: (path) => shell.setCurrent(path) });
  router.render(false);
  return router;
}

const root = document.getElementById("site");
export const router = root ? start(root) : null;
