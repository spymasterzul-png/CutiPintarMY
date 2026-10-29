# Holiday data

Primary source: [BKPP JPM 2026 schedule](https://www.kabinet.gov.my/storage/2025/08/HKA-2026.pdf), pages 1–3. Source review metadata: 29 October 2026. This snapshot preserves the base schedule; that date does not certify that every amendment has been incorporated. Official holiday names are retained in their original form.

## Update sources

- [BKPP public holiday index](https://www.kabinet.gov.my/hari-kelepasan-am/) — schedules for other years.
- [BKPP acts and gazettes](https://www.kabinet.gov.my/akta-dan-warta/) — amendments and additional holidays.
- [Additional Raya holiday gazette, 2026](https://www.kabinet.gov.my/storage/2026/03/PUB-111_2026.pdf) — a conditional declaration, not yet included.
- [Official Johor portal](https://www.johor.gov.my/rakyat/cuti-umum-2) — state cross-checks.
- [Official Kelantan portal](https://administration.kelantan.gov.my/index.php/rakyat/penerbitan/takwim-cuti/takwim-cuti-2026) — state cross-checks.

BKPP also announced 2 June 2026 as a substitute Wesak holiday for states observing Sunday as their weekly holiday. The snapshot does not assume a uniform substitute-holiday rule for every state or employer. Sabah, Sarawak and overlapping holidays require separate review.

## Import format

```json
{"year":2027,"status":"User data — unverified","holidays":[{"date":"2027-01-01","name":"Tahun Baharu","states":["SGR"]}]}
```

This example illustrates the format only; it is not a complete dataset. State codes are defined in `src/states.js`. ISO dates must be valid and fall within the declared year. One record can cover multiple states. Multiple holiday names on the same date do not increase the number of days off or the leave cost. Do not assume a weekend holiday creates a substitute day without evidence.

## Maintenance process

Transcribe the schedule → verify each state marker and date → review gazettes and amendments → add confirmed substitute dates → record source URLs, review dates and coverage → run tests → request human review through a pull request.

For v0.2, add provenance per record and a completeness status before marking a dataset as complete. Do not copy the previous year’s schedule or predict dates for movable celebrations.
