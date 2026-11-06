# The Declaration: handoff to a new Claude account

Updated 6 Nov 2026.

In the new Claude account, start a conversation and attach these three files from this folder:
- `HANDOFF.md`
- `desk-prompt.md`
- `sunday-read-prompt.md`

Then say:

> "I run thedeclaration.in. Read HANDOFF.md, desk-prompt.md and sunday-read-prompt.md and take over the news desk."

The site's code and every story live in GitHub, not in Claude. These three files carry all the decisions and settings.

---

## What moves and what doesn't

| Thing | Where it lives | What to do |
|---|---|---|
| Website, all stories, design, code | GitHub repo `agnorpetronet-007/the-declaration` | Nothing. It stays yours. |
| Domain and DNS | GoDaddy | Nothing. |
| Hosting | GitHub Pages | Nothing. |
| Decisions, rules, settings | This file | Attach it in the new account and upload it to a Project there. |
| News desk (every 3 hours) | Scheduled task in Claude Code (claude.ai/code/scheduled) in the current account | Recreate from `desk-prompt.md`, then delete the old one. |
| The Sunday Read (Sundays 4:23 am IST) | Scheduled task in Claude Code in the current account | Recreate from `sunday-read-prompt.md`, then delete the old one. |
| Old chat history, Project memory | Old Claude account | Can't be moved. Everything needed is in this file. |

## Steps in the new account

1. **Connect GitHub** at claude.ai/code, signed in to the new Claude account, with the same GitHub user (`agnorpetronet-007`). Follow the prompt to install the Claude GitHub App. Then open github.com/settings/installations, click Configure next to Claude, and make sure `the-declaration` is included. A regular chat's "Add from GitHub" only reads files and cannot push or open PRs, so the desk needs Claude Code.
2. **Create a Project** (for example "AARYAN") and upload this file to it, so every chat there knows the setup. Use that Project for editorial work (shortlists, drafts, opinion copy-edits); anything that must reach the repo is pushed from a Claude Code session.
3. **Recreate the news desk** at claude.ai/code/scheduled → New scheduled task: name "The Declaration: draft news edition", repo `agnorpetronet-007/the-declaration`, cron `44 */3 * * *` (UTC; or `14 0-21/3 * * *` if the form uses IST), prompt = desk-prompt.md word for word, push notifications only, no email. Check the run times read 00:14, 03:14, 06:14, 09:14, 12:14, 15:14, 18:14 and 21:14 IST: the 21:14 run closes the daily section quota and the 00:14 run starts the new day.
4. **Recreate the Sunday Read** the same way: name "The Declaration: The Sunday Read", Sundays 04:23 IST (`23 4 * * 0` in Asia/Kolkata, or `53 22 * * 6` in UTC, i.e. Saturday 22:53 UTC), prompt = sunday-read-prompt.md word for word, push notifications only, no email.
5. **Allow branch pushes.** By default Claude Code tasks can only push to branches starting `claude/`. Both tasks push `edition-…` and `sunday-read-…` branches, so allow pushes to other branches in each task's repository settings, or every run fails at the push.
6. **Push these three files** to `handoff/` on main from a Claude Code session, so the repo copy matches.
7. **Delete both old tasks** in the old account once the new desk has opened its first pull request. Otherwise you'll get two editions every 3 hours. Once no Claude account uses it, the old account's GitHub link can be removed.
8. Keep merging the "Edition: …" pull requests on GitHub as usual.

---

## Current state (6 Nov 2026)

- **Live** at https://thedeclaration.in (GitHub Pages, custom domain, HTTPS enforced).
- **Code**: https://github.com/agnorpetronet-007/the-declaration. Every push to `main` deploys via the "Publish site" workflow, which also rebuilds hourly at :17. Run `git pull --rebase` before pushing to main. Deleting remote branches is refused (403), so leave them.
- **Publishing**: the desk opens a pull request and the owner merges it. Site changes, and stories or opinion pieces the owner explicitly asks Claude to "push", go straight to main.
- **Conflicts**: the desk stacks on the newest unmerged edition and never edits older stories just to change lead or breaking. If a conflict does appear, merge main into the PR branch, keep the newest version of the running story, push to the PR branch, and chain later editions on it.

## Editorial rules (owner's standing instructions)

- **Never cover**: celebrity gossip, horoscopes or astrology, unverified viral claims.
- **Sections**: India, Bengal (the priority region), World, Politics, Business, Technology, Science, Sport, Culture, Opinion.
- **Daily section quota (3 Nov)**: at least one new story every IST day in each of India, Bengal, World, Politics, Business, Technology, Science, Sport and Culture.
  - Each edition fills at least 3 empty sections first.
  - World is capped at 3 stories per edition while gaps remain.
  - Every section must be covered by the 21:14 IST run.
  - PR bodies show "Today's coverage".
- **Geopolitics is a very major part of every edition (1 Nov)**:
  - At least 2 geopolitics stories per edition, and 4-7 stories in total.
  - China coverage (3 Nov): the owner wants strongly critical China coverage and chose sourced accountability reporting in news stories, not slanted news or a labelled view section.
  - Neighbourhood priority (3 Nov): China, Bangladesh, Nepal, Myanmar, Sri Lanka, then South-East Asia. Pakistan, Bhutan, the Maldives and Afghanistan when there is significant news.
  - China accountability reporting (3 Nov): every run looks for China stories that matter to India and Bengal (Brahmaputra dam and river data, LAC, Chinese loans and projects in the neighbourhood, trade dependence, cyber, South China Sea and Taiwan), reported from primary documents, spelling out the risks for India, with Beijing's position attributed and checked against the record. No editorialising in news stories.
  - Conflict claims are always attributed, and each story says what it means for India and Bengal.
  - Topic tag "Geopolitics".
