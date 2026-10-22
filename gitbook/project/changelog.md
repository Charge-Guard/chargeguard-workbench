# Changelog

## 0.2.0 (22 October 2026)
- Add landing, docs, about, privacy, terms and not-found routes with shared navigation, mobile menu, metadata and a sitemap. The original tool is at `/app`.
- Add `/scenarios` (every bundled scenario, store backend and recorded verdict, linked into the viewer) and `/levels` (the four levels with a worked example from a recorded run).
- Viewer deep links are now `/app?suite=<id>&run=<n>&mode=<push|pull>`; the old hash form is still read.
- Add privacy and terms pages. No network feature is added; `connect-src` stays `'self'`.

## 0.1.1
- Runs and suites whose verdicts, expectation matches or totals contradict their checks are now rejected. Re-paired with the published 0.1.1 release of its core (`compat.json` and the vendor stamp record the version and commit). Recorded real-run samples keep the version that recorded them.

## 0.1.0 (unreleased)
- Recorded-evidence viewer: isolated-versus-shared comparison, per-worker lanes, four levels per payment, checks, chronology, limits.
- Vendored runner schemas and the stub and testnet suites with a checksum stamp; precompiled validators.
- Open your own run or suite JSON.
