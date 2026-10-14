# Privacy policy

Pelorus is a desktop web browser. This page says what the program itself sends over the network and what it stores. It describes Pelorus' own behaviour; the websites you visit have their own policies.

**Short version:** Pelorus does not collect or send telemetry, usage statistics, crash reports, identifiers or your browsing data to its maintainers or to any analytics service. This program will not transfer any information to other networked systems unless specifically requested by the user or the person installing or operating it, with the two exceptions below that you can switch off.

## What Pelorus sends by itself
| What | To whom | When | How to stop it |
|---|---|---|---|
| Ad and tracker **filter lists** (download only; no identifiers are sent) | Ghostery's list CDN | at start-up, only when no list is cached yet or the cached lists are more than 3 days old, and when you press the refresh-lists button; only while blocking is on | turn off **Block ads and trackers** in **Privacy & security** |
| **DNS-over-HTTPS** lookups | the resolver *you* configure | only if you turn secure DNS on | leave it off |
| **Update check** (one request for the public release list: your IP address and a fixed `Pelorus-update-check` user agent, no cookies) | `api.github.com` | **only when you press "Check for updates"** on the About page; never in the background | do not press the button |

Everything else Pelorus requests is something you asked for by browsing: the pages and resources of the sites you visit (and their favicons, fetched through the same tab so the site's storage rules apply), and the search-engine page you choose when you type a search. Address-bar suggestions are computed on your computer from your own history and bookmarks; what you type is **not** sent to a search provider for suggestions.

## What Pelorus stores on your computer
History, bookmarks, settings, per-site permission choices, download records and the open tabs of your last session are stored locally in your profile folder (`%APPDATA%\Pelorus` on Windows). Each workspace has separate cookies and site storage. Private tabs use memory only and are not restored. You can delete history and site data at any time (**Privacy & security → Clear browsing data**), switch on **Clear browsing data when Pelorus closes**, and delete a workspace to delete its data. Pelorus does not upload any of this.

## Do-Not-Track style signals
Pelorus sends the **Global Privacy Control** header (`Sec-GPC: 1`) on web requests and removes known tracking parameters (such as `utm_*`, `fbclid`) from links you open. Websites may ignore both.

## Third-party components
Pelorus is built on Electron and Chromium (the browser engine), and uses Ghostery's open-source adblocker library. They run inside Pelorus. Pelorus does not enable Chromium's sync, safe-browsing or Google-account features, and has no sign-in. **Not yet verified:** a full network capture of an idle Pelorus to confirm that the Chromium engine itself contacts no other service. Until that is done, treat this document as describing Pelorus' own code, not as a guarantee about every packet. (See [SECURITY.md](SECURITY.md) for the list of what has and has not been verified.)

## Children, legal basis, retention
Pelorus has no accounts and keeps no data on any server, so there is nothing for the maintainers to retain, share or delete on your behalf.

## Changes and contact
Changes to this policy are made in this file and appear in the repository history. Questions and reports: use the private vulnerability reporting described in [SECURITY.md](SECURITY.md) for security matters, or open an issue on <https://github.com/shipking-ai/pelorus> for anything else.
