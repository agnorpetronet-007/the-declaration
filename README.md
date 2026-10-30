# The Declaration

Source for the public news site. Every push to `main` rebuilds and publishes the site through GitHub Pages (about one minute).

## Where things are

| Path | What it is |
|---|---|
| `content/articles/<id>.json` | One file per story. The file name (lowercase, hyphens) becomes the web address: `/story/<id>/` |
| `site.json` | Site name, domain, contact email, grievance officer, list of sections |
| `assets/` | Logo, styles, scripts, share image |
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
  "sources": [{ "title": "Publisher: headline", "url": "https://..." }],
  "correction": ""
}
```

- Times are in UTC; the site shows them in IST.
- `lead: true` puts the story at the top of the front page (the newest lead wins).
- `breaking: true` shows the red LIVE bar for 36 hours.
- `"status": "draft"` keeps a story off the site.
- `image` (optional): `{"src": "file-name.jpg", "alt": "...", "caption": "...", "credit": "..."}`. The file goes in `content/images/` (lowercase, hyphens; jpg/png/webp, about 1600×900). Shown on the story page, and at the top of the front page or section page when the story leads.
- To correct a story, edit the text, set `updatedAt`, and fill in `correction`.

## Editorial workflow

Claude researches and drafts stories every 3 hours and opens a **pull request** called "Edition: <date, time>". Nothing goes live until an editor reviews it:

1. Open the pull request on GitHub (or in the GitHub mobile app).
2. Read each story in "Files changed". Comment on anything that needs changing, or ask Claude in chat.
3. Click **Merge pull request** to publish. Close it to reject the edition.

## Picture rules (no copyright risk)

Use pictures sparingly: one or two per edition at most. Only these are allowed:
1. **Original graphics made for The Declaration**: charts, diagrams, schematic route graphics and fact cards built from the story's own sourced figures. Credit: "Graphic: The Declaration".
2. **Photos the owner took or holds the rights to.**
3. **Wikimedia Commons files** whose licence has been checked on the file page and is Public Domain, CC0, CC BY or CC BY-SA, credited exactly as the licence requires (author, licence, link).

Never use photos from news sites, agencies, Google Images or social media. Never use photos of identifiable people. Do not draw maps with international or state borders; use schematic diagrams instead.
