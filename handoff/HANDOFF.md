# The Declaration: handoff to a new Claude account

Start a new conversation in the new Claude account. Attach this file and `desk-prompt.md`, then say:

> "I run thedeclaration.in. Read HANDOFF.md and desk-prompt.md and take over the news desk."

Everything Claude needs to carry on is in these two files. The site's code and stories live in GitHub, not in Claude.

---

## What moves and what doesn't

| Thing | Where it lives | What to do |
|---|---|---|
| Website, all stories, design, code | GitHub repo `agnorpetronet-007/the-declaration` | Nothing. It stays yours. |
| Domain and DNS | GoDaddy | Nothing. |
| Hosting | GitHub Pages | Nothing. |
| Decisions, rules, settings | This file | Attach it in the new account. |
| The Sunday Read (Sundays 4:23 am IST) | A second scheduled task in the OLD account | Recreate it from `sunday-read-prompt.md`, then delete the old one (id `trig_013WtDrA2ENk2DXBBHCQyWaq`). |
| News desk (every 3 hours) | A scheduled task in the OLD Claude account | Recreate it in the new account from `desk-prompt.md`, then delete the old one. |
| Old chat history | Old Claude account | Can't be moved, and isn't needed. |

## Steps in the new account

1. **Connect GitHub.** Sign in with the same GitHub user (`agnorpetronet-007`). The Claude GitHub App is already installed on the repo. If Claude can't push, check github.com/settings/installations and make sure the Claude app has access to `the-declaration`.
2. **Create a Project** (for example "AARYAN" or "The Declaration"). Upload this file to it so every chat in the project knows the setup.
3. **Recreate the news desk.** Ask Claude: "Create a scheduled task named 'The Declaration: draft news edition', every 3 hours at minute 44 UTC (cron `44 */3 * * *`), cloud, push notifications only, no email, using the prompt in desk-prompt.md word for word."
4. **Turn off the old desk.** Once the new desk has opened its first pull request, delete the old scheduled task in the old account ("The Declaration: draft news edition", id `trig_01Jq1U42wHgZGrm4htfaZrH8`). Otherwise both accounts open an edition every 3 hours. You can delete it from the old account's scheduled tasks list, or ask Claude in the old account.
5. Keep merging the "Edition: …" pull requests on GitHub as usual.

---

## Current state (1 Nov 2026)

- **Live** at https://thedeclaration.in (GitHub Pages, custom domain, HTTPS enforced).
- **Code**: https://github.com/agnorpetronet-007/the-declaration. Every push to `main` deploys through the "Publish site" workflow. The workflow also rebuilds every hour at :17 so time-based things stay current.
- **Publishing**: the desk opens a pull request; the owner merges it to publish. Site changes, and stories the owner explicitly asks Claude to "push", go straight to main. Before pushing to main, run `git pull --rebase` first.

## Editorial rules (owner's standing instructions)

- **Never cover**: celebrity gossip, horoscopes or astrology, unverified viral claims.
- **Bengal** is the priority region and has its own section.
- **Geopolitics is a very major part of every edition** (owner, 1 Nov 2026). Each edition has at least 2 geopolitics stories, out of 4-7 stories in total. A geopolitics story leads, in depth, whenever it's the biggest news. The desk sweeps India's neighbourhood (especially Bangladesh), India's foreign policy, wars, great-power relations, energy and shipping, and the UN and international law. Claims in conflicts are always attributed to whoever makes them. Every story explains what it means for India and for Bengal. Stories are tagged "Geopolitics".
- **Sections**: India, Bengal, World, Politics, Business, Technology, Science, Sport, Culture, Opinion.
- **Primary sources first.** Use outlets to discover stories, then report from the original document. Primary sources are flagged `"primary": true` and shown first, labelled "Original document". Outlet reporting is credited by name and is never hidden.
- **Story lengths** (`format`):
  - "brief": 150-250 words
  - "standard": 500-700 words
  - "indepth": 900-1,200 words

  Each edition has at least one in-depth story and at most two briefs.
- **Pictures**: very limited, and only original graphics with no copyright risk. Decided story by story. Never decorative. Never on political, crime or court stories. Never identifiable people. Never maps with borders.
- **Timestamps** are the exact real time from `date -u`, never rounded up. build.js caps future times.
- **Front page lead**:
  1. the newest story marked `lead`, for 18 hours;
  2. otherwise the newest live breaking story;
  3. otherwise the newest story.
- **Red LIVE bar**: shows a `breaking` story for 6 hours. Otherwise a dark "Latest" ticker shows the 5 newest headlines.
- **Opinion**: named contributors get their own byline and an opinion disclaimer. The first was "The Red Sky Phenomenon" by Rohit Kumar Singh (1 Nov 2026). The desk never writes or edits opinion pieces.
- **Notifications**: push only. The owner turned email alerts off.
- Political coverage reports every side. Office-holders are always taken from current sources.

## Design

- Owner's logo; look based on their Figma Make reference. Light mode uses neutral off-white paper (#F7F7F4; the owner asked on 1 Nov for no warm or brown tint), a crimson accent, Playfair Display headlines and IBM Plex Mono metadata.
- **Dark mode is neutral black**. Never brown. Tokens: paper #121310, paper-2 #1B1D19, ink #ECEDE5, ink-2 #B9BCB0, ink-3 #8A8E82, rule #2E312B, red #E0566A; night #0B0C0A.
- **Phone layout** (≤700px):
  - compact masthead
  - search shown as an icon
  - one scrollable section row with a fade on the right
  - LIVE and Latest bars clamped to 2 lines
  - `text-wrap: pretty` on headlines
  - one-column section index
- **Graphics**: 1600×900. Colours #F7F7F4 (background), #1A1714, #B3182B, #2E5A86. Fonts Playfair Display, IBM Plex Mono and Source Serif 4. Rendered with Playwright.

## Technical notes for Claude

- Use REST (`gh api repos/agnorpetronet-007/the-declaration/...`) for pull requests, merges and Actions runs. GraphQL and `gh pr` are blocked.
- After pushing to a PR branch, wait until the PR's head.sha matches before merging.
- The cloud sandbox can't open thedeclaration.in or github.io. Check deploys through the Actions API. Check the phone layout with Playwright at 375px against a locally served `_site`.
- Scheduled task notification settings can only be changed by deleting and recreating the task.
- Repo layout:
  - `content/articles/<id>.json`, `content/images/`, `content/cards/`
  - `tools/cards.js` makes share cards
  - `site.json`, `build.js`, `assets/`, `.github/workflows/deploy.yml`
  - `README.md` has the full story format

## DNS at GoDaddy (done)

- A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME: `www` → agnorpetronet-007.github.io

## Still waiting on the owner

- Editor name, title and contact email for the Team page, plus a grievance officer. All `site.json` fields are blank.
- A bio line for Rohit Kumar Singh.
- Confirmation of the ownership and funding wording.
- Analytics: the Cloudflare Web Analytics token and the Google Search Console verification code.
- Monetisation steps were discussed (reader support, newsletter, WhatsApp Channel, ads later). Nothing is built yet.
- Instagram and YouTube Shorts content packs were offered. Language not chosen yet.