- **Primary sources first**: report from original documents, flagged `"primary": true` and shown as "Original document". Outlets are credited in the sources list only; the story text never names an outlet or agency ("according to reports") (6 Nov). The owner wants the whole archive rectified to match. On 6 Nov, about 157 non-opinion stories on main still appeared to name outlets in the text (a rough automated count; some matches, such as "AP", may be false positives). Check open PRs before starting the clean-up.
- **Story lengths**: brief 150-250 words, standard 500-700, indepth 900-1,200, longread (Sunday Read) 1,800-2,800. Each edition has at least one in-depth story and at most two briefs.
- **Timestamps**: the exact real time from `date -u`, never rounded up.
- **Pictures**: very limited, original graphics only, decided story by story. Never decorative, never on political, crime or court stories, never identifiable people, never maps with borders.
- **Story text**: blank-line paragraphs, "## " subheads, "> " quotes, [links](url), **bold**, and "- " bullet lists. There are no italics.
- **Front page**: the newest `lead` story leads for 18 hours. `breaking` shows the red LIVE bar for 6 hours; otherwise a "Latest" ticker runs.
- **The Sunday Read**:
  - Every Sunday, one researched long read on something in the news or missing the limelight that could shape the future.
  - It gets its own front-page band for 7 days and is collected at /topic/the-sunday-read/.
  - The owner likes to shortlist on Saturday night and read the draft before publishing.
  - If `handoff/sunday-read-brief.md` is dated for that Sunday, the task writes on that subject. If the brief also contains "Status: written in conversation", the task skips that week.
  - First one (1 Nov): "The dam India cannot see: China's Brahmaputra mega-project and the missing river data". At the owner's request it ends with a labelled section "Why India needs the Siang dam" ("This section sets out The Declaration's view"), and names no outlets in the text ("according to reports"), with sources listed. From 6 Nov the no-outlet-names rule applies to every story, and every Sunday Read ends with a labelled "The Declaration's view" section arguing India's interest (owner, 6 Nov).
  - Unused ideas: the Ganges Waters Treaty (expires 12 Dec 2026), India's crude import cost, Rakhine and the Kaladan corridor.
- **Opinion**: columns by **Rohit Kumar Singh**, "The Red Sky Phenomenon" (1 Nov), "The Containment Problem" (3 Nov) and "Uniformity vs Commonality" (Nov).
  - Light copy-edit only (paragraphs, subheads, punctuation, Indian/British spelling). Claude writes the dek and fact-checks claims, flagging rather than changing the author's views.
  - The desk never writes or edits opinion pieces.
- **Notifications**: push only, no email.
- Political coverage reports every side. Office-holders are taken from current sources (as of Oct 2026, the BJP governs West Bengal, with Suvendu Adhikari as CM).

## Design

- **No warm or brown tones in either theme.**
  - Light: paper #F7F7F4, paper-2 #ECEDE8, ink #161714, rule #D8D9D2.
  - Dark: paper #121310, paper-2 #1B1D19, ink #ECEDE5, rule #2E312B, red #E0566A.
- Crimson accent #B3182B; Playfair Display headlines; IBM Plex Mono metadata; Source Serif 4 text.
- Phone layout (≤700px): compact masthead, search icon, one scrollable section row, two-line LIVE/Latest bar.
- Graphics: 1600×900, background #F7F7F4, ink #161714 (not the warm #1A1714), rendered with Playwright.

## Technical notes for Claude

- Use REST (`gh api repos/agnorpetronet-007/the-declaration/...`) for pull requests and Actions; GraphQL and `gh pr` are blocked.
- Task prompts change with update_trigger (send the full prompt). Notification settings need delete and recreate. Keep the handoff/*.md copies in sync.
- The sandbox can't open thedeclaration.in, so check deploys via the Actions API. Owner previews: a Playwright PDF of the story page. Phone checks: Playwright at 375px.
- Repo layout:
  - `content/articles/<id>.json`, `content/images/`, `content/cards/` (`node tools/cards.js`)
  - `site.json`, `build.js`, `assets/`, `.github/workflows/deploy.yml`
  - `handoff/` (not published)
- Graphics ink is #161714 (changed 6 Nov from the warm #1A1714 in both prompts). Share images (`tools/cards.js`) switched to the neutral palette on 6 Nov with the owner's approval; all were regenerated.
- On 6 Nov the repo's `handoff/` copies were older than these files (missing the 3 Nov and 6 Nov rules). Always recreate tasks from the newest copies and keep `handoff/` in sync.

## DNS at GoDaddy (done)

- A `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME `www`: agnorpetronet-007.github.io

## Still waiting on the owner

- Editor name, title and contact email; grievance officer; a bio for Rohit Kumar Singh. All `site.json` fields are blank.
- Confirm the ownership and funding wording.
- Cloudflare Web Analytics token and Google Search Console code.
- Domain email, WhatsApp Channel, social accounts, newsletter.
- Instagram and YouTube Shorts packs were offered; language not chosen.
