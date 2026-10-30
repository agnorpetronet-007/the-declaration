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
- To correct a story, edit the text, set `updatedAt`, and fill in `correction`.

## Editorial workflow

Claude researches and drafts stories every 3 hours and opens a **pull request** called "Edition: <date, time>". Nothing goes live until an editor reviews it:

1. Open the pull request on GitHub (or in the GitHub mobile app).
2. Read each story in "Files changed". Comment on anything that needs changing, or ask Claude in chat.
3. Click **Merge pull request** to publish. Close it to reject the edition.
