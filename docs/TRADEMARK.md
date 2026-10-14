# Trademark checks — "Nadir" (former name) and "Pelorus" (current name)

**Outcome (2026-10-13):** the project was originally called Nadir. A USPTO search found live pending marks near its field, so it was **renamed to Pelorus**. The Pelorus search is in the first section; the original Nadir findings follow unchanged as the record of why. Neither search is legal advice or clearance.

**Owner decision (2026-10-13): keep the name Pelorus.** No attorney opinion has been obtained yet; it is still recommended before any wide launch or paid promotion (see [OWNER-STEPS.md](OWNER-STEPS.md) step 2).

## Pelorus (current name)

**Searched:** 2026-10-13, USPTO Trademark Search, wordmark `pelorus`, no filters; 20 records. US federal register only; EUIPO, WIPO, UK IPO, state registers and common-law use were not searched, and a lawyer's search would also cover similar-sounding marks.

- **Classes 009 (downloadable software) and 042 (software services): no LIVE records.** Every software-related PELORUS record is dead (abandoned or cancelled): simulation software (009), computer software for monitoring/tracking (009), fibre-optic electronics (009), software development tools (009), a SaaS service (042), and others. Dead records create no current register rights, though past use can still matter.
- **LIVE Pelorus marks exist in unrelated fields:** wines (class 033, a New Zealand winery), medical and health services (044), wood mouldings (019), business consulting agency services (035), financial asset management (036), freight and shipping (039).
- **Other uses outside the register (web, GitHub, npm, 2026-10-13):** no browser named Pelorus found. GitHub has unrelated projects of that name, notably a DevOps metrics tool (`dora-metrics/pelorus`, 254 stars), a marine chartplotter, a terminal file manager and an agentic Linux-desktop tool; npm has an unrelated package `pelorus` (a GraphQL adapter). A software product in the same space could still be argued to be related to some of these.
- **Risk summary:** lower than the old name in the register classes that matter for a browser, but not zero, and not checked outside the US. The word is also a descriptive-ish navigation term, which can make a mark weaker rather than safer. Get an attorney opinion before a wide launch.

## Nadir (former name) — original findings


**Searched:** 2026-10-13, USPTO Trademark Search (<https://tmsearch.uspto.gov/>), wordmark search for `nadir`, no filters. 21 records matched. Only the **US federal register** was searched. EUIPO, WIPO, UK IPO, state registrations, and **unregistered ("common-law") use** were not. A search by a lawyer also looks at similar-sounding and similar-looking marks, translations and design marks; this one did not.

## Result: the name is NOT clear in software-adjacent classes

Two live, pending applications are close enough to Nadir's field that a professional should look at them before any wide launch:

| Mark | Serial | Class | Status on 2026-10-13 | What it covers (per the record) |
|---|---|---|---|---|
| **NADIR** (standard characters) | 99644706 | 042 | LIVE, pending. Filed 2026-02-10, published for opposition 2026-04-07, **Notice of Allowance issued 2026-06-02**; the applicant must file a statement of use or an extension within six months of that notice. Applicant is an individual in the USA. | "Scientific and technological services, namely, research and design in the field of integrated system architecture that allows for the rapid development of highly interactive and customizable learning applications." |
| **NADIRROC** | 99691819 | 009, 042 | LIVE, pending | "Downloadable computer networking software" and class 042 services (text truncated in the list; full text not read) |

Why they matter: class 042 covers software design and software-as-a-service, and class 009 covers downloadable software; a browser is class 009 (downloadable software) and often class 042 as well. Whether a browser called Nadir would be held confusingly similar to a standard-character NADIR mark for learning-application design services is a legal judgement that depends on how related the goods and services are, which I cannot make. The NADIR application was published for opposition on 2026-04-07 and a Notice of Allowance followed, which normally means no opposition succeeded and it can proceed to registration once a statement of use is filed. I read only the first 5 of its 16 prosecution-history entries, so I cannot say whether anyone opposed or what else is on file.

## Other matches (different goods; listed for completeness)
- **NADIR** registered (live) for electric lighting (class 011, a German company), wines and spirits (033, an Italian company), and household/kitchen articles (021, a Brazilian company, several records). Related marks MICRODYN-NADIR (class 011, water-treatment membranes, live) and ZENITH & NADIR (classes 003/018/024/025, personal care and clothing, live).
- **TOPNADIR** (class 025, clothing, pending).
- Dead (cancelled/abandoned) records: NADIR for film/video production (041), footwear (025), plastics membranes (017), glassware (021); NADIR KID'S WEAR (025); two NAUTILE/TITANIC expedition marks (041/042). Dead records create no current rights in the register, though past use can still matter.

Names of individual applicants and their contact details are public record but deliberately not copied here.

## Earlier, weaker checks (2026-10-12)
Web search, GitHub and npm: no browser called Nadir. Other non-register uses exist (a French window-ventilation app "NADIR", the German site nadir.org, an npm package `nadir`, small GitHub repositories).

## Options (decisions for the project owner, ideally with a trademark attorney)
1. **Keep the name and get a clearance opinion** (US and any market you will ship in). Cost: attorney time; outcome might still be "proceed at some risk".
2. **Rename early**, while there are no signed releases, no installer reputation and one public pre-release. Cheapest now, costly later. The product name appears in the window title, installer, package name and docs; `grep -ri nadir` finds every place.
3. **Distinguish the name** (for example a longer, more distinctive mark) so that it is less likely to be confused with a short generic word already claimed in adjacent classes. A lawyer should judge whether that helps.
4. **Proceed unregistered** and accept the risk. Common-law use does not give Nadir rights against an earlier registrant in the same field.

Until one of these is decided, treat "Nadir" as a **working name**. The repository already says this in [LICENSES.md](LICENSES.md) and [HANDOFF.md](../HANDOFF.md).
