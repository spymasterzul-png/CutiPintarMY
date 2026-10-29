# Substitute holiday estimates

Reviewed 29 October 2026. The application is a planning tool, not a determination of an employee’s legal entitlement. Base datasets remain unchanged; derived holidays are added in memory before planning, previewing and listing dates. Statutory paid-holiday eligibility depends on the employer’s recognized holidays, sector, rest day and applicable employment law.

## Modes

- **State rules (default):** estimate the state/public calendar using the profiles below. Changing the visitor’s workweek does not change the state’s substitution rule. Two names on the same date normally create one replacement for that date, not two. Independent weekday collisions are not automatically replaced.
- **Employer rest day (assumption):** a simulation assuming the employer recognizes every holiday in the loaded schedule. The user chooses one official rest day within their selected weekend. Each recognized holiday on that rest day receives a replacement; a collision of separate holidays also receives an extra day. Allocation skips all selected non-working days and occupied holiday dates. This is not an entitlement calculator. For Sabah and Sarawak, users must verify the applicable labour ordinance and employer policy; the Peninsular/Labuan source is not asserted to govern those states.
- **Base schedule only:** no new replacements are generated. Imported explicit replacements remain part of the imported data.

## State profiles and sources

| Profile | Trigger | Allocation | Evidence |
| --- | --- | --- | --- |
| States/territories observing Sunday, including Johor | Sunday | Next state working day, skipping existing holidays | [BKPP section 3 explanation](https://www.kabinet.gov.my/), [Johor 2026 notes](https://www.johor.gov.my/rakyat/cuti-umum-2), [Penang notes](https://www.penang.gov.my/index.php/component/sppagebuilder/page/50) |
| Kedah | Friday; Saturday alone does not trigger | Next working day, normally Sunday | [Official 2026 schedule](https://mmk.kedah.gov.my/wp-content/uploads/2025/12/CUTI-PELEPASAN-AM-2026.png), [2026 Treasury circular](https://pkpk.kedah.gov.my/wp-content/uploads/2026/01/PEKELILING-PERB-BIL-2-2026-OT.pdf) |
| Kelantan | Saturday; Friday alone does not trigger | Next state working day, skipping existing holidays | [Official Kelantan 2026 circular](https://mdgm.kelantan.gov.my/images/2025/Muat%20Turun/Hari%20Kelepasan%20AM%20Kerajaan%20Negeri%20Bagi%20Tahun%202026.pdf) |
| Terengganu | Saturday; Friday alone does not trigger | Next state working day, skipping existing holidays | [Government gazette reproduced by Sinar Project](https://govdocs.sinarproject.org/documents/state-governments/terengganu/government-of-terengganu-darul-iman-gazette/trggn21y2016.pdf) |
| Sabah | Sunday | Next available state working day | [Holidays Ordinance, sections 2–3](https://sagc.sabah.gov.my/sites/default/files/law/Holidays%20Ordinance_0.pdf) |
| Sarawak | Sunday, plus the explicit 2026 exceptions below | Next state working day; separate weekday collisions require confirmed dates | [Public Holidays Ordinance](https://lawnet.sarawak.gov.my/lawnet_file/Ordinance/ORD_Public%20Holiday%20Lawnet%202024.pdf), [state holiday portal](https://talikhidmat.sarawak.gov.my/talikhidmat/web/home/list_holiday/?id=web) |

Profiles are estimates based on published rules, including older state evidence where newer detailed instructions could not be established. Applying them to 2027 is a planning projection, not confirmation of every future state notice. Any explicit contrary state notification takes precedence.

Sarawak passed an amendment bill on 13 October 2026 introducing automatic replacement for overlapping holidays. [The official UKAS report](https://ukas.sarawak.gov.my/web/subpage/news_view/50706) establishes passage, but the app has not established its gazetted commencement date. It therefore does not extrapolate the new collision rule across all dates or apply it retrospectively. The app explicitly includes the state portal’s 3 June 2026 replacement for Wesak and 4 June 2026 replacement for Gawai, and avoids regenerating those dates.

## Important distinctions

[JPA’s 8 January 2026 notice](https://docs.jpa.gov.my/docs/akhbar/2026/siaran_media08012026.pdf) specifies one replacement day, 2 February, for the public-service overlap of Thaipusam and Federal Territory Day. Employer-mode assumptions produce 2 February for Federal Territory Day and 3 February for Thaipusam if both holidays are recognized and Sunday is the official rest day; that is deliberately a separate model. Fixed mandatory holidays are prioritized when assigning collision labels, following [JTKSM’s 31 December 2025 notice](https://www.kabinet.gov.my/storage/2025/12/JTK_251231_153535.pdf).

[JTKSM’s Wesak/Agong 2026 notice](https://jtksm.mohr.gov.my/sites/default/files/2026-05/Kenyataan%20Media%20Hari%20Wesak%20dan%20Hari%20Keputeraan%20Yang%20di-Pertuan%20Agong%202026.pdf) explains the employer-specific recognized-holiday and rest-day conditions, including the 2 June replacement when Wesak is recognized and 1 June is already Agong’s birthday.

## Derived record contract

Generated dates are labelled **Gantian anggaran**, retain original holiday names and any provisional flag, and include `originalDate`, `source`, `substitute: true`, `estimated: true`, and `replacementFor`. Explicit state exceptions are labelled **Gantian disahkan** and have `estimated: false`.

To import a confirmed substitute without generating it again, attach the original record’s exact `date|name` key:

```json
{"date":"2027-02-08","name":"Confirmed CNY substitute","states":["SGR"],"replacementFor":["2027-02-07|Tahun Baharu Cina (Hari Kedua)"]}
```

Duplicate date/name records are removed before calculating. Input arrays are not mutated. Imported replacements reserve their dates and suppress replacements for their listed origins. Gantian records do not recursively create new gantian records. Cross-year outputs are reported, while each planner run still covers one calendar year; prior-year carry-ins require explicit records in the selected year’s input.

## Remaining limits

This does not incorporate every ad hoc public holiday, later proclamation, employer holiday selection, shift roster or agreed alternative replacement date. Current import format cannot model a private employer’s chosen subset automatically; a reviewed custom dataset can be used instead. An estimate label must not be presented as a new gazetted public holiday.
