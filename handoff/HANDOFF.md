# The Declaration: handover SOP

Updated 14 Nov 2026. This is how the desk runs today, and how to move it to another Claude account so it works the same way, with everything controlled from the chat.

## The pack

Attach these three files from this folder in the new account:
- `HANDOFF.md` (this file: setup, rules, state)
- `desk-prompt.md` (the news desk's instructions, word for word)
- `sunday-read-prompt.md` (the Sunday Read's instructions, word for word)

The site's code and every story live in GitHub, not in Claude. These files carry every decision and setting, so nothing has to be rebuilt from scratch.

## What moves and what doesn't

| Thing | Where it lives | What to do |
|---|---|---|
| Website, all stories, design, code | GitHub repo `agnorpetronet-007/the-declaration` | Nothing. It stays yours. |
| Domain and DNS | GoDaddy | Nothing. |
| Hosting | GitHub Pages | Nothing. |
| Decisions, rules, settings | This file | Attach it, and upload it to a Project in the new account. |
| News desk (07:44, 12:44, 18:44 IST) | Scheduled task in the current Claude account | Claude recreates it in the new account (step 5), then the old one is deleted (step 7). |
| The Sunday Read (Sundays 04:23 IST) | Scheduled task in the current Claude account | Same as the news desk. |
| Old chat history, Project memory | Old Claude account | Can't be moved. Everything needed is in this pack. |

## Why "start from Claude Code" matters

The desk only works from a **Claude Code session** (started at **claude.ai/code**), not from a regular claude.ai chat. That session gives Claude:
- a workspace with a terminal, to build the site and check stories;
- push access to the GitHub repo, to open pull requests and publish;
- the scheduled-task tools, so Claude can create, change, pause and check the desk's tasks itself from the chat.

In a regular chat, GitHub is read-only and Claude cannot create scheduled tasks; it can only tell you to do it by hand at claude.ai/code/scheduled. That is what happened in the other account before 14 Nov.

## Steps in the new account

1. **Start the right kind of conversation.** Signed in to the new Claude account, open **claude.ai/code** and start a new session there.
2. **Connect GitHub** in that account, as the same GitHub user (`agnorpetronet-007`). Follow the prompt to install the Claude GitHub App. Then open github.com/settings/installations, click Configure next to Claude, and make sure `the-declaration` is included.
3. **Create or attach a Project** (for example "AARYAN") and upload this file to it, so every chat there knows the setup.
4. **Hand over.** Attach the three files and say:
   > "I run thedeclaration.in. Read HANDOFF.md, desk-prompt.md and sunday-read-prompt.md and take over the news desk. Clone the repo, check you can push, then create both scheduled tasks yourself."
5. **Claude creates the two scheduled tasks** from the chat (you only confirm). If it says it can't, you are in a regular chat (go back to step 1) or the account doesn't offer scheduled tasks. The settings are:
   - **"The Declaration: draft news edition"**: cron `CRON_TZ=Asia/Kolkata 44 7,12,18 * * *` (07:44, 12:44 and 18:44 IST), prompt = `desk-prompt.md` word for word, push notifications only, no email.
   - **"The Declaration: The Sunday Read"**: cron `CRON_TZ=Asia/Kolkata 23 4 * * 0` (Sundays 04:23 IST), prompt = `sunday-read-prompt.md` word for word, push notifications only, no email.
   - Each run appears as its own session in your Recents, so you can open it to see what the desk did.
6. **Allow branch pushes** if the first run fails at the push. Some setups only let tasks push to branches starting `claude/`. Both tasks push `edition-…` and `sunday-read-…` branches, so allow other branches in the task's repository settings.
7. **Switch off the old account's tasks** once the new desk has opened its first pull request. Otherwise every edition runs twice. Then remove the old account's GitHub link if no other Claude account uses it.
8. **Keep merging** the "Edition: …" and "The Sunday Read, …" pull requests on GitHub as usual.

## If the desk goes quiet (checklist)

Ask Claude in the chat: "no stories today?" It should check, in this order:
1. **Is GitHub still linked?** A 403 or "No linked GitHub account" means reconnect at claude.ai/customize/connectors (GitHub).
2. **Are the scheduled tasks on?** Claude lists them. If they show "switched off when the account was signed out for its protection" (happened 14 Nov 2026), only the owner can switch them back on in a web browser at claude.ai/code/scheduled. Otherwise Claude recreates them from the prompt files, and the old copies stay off.
3. **Did the last run fail?** Open the run's session from Recents to see where it stopped.
4. **Is an edition waiting to be merged?** Open pull requests don't appear on the site until merged.
5. **Is the GitHub account itself fine?** A 404 on github.com/agnorpetronet-007 means GitHub has suspended it again (see the 9-12 Nov history below).

## Current state (14 Nov 2026)

- **Live** at https://thedeclaration.in (GitHub Pages, custom domain, HTTPS enforced).
- **Code**: https://github.com/agnorpetronet-007/the-declaration. Every push to `main` deploys via the "Publish site" workflow. **There is no scheduled rebuild**: it was removed on 12 Nov, so the site rebuilds only when something is merged or pushed. Run `git pull --rebase` before pushing to main. Deleting remote branches is refused (403), so leave them.
- **Scheduled tasks (new account, created 14 Nov 2026 from Claude Code)**: news desk `trig_01HC9q2G7ixWFPircQMtv2Fm` and Sunday Read `trig_01V8Y5pxBHzZZ7PdKmjtQUF5`, push notifications only. The old account's tasks (`trig_01CsYAZAktuY5YVfup8sBRVF`, `trig_01GxzWFZiiePCLeovXgoDwVv`, and the earlier `trig_01MQwUCB6GgPGVx3uoiWoxhp`, `trig_018ZgMCGTY7xEiHm6Wbd29Ye`) must be switched off by the owner at claude.ai/code/scheduled in that account, and stay off.
- **Publishing**: the desk opens a pull request and the owner merges it. Site changes, and stories or opinion pieces the owner explicitly asks Claude to "push" or "publish", go straight to main.
- **Conflicts**: the desk stacks on the newest unmerged edition and never edits older stories just to change lead or breaking. If a conflict does appear, merge main into the PR branch, keep the newest version of the running story, push to the PR branch, and chain later editions on it.
- **GitHub commitments (12 Nov 2026)**: GitHub suspended the account on 9 Nov and reinstated it around 12 Nov after an appeal. The owner committed to keeping automated activity modest: 3 editions a day, one pull request per run, one commit per edition, one repository, and no hourly rebuild. Keep to this.
- **Pending**: an Nvidia board story ("Nvidia board weighs Jensen Huang's future as spy-link probe wipes $600 billion off shares", Business) is drafted and awaits the owner's "publish". Refresh its facts and timestamp first.

## Editorial rules (owner's standing instructions)

- **Never cover**: celebrity gossip, horoscopes or astrology, unverified viral claims.
- **Sections**: India, Bengal (the priority region), World, Politics, Business, Technology, Science, Sport, Culture, Opinion.
- **Daily section quota (3 Nov)**: at least one new story every IST day in each of India, Bengal, World, Politics, Business, Technology, Science, Sport and Culture.
  - Each edition fills at least 3 empty sections first.
  - World is capped at 3 stories per edition while gaps remain.
  - Every section must be covered by the 18:44 IST run, the last of the day; the 07:44 run starts the new day.
  - PR bodies show "Today's coverage".
- **Company results go in Business, never Technology (6 Nov)**, even for tech and telecom companies. Two stories the owner chose to keep where they are: the Binance hack stays in Business, and the World Bank poverty story stays in India.
- **Geopolitics is a very major part of every edition (1 Nov)**:
  - At least 2 geopolitics stories per edition, and 6-9 stories in total.
  - China coverage (3 Nov): the owner wants strongly critical China coverage, done as sourced accountability reporting in news stories, not slanted news or a labelled view section.
  - Neighbourhood priority (3 Nov): China, Bangladesh, Nepal, Myanmar, Sri Lanka, then South-East Asia. Pakistan, Bhutan, the Maldives and Afghanistan when there is significant news.
  - China accountability reporting (3 Nov): every run looks for China stories that matter to India and Bengal (Brahmaputra dam and river data, LAC, Chinese loans and projects in the neighbourhood, trade dependence, cyber, South China Sea and Taiwan), reported from primary documents, spelling out the risks for India, with Beijing's position attributed and checked against the record. No editorialising in news stories.
  - Conflict claims are always attributed, and each story says what it means for India and Bengal.
  - Topic tag "Geopolitics".
- **Primary sources first**: report from original documents, flagged `"primary": true` and shown as "Original document". Outlets are credited in the sources list only; the story text never names an outlet or agency ("according to reports") (6 Nov). The owner wants the whole archive brought into line; on 6 Nov about 157 older stories still appeared to name outlets (a rough count). Check open PRs before starting that clean-up.
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
  - Every Sunday Read ends with a labelled "## The Declaration's view" section whose first line is "This section sets out The Declaration's view.", arguing India's interest (owner, 6 Nov). No outlets are named in the text.
  - First one (1 Nov): "The dam India cannot see: China's Brahmaputra mega-project and the missing river data", ending with "Why India needs the Siang dam".
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
- Graphics: 1600×900, background #F7F7F4, ink #161714, rendered with Playwright. Share cards (`tools/cards.js`) use the same neutral palette.

## Technical notes for Claude

- Use REST (`gh api repos/agnorpetronet-007/the-declaration/...`) for pull requests and Actions; GraphQL and `gh pr` are blocked.
- Scheduled tasks: change a prompt with update_trigger (send the full prompt). Notification settings need delete and recreate. A task switched off because the account was signed out can't be switched back on from the chat; recreate it (with the owner's OK) or have the owner switch it on in a browser. Keep the `handoff/*.md` copies in sync with the live prompts.
- Changing or deleting scheduled tasks, pushing to main and other outside writes need the owner's clear OK in the chat.
- The sandbox can't open thedeclaration.in, so check deploys via the Actions API, or read the live site with WebFetch. Owner previews: a Playwright PDF of the story page. Phone checks: Playwright at 375px.
- Repo layout:
  - `content/articles/<id>.json`, `content/images/`, `content/cards/` (`node tools/cards.js`)
  - `site.json`, `build.js`, `assets/`, `.github/workflows/deploy.yml`
  - `handoff/` (not published)

## DNS at GoDaddy (done)

- A `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME `www`: agnorpetronet-007.github.io

## Still waiting on the owner

- Editor name, title and contact email; grievance officer; a bio for Rohit Kumar Singh. All `site.json` fields are blank.
- Confirm the ownership and funding wording.
- Cloudflare Web Analytics token and Google Search Console code.
- Domain email, WhatsApp Channel, social accounts, newsletter.
- Instagram and YouTube Shorts packs were offered; language not chosen.
