# Trademark check for "Nadir" — what was found (not legal advice, not clearance)

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
