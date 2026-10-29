# Validation — v0.1

29 October 2026: all 9 Node tests passed. Coverage includes dataset validation, zero leave budget, overlapping holidays, state filtering, Friday–Saturday weekends, year boundaries, invalid dates, ICS export, and comparison of optimal results against an independent sliding-window oracle.

The original Malay interface was previewed at localhost:4173 in a narrow browser viewport. With Selangor and a 3-day budget, the first card showed 14–22 February: 9 days off with leave on 16, 19 and 20 February. Planning and export formatting were tested through unit tests; file import and download interactions have not been tested end to end.

The English translation updates interface text, dates, messages, documentation and calendar summaries without changing the planning algorithm. All 9 existing tests were rerun successfully after translation. The English layout has not yet been visually verified in a browser.

Not yet verified: importing into Google Calendar, Outlook or Apple Calendar; every screen size; screen readers; completeness of 2026 holiday amendments.

## Short-trip planning

All 16 tests passed (9 original, 7 short-trip tests). New tests cover shared budgets, trip lengths/counts, working-day separation, state/weekend variants, zero-budget free trips, artificial splits, year-end boundaries, invalid settings, combined export and comparison with exhaustive schedule enumeration.

Browser smoke check: default Selangor, budget 3, maximum 5 days, up to 3 trips produced 13 total days off using 3 leave days: 1–4 January, 14–18 February and 30 April–3 May. Switching to long-break mode hid the short-trip controls and restored the 9-day February alternative.

## Manual trip selection

All 22 tests pass: 9 original, 7 automatic-planner and 6 manual-selection tests. New coverage includes option generation/ranking, inclusive date overlap, shared-budget checks, removal eligibility, zero-budget options and year-end boundaries.

Browser smoke check: the plan starts empty; 12 of 724 Selangor options are displayed for a 3-day allowance. Adding 14–18 February shows 1 leave day used and 2 remaining, and disables overlapping February options. Removing that trip restores 3 remaining and makes those options selectable again. Full calendar-app import and persistence remain outside this check.

## Visual refresh

The interface now uses a forest-green, cream and lime palette, an illustrative leave-to-break hero, a two-column desktop card layout, a numeric plan summary, focus indicators, a skip link and reduced-motion support. Responsive rules provide a single-column mobile layout. The hero illustration is labelled as an example, not holiday data.

All 22 planning/selection tests still pass. Desktop browser smoke check confirms data loading, adding the February trip, remaining leave and disabled overlapping choices. The desktop layout was visually inspected and a preview saved. Mobile responsive styles were implemented but were not separately verified at a phone viewport in this pass.

## Interactive trip preview

All 26 tests pass, including 4 preview tests for real dates, leave classification, state holiday names, multiple holidays on a weekend, Friday–Saturday weekends, year boundaries, empty results and the seven-day display limit.

Browser smoke check: the default preview shows Selangor, 14–18 February 2026, 1 annual leave day and 5 days off. Clicking 17 February shows Tahun Baharu Cina. Adding the trip changes the source label to FROM YOUR TRIP PLAN, disables the add button, and updates the shared-budget plan. A screenshot was saved. The preview uses the bundled base schedule and does not add missing substitute dates.

## Cached frontend release fix

Production diagnosis reproduced an old EXAMPLE illustration in the browser while the published HTML and successful Pages deployment already contained the live preview. Loading a fresh document showed the live-preview markup but an older application script, leaving its loading placeholders unchanged. Added content-based revisions to CSS, application entry and imported modules, a footer build identifier, and no-store holiday data fetches. All 26 existing tests pass and asset URL hashes were checked against their file contents.

## Trip Spotlight

All 29 tests pass. Three additional tests cover the active-trip cursor across result changes, plain-language leave summaries and after-add balances, including already-selected and unaffordable trips.

Local browser check: next advances from 14–18 February to 1–4 January, previous returns to February, and neither action selects a trip. Adding February keeps the spotlight on the same dates and reports 2 leave days remaining with the trip already included. The add button is disabled to prevent duplicate charging.
