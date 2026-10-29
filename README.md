# CutiPintar MY 🌴

Enjoy longer breaks with the annual leave you have. An open-source leave planner for Malaysia, with no account or backend required.

## Getting started

You need Python 3 for the local preview and Node.js 20+ to run the tests.

```sh
python3 -m http.server 4173
# Open http://localhost:4173
node --test
```

Alternatively, use `npm run dev` and `npm test`. No package installation is required. Serve the project over HTTP: opening index.html through file:// will prevent the JSON dataset from loading.

## Features

- All 13 states and 3 federal territories, with the base 2026 holiday schedule included.
- Select from loaded years. Import JSON to add another year; dates for unsupported years are never guessed.
- A leave budget of 0–60 days, a search start date, and a Saturday–Sunday or Friday–Saturday weekend to match your work schedule.
- Default short-trip mode: browse 3–5-day alternatives and choose trips yourself with **Add to my plan**. Filter by starting month and show 12 more options at a time.
- The plan starts empty. Selected trips share one annual leave budget; overlapping or unaffordable trips cannot be added. Remove trips individually or clear the plan.
- A summary shows total days off, leave used and leave remaining, with an export for selected trips. Lowering the budget retains selections but blocks plan export until the excess is resolved.
- Changing state, year, search start, weekend or maximum trip length clears selections. Month filtering and switching planning modes retain them. All selections are session-only.
- Optional long-break mode: up to six non-overlapping alternatives, each using the full leave budget independently.
- Each suggestion lists the dates and names of public holidays for the selected state, alongside annual leave dates and weekend days. Holidays that fall on a weekend appear in both lists.
- Exact dates to apply for annual leave. Export `.ics` files containing **annual leave days only**, as tentative all-day events for Google Calendar, Outlook or Apple Calendar.
- Validated local JSON imports. Imported data lasts for the current browser session; refreshing restores the bundled dataset.
- Interactive trip preview: real dates follow the selected state, year, month and workweek. Tap a day to see holiday names, weekend status or annual leave details. Add the suggested trip straight to your plan; the preview also reflects selected trips. Long-break previews show the first seven days and state the full duration.
- English interface, documentation, validation messages and calendar exports. Malaysian place names and official holiday names are retained in their original form.

## MVP plan and architecture

1. Current MVP: collect preferences → filter state holidays → identify non-working days → find continuous breaks → rank alternatives → export.
2. Next: a reviewed 2027 dataset, confirmed substitute holidays and amendments with evidence per record, and automated browser tests.
3. Implemented: manual short-trip selection sharing one annual leave budget. Later: saved preferences and a monthly calendar view.

The app is a static frontend using ES modules. Pure planning functions live in `src/planner.js`; versioned holiday data lives in `data/`. No backend is needed. Host the repository root on GitHub Pages or any static server. Google Fonts are optional; system fonts provide a fallback.

```text
index.html / style.css      Responsive English interface
src/app.js                  UI interactions, imports and downloads
src/planner.js              Planning logic and ICS export
src/states.js               Malaysian state codes and names
data/2026.json              Official base-schedule snapshot
tests/planner.test.js       Built-in Node tests
docs/DATA.md                Sources, limitations and maintenance
.github/workflows/test.yml  Automated tests on GitHub
```

## How planning works

**Choose your own short trips:** enumerate 3-day intervals up to the selected maximum (3–5 days), within the year and leave allowance. Exclude intervals consisting entirely of working days. Rank by days off per leave day, then longer breaks, fewer leave days and earlier dates. Zero-leave trips appear first. Enumeration takes O(D × L), followed by sorting; D ≤ 366 and L ≤ 5. Overlapping intervals remain visible as alternatives. Each addition checks date overlap and the cumulative leave cost. Adjacent trips can be selected, but overlapping dates cannot. No automatic selection is made.

The earlier automatic shared-budget planner remains available as the tested `planTrips` helper, but the interface now uses manual selection.

**Long break:**

Every interval within the selected year is considered. Its cost is the number of working days that are not public holidays. Intervals within the leave budget are ranked by the most days off, then the fewest annual leave days, then the earliest date. After the best result, alternatives are selected without overlap.

Including sorting, runtime is O(D² log D), where D ≤ 366. In long-break mode, the first result is optimal for **one continuous break**. Other cards in that mode are alternatives, not a plan that divides a shared annual budget. Planning does not cross year boundaries.

## Data status — please read

The bundled 2026 dataset is a **base schedule**, not a complete, current holiday calendar. Substitute holidays are not generated automatically. Special holidays, new announcements, overlapping celebrations and employer policies can change the results. BKPP has published additional 2026 notices and gazettes that are not yet incorporated in this snapshot.

Check official sources and your employer’s calendar, then import a reviewed dataset containing confirmed substitute dates. See [data sources and maintenance](docs/DATA.md).

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Code is licensed under MIT. Holiday facts are transcribed from government sources with attribution; government PDFs and logos are not reproduced. This is an independent project, not an official government service.

Repository: https://github.com/spymasterzul-png/CutiPintarMY

## Publishing frontend updates

After editing frontend files, run `python3 scripts/version-assets.py` and commit the updated files. This adds content-based revisions to CSS, the entry script and its module imports, preventing a new HTML page from loading an older cached script. Holiday JSON is fetched without reusing the browser cache. The footer shows the loaded build identifier.

If an already-open tab still displays the old illustration, reopen the site with a new `?v=` query or perform a hard refresh to reload the HTML document.
