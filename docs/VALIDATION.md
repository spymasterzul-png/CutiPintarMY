# Validation — v0.1

29 October 2026: all 9 Node tests passed. Coverage includes dataset validation, zero leave budget, overlapping holidays, state filtering, Friday–Saturday weekends, year boundaries, invalid dates, ICS export, and comparison of optimal results against an independent sliding-window oracle.

The original Malay interface was previewed at localhost:4173 in a narrow browser viewport. With Selangor and a 3-day budget, the first card showed 14–22 February: 9 days off with leave on 16, 19 and 20 February. Planning and export formatting were tested through unit tests; file import and download interactions have not been tested end to end.

The English translation updates interface text, dates, messages, documentation and calendar summaries without changing the planning algorithm. All 9 existing tests were rerun successfully after translation. The English layout has not yet been visually verified in a browser.

Not yet verified: importing into Google Calendar, Outlook or Apple Calendar; every screen size; screen readers; completeness of 2026 holiday amendments.

## Short-trip planning

All 16 tests passed (9 original, 7 short-trip tests). New tests cover shared budgets, trip lengths/counts, working-day separation, state/weekend variants, zero-budget free trips, artificial splits, year-end boundaries, invalid settings, combined export and comparison with exhaustive schedule enumeration.

Browser smoke check: default Selangor, budget 3, maximum 5 days, up to 3 trips produced 13 total days off using 3 leave days: 1–4 January, 14–18 February and 30 April–3 May. Switching to long-break mode hid the short-trip controls and restored the 9-day February alternative.
