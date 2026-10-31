# The Declaration

Source for the public news site. Every push to `main` rebuilds and publishes the site through GitHub Pages (about one minute).

## Where things are

| Path | What it is |
|---|---|
| `content/articles/<id>.json` | One file per story. The file name (lowercase, hyphens) becomes the web address: `/story/<id>/` |
| `site.json` | Site name, domain, contact email, grievance officer, list of sections |
| `assets/` | Logo, styles, scripts, share image |
| `content/cards/<id>.jpg` | Share image for each story (WhatsApp/X preview). Make with `npm install && node tools/cards.js` |
| `build.js` | Turns the stories into web pages. Run `node build.js` to preview locally in `_site/` |

## Story file format

```json
{
  "title": "Headline",
  "dek": "One- or two-sentence summary under the headline",
  "section": "India",
  "author": "Declaration Desk",
  "publishedAt": "2026-10-30T06:50:00.000Z",
  "updatedAt": "2026-10-30T06:50:00.000Z",
  "lead": false,
  "breaking": false,
  "body": "Paragraphs separated by a blank line.\n\n## A subheading\n\n> A pull quote\n\nLinks look like [this](https://example.com).",
  "sources": [{ "title": "Calcutta High Court: order in ... (PDF)", "url": "https://...", "primary": true }, { "title": "Publisher: headline", "url": "https://..." }],
  "correction": ""
}
```

- Times are in UTC; the site shows them in IST.
- `lead: true` puts the story at the top of the front page (the newest lead wins).
- `breaking: true` shows the red LIVE bar for 6 hours after the story was published or last updated. With no live breaking story, the bar becomes a dark "Latest" ticker of the five newest headlines. The site rebuilds every hour so these expire on time.
- `format`: `"brief"` (about 200 words), `"standard"` (500-700 words, the default) or `"indepth"` (900-1,200 words). Shown as "Brief", "N min read" or "In depth · N min read".
- `topics`: 1-3 short tags, such as `["Cyclone Arnab", "Odisha"]`. Each topic gets its own page at `/topic/<name>/`, and related stories are chosen by shared topics. Reuse an existing topic name exactly when the story continues a running story.
- `"status": "draft"` keeps a story off the site.
- `image` (optional): `{"src": "file-name.jpg", "alt": "...", "caption": "...", "credit": "..."}`. The file goes in `content/images/` (lowercase, hyphens; jpg/png/webp, about 1600×900). Always shown inside the story. Add `"hero": true` only when the graphic explains the story at a glance (a route diagram, a key-facts card); a hero graphic is also shown under the headline when that story leads the front page or a section page. Charts and supporting graphics stay inside the story.
- To correct a story, edit the text, set `updatedAt`, and fill in `correction`.

## Editorial workflow

Claude researches and drafts stories every 3 hours and opens a **pull request** called "Edition: <date, time>". Nothing goes live until an editor reviews it:

1. Open the pull request on GitHub (or in the GitHub mobile app).
2. Read each story in "Files changed". Comment on anything that needs changing, or ask Claude in chat.
3. Click **Merge pull request** to publish. Close it to reject the edition.

## Picture rules (no copyright risk)

Most stories do not need a picture. Add one only when it tells the reader something the words can't easily do: where something is happening, how big a number is compared with others, how a process unfolds, or a sequence of events. One per edition is typical, two at most, and none is fine. Only these are allowed:
1. **Original graphics made for The Declaration**: charts, diagrams, schematic route graphics and fact cards built from the story's own sourced figures. Credit: "Graphic: The Declaration".
2. **Photos the owner took or holds the rights to.**
3. **Wikimedia Commons files** whose licence has been checked on the file page and is Public Domain, CC0, CC BY or CC BY-SA, credited exactly as the licence requires (author, licence, link).

Never use photos from news sites, agencies, Google Images or social media. Never use photos of identifiable people. Do not draw maps with international or state borders; use schematic diagrams instead.

## Primary sources first

Wherever possible, stories are reported from the original source: court judgments and orders, government and ministry releases (PIB, West Bengal government), regulator and agency statements (IMD, Election Commission, RBI, SEBI, police, NDRF/SDRF), stock-exchange filings, official data and reports. Mark these in `sources` with `"primary": true`; the site lists them first, labelled "Original document". Other news outlets are used to find stories and for material only they have (their own interviews or eyewitness reporting), always credited by name in the text ("told The Telegraph"). Never write "sources said" for sourcing we did not do ourselves.
