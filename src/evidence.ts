import { DATASETS } from "./data.ts";
import type { Report, Suite } from "./types.ts";

export interface Bundled {
  id: string;
  label: string;
  suite: Suite;
}

/** The bundled suites that validated, in display order. */
export function bundled(): Bundled[] {
  const out: Bundled[] = [];
  for (const d of DATASETS) if (d.suite.ok) out.push({ id: d.id, label: d.label, suite: d.suite.suite });
  return out;
}

export const appHref = (suiteId: string, index: number): string => `/app?suite=${suiteId}&run=${index}`;

export function findRun(suiteId: string, pick: (r: Report) => boolean): { index: number; report: Report } | null {
  const b = bundled().find((x) => x.id === suiteId);
  if (!b) return null;
  const index = b.suite.reports.findIndex(pick);
  return index < 0 ? null : { index, report: b.suite.reports[index]! };
}

/** Statuses of the credential presentations in a run, in order, e.g. [200, 200, 402]. */
export const presentationStatuses = (r: Report): number[] => r.timeline.filter((e) => e.request === "credential").map((e) => e.status);
