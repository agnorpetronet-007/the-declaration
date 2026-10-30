// Builds The Declaration into _site/. No dependencies: `node build.js`.
// Stories live in content/articles/<id>.json. A story with "status": "draft" is not published.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "_site");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const SECTIONS = site.sections;
const TZ = "Asia/Kolkata";
const BASE = site.domain ? "https://" + site.domain.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

// ---------- helpers ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const fFull = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
const fTime = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
const fDay = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const fLong = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dayKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const ist = (d) => fFull.format(d) + " IST";
const write = (rel, content) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };

// ---------- load stories ----------
function load() {
  const dir = path.join(ROOT, "content/articles");
  const list = [];
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const id = f.slice(0, -5);
    if (!/^[a-z0-9-]+$/.test(id)) { console.warn("Skipping " + f + ": file names must use a-z, 0-9 and hyphens"); continue; }
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { throw new Error(f + ": invalid JSON: " + e.message); }
    if (d.status === "draft") continue;
    const pub = new Date(d.publishedAt);
    if (!d.title || isNaN(pub)) throw new Error(f + ": needs a title and a valid publishedAt");
    const upd = d.updatedAt ? new Date(d.updatedAt) : null;
    list.push({
      id, title: d.title, dek: d.dek || "", body: d.body || "", section: d.section || "News",
      author: d.author || "Declaration Desk", publishedAt: pub, updatedAt: upd && !isNaN(upd) ? upd : null,
      lead: !!d.lead, breaking: !!d.breaking, correction: d.correction || "",
      sources: Array.isArray(d.sources) ? d.sources.filter((s) => s && /^https?:\/\//.test(s.url || "")) : [],
    });
  }
  return list.sort((a, b) => b.publishedAt - a.publishedAt);
}

// Inline formatting inside paragraphs: [text](https://link) and **bold**
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (m, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
function prose(text) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => {
    if (p.startsWith("## ")) return `<h2>${inline(p.slice(3))}</h2>`;
    if (p.startsWith("> ")) return `<blockquote>${inline(p.replace(/^>\s?/gm, ""))}</blockquote>`;
    return `<p>${inline(p)}</p>`;
  }).join("\n");
}
const firstPara = (s) => (s.body.split(/\n\s*\n/).find((p) => p.trim() && !/^(##|>)/.test(p.trim())) || "").trim().replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
const clip = (t, n) => (t.length > n ? t.slice(0, t.lastIndexOf(" ", n - 20)) + "…" : t);

// ---------- layout ----------
function layout({ root, title, description, canonical, body, current, ogType = "website", jsonld, newest, small, live }) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  const url = BASE && canonical != null ? BASE + "/" + canonical : "";
  const nav = [`<a href="${root}" ${current === "front" ? 'aria-current="page"' : ""}>Front page</a>`]
    .concat(SECTIONS.map((s) => `<a href="${root}section/${slug(s)}/" ${current === slug(s) ? 'aria-current="page"' : ""}>${esc(s)}</a>`)).join("");
  return `<!doctype html>
<html lang="en-IN" data-root="${root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
${url ? `<link rel="canonical" href="${url}">` : ""}
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title || site.name)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:type" content="${ogType}">
${url ? `<meta property="og:url" content="${url}">` : ""}
<meta property="og:image" content="${BASE ? BASE + "/assets/share.png" : root + "assets/share.png"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${root}feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,600;1,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${root}assets/style.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body${newest ? ` data-newest="${esc(newest)}"` : ""}>
<div class="wrap">
  <div class="util"><span id="today">${esc(fLong.format(new Date()))}</span><span><a href="${root}about/">About</a> &nbsp;·&nbsp; <a href="${root}feed.xml">RSS</a></span></div>
  <a class="mast${small ? " small" : ""}" href="${root}" aria-label="${esc(site.name)}, front page"><span class="logo" aria-hidden="true"></span><span class="sr">${esc(site.name)}. ${esc(site.tagline)}.</span></a>
  <nav class="rail" aria-label="Sections">
    <div class="sections">${nav}</div>
    <form class="search" action="${root}search/" role="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <label class="sr" for="q">Search stories</label><input id="q" name="q" type="search" placeholder="Search" autocomplete="off">
    </form>
  </nav>
</div>
${live || ""}
<div class="wrap">
${body}
</div>
<footer>
  <div class="wrap">
    <a href="${root}" class="mini" aria-label="${esc(site.name)}, front page"></a>
    <div class="fcols">
      <div><h3>Sections</h3><ul>${SECTIONS.slice(0, 6).map((s) => `<li><a href="${root}section/${slug(s)}/">${esc(s)}</a></li>`).join("")}</ul></div>
      <div><h3>More sections</h3><ul>${SECTIONS.slice(6).map((s) => `<li><a href="${root}section/${slug(s)}/">${esc(s)}</a></li>`).join("")}<li><a href="${root}search/">Search</a></li></ul></div>
      <div><h3>${esc(site.name)}</h3><ul><li><a href="${root}about/">About us</a></li><li><a href="${root}about/#standards">Our standards</a></li><li><a href="${root}about/#corrections">Corrections</a></li><li><a href="${root}about/#contact">Contact</a></li></ul></div>
      <div><h3>Our promise</h3><p>We report what can be verified, name our sources, and say plainly when something is not yet known. All times are Indian Standard Time.</p></div>
    </div>
    <div class="fbase"><span>© ${new Date().getFullYear()} ${esc(site.name)}. ${esc(site.tagline)}.</span><span><a href="${root}feed.xml" style="color:inherit">RSS feed</a></span></div>
  </div>
</footer>
<script src="${root}assets/site.js" defer></script>
</body>
</html>`;
}

// ---------- components ----------
const kicker = (s, root) => `<div class="kicker label">${s.breaking ? '<span class="tag-live">Breaking · </span>' : ""}${SECTIONS.includes(s.section) ? `<a href="${root}section/${slug(s.section)}/" style="text-decoration:none">${esc(s.section)}</a>` : esc(s.section)}</div>`;
const href = (s, root) => `${root}story/${s.id}/`;
const when = (s) => s.updatedAt || s.publishedAt;
function byline(s, withUpdate) {
  let b = `By <b>${esc(s.author)}</b> · <time datetime="${s.publishedAt.toISOString()}">${ist(s.publishedAt)}</time>`;
  if (withUpdate && s.updatedAt && s.updatedAt - s.publishedAt > 60000) b += ` · Updated <time datetime="${s.updatedAt.toISOString()}">${ist(s.updatedAt)}</time>`;
  return `<div class="byline">${b}</div>`;
}
const card = (s, root) => `<article class="card">${kicker(s, root)}<h3><a href="${href(s, root)}">${esc(s.title)}</a></h3>${s.dek ? `<p>${esc(s.dek)}</p>` : ""}<div class="byline"><time data-ago datetime="${when(s).toISOString()}">${ist(when(s))}</time> · ${readTime(s)}</div></article>`;
const readTime = (s) => Math.max(1, Math.round((s.title + " " + s.dek + " " + s.body).split(/\s+/).length / 220)) + " min read";
const isLive = (s, now) => s.breaking && now - s.publishedAt < 36 * 3600e3;
function liveBar(stories, root, now) {
  const b = stories.find((s) => isLive(s, now));
  return b ? `<div class="livebar"><div class="wrap"><span class="tag"><i aria-hidden="true"></i>LIVE</span><a href="${href(b, root)}">BREAKING: ${esc(b.title)}</a></div></div>` : "";
}
function frontGrid(list, root, now, briefTitle = "Today's Briefing") {
  const lead = list.find((s) => s.lead) || list[0];
  const lp = firstPara(lead);
  const brief = list.filter((s) => s !== lead).slice(0, 7).map((s) => `<li><a href="${href(s, root)}"><span class="s label">${s.breaking ? "Breaking · " : ""}${esc(s.section)}</span><span class="t">${esc(s.title)}</span><time datetime="${s.publishedAt.toISOString()}">${dayKey(s.publishedAt) === dayKey(now) ? fTime.format(s.publishedAt) + " IST" : fDay.format(s.publishedAt)}</time></a></li>`).join("");
  return { lead, html: `<div class="front">
    <article class="lead">
      <div class="top">${isLive(lead, now) ? '<span class="chip">BREAKING</span>' : `<span class="kicker label" style="margin-right:12px">${esc(lead.section)}</span>`}<span class="readtime">${readTime(lead)}</span></div>
      <h2><a href="${href(lead, root)}">${esc(lead.title)}</a></h2>${lead.dek ? `<p class="dek">${esc(lead.dek)}</p>` : ""}${byline(lead, true)}${lp ? `<p class="excerpt">${esc(clip(lp, 420))}</p>` : ""}</article>
    ${brief ? `<aside class="brief"><div class="brief-head"><h2>${briefTitle}</h2><span>LATEST</span></div><ol>${brief}</ol></aside>` : ""}
  </div>` };
}
const opinionCol = (s, root) => `<article class="op"><h3><a href="${href(s, root)}">${esc(s.title)}</a></h3>${s.dek ? `<p>${esc(s.dek)}</p>` : ""}<div class="who">${esc(s.author)}</div></article>`;
const standardsBox = (root) => `<aside class="standards"><div><div class="label">Independent journalism</div><h2>Every story sourced. Every correction in the open.</h2></div><a class="btn" href="${root}about/">Our standards →</a></aside>`;

// ---------- build ----------
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });
  const stories = load();
  const now = new Date();
  const newest = stories.length ? stories[0].id + "@" + when(stories[0]).toISOString() : "";

  // Front page
  {
    const root = "./";
    let body;
    if (!stories.length) body = `<main><div class="notice"><div class="label kicker">First edition</div><h2>Stories will appear here as they are published</h2></div></main>`;
    else {
      const { lead, html } = frontGrid(stories, root, now);
      const rest = stories.filter((s) => s !== lead);
      const secs = [...new Set(rest.map((s) => s.section))].sort((a, b) => ((SECTIONS.indexOf(a) + 1) || 99) - ((SECTIONS.indexOf(b) + 1) || 99));
      const blocks = secs.map((sec) => {
        const items = rest.filter((s) => s.section === sec).slice(0, 6);
        const more = SECTIONS.includes(sec) ? `<a href="${root}section/${slug(sec)}/">More ›</a>` : "";
        if (sec === "Opinion") return `<section><div class="block-head"><h2 class="italic">Opinion</h2>${more}</div><div class="ops">${items.slice(0, 3).map((s) => opinionCol(s, root)).join("")}</div></section>`;
        return `<section><div class="block-head"><h2>${esc(sec)}</h2>${more}</div><div class="cards">${items.map((s) => card(s, root)).join("")}</div></section>`;
      }).join("");
      body = `<main>${html}${blocks ? `<div class="blocks">${blocks}</div>` : ""}${standardsBox(root)}</main>`;
    }
    write("index.html", layout({ root, canonical: "", body, live: liveBar(stories, root, now), current: "front", newest, jsonld: { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: site.name, description: site.description, ...(BASE ? { url: BASE + "/", logo: BASE + "/assets/share.png" } : {}) } }));
  }

  // Section pages
  for (const sec of SECTIONS) {
    const root = "../../";
    const list = stories.filter((s) => s.section === sec);
    let main;
    if (!list.length) main = `<div class="notice"><div class="label kicker">${esc(sec)}</div><h2>No ${esc(sec)} stories yet</h2><p>New stories in this section will appear here as soon as they are published.</p></div>`;
    else {
      const { lead, html } = frontGrid(list, root, now, "More in " + sec);
      const rest = list.filter((s) => s !== lead).slice(7);
      main = `<div class="page-head"><h1>${esc(sec)}</h1><p>${list.length} ${list.length === 1 ? "story" : "stories"}</p></div>${html}${rest.length ? `<div class="cards more">${rest.map((s) => card(s, root)).join("")}</div>` : ""}`;
    }
    write(`section/${slug(sec)}/index.html`, layout({ root, title: sec, description: `${sec} news from ${site.name}.`, canonical: `section/${slug(sec)}/`, body: `<main>${main}</main>`, live: liveBar(stories, root, now), current: slug(sec), newest, small: true }));
  }

  // Story pages
  for (const s of stories) {
    const root = "../../";
    const related = stories.filter((x) => x !== s && x.section === s.section).slice(0, 3);
    const others = related.length ? related : stories.filter((x) => x !== s).slice(0, 3);
    const shareText = encodeURIComponent(s.title + (BASE ? " " + BASE + "/story/" + s.id + "/" : ""));
    const body = `<main><article class="story">
  <a class="back" href="${root}">← Front page</a>
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${isLive(s, now) ? '<span class="chip">BREAKING</span>' : ""}${kicker({ ...s, breaking: false }, root)}<span class="readtime">${readTime(s)}</span></div>
  <h1>${esc(s.title)}</h1>
  ${s.dek ? `<p class="dek">${esc(s.dek)}</p>` : ""}
  <div class="meta">${byline(s, true)}<div class="share">${BASE ? `<a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener">WhatsApp</a><a href="https://x.com/intent/post?text=${shareText}" target="_blank" rel="noopener">X</a>` : ""}<button type="button" data-copy>Copy link</button></div></div>
  <div class="prose">${prose(s.body)}</div>
  ${s.correction ? `<div class="correction"><b>Correction:</b> ${inline(s.correction)}</div>` : ""}
  ${s.sources.length ? `<section class="sources"><h2 class="label">Sources</h2><ol>${s.sources.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title || x.url)}</a></li>`).join("")}</ol></section>` : ""}
  <p class="disclosure">This story was researched and drafted with AI assistance and reviewed by an editor before publication. Spotted an error? <a href="${root}about/#contact">Tell us</a>.</p>
</article>
${others.length ? `<section class="more"><div class="block-head"><h2 class="label">More from ${esc(site.name)}</h2></div><div class="cards">${others.map((x) => card(x, root)).join("")}</div></section>` : ""}
</main>`;
    const jsonld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: s.title, description: s.dek, datePublished: s.publishedAt.toISOString(), dateModified: when(s).toISOString(), author: { "@type": "Organization", name: s.author }, publisher: { "@type": "Organization", name: site.name, ...(BASE ? { logo: { "@type": "ImageObject", url: BASE + "/assets/share.png" } } : {}) }, articleSection: s.section, ...(BASE ? { image: [BASE + "/assets/share.png"], mainEntityOfPage: BASE + "/story/" + s.id + "/" } : {}) };
    write(`story/${s.id}/index.html`, layout({ root, title: s.title, description: s.dek || clip(firstPara(s), 160), canonical: `story/${s.id}/`, body, ogType: "article", jsonld, small: true, live: s.breaking ? "" : liveBar(stories, root, now) }));
  }

  // About page
  {
    const root = "../";
    const contact = site.contactEmail ? `<p>Write to us at <b>${esc(site.contactEmail)}</b>.</p>` : `<p>Contact details will be published here shortly.</p>`;
    const grievance = site.grievanceOfficer ? `<p>Grievance Officer: <b>${esc(site.grievanceOfficer)}</b>. We acknowledge complaints within 24 hours and aim to resolve them within 15 days.</p>` : "";
    const body = `<main><article class="story">
  <div class="kicker label">About</div><h1>About ${esc(site.name)}</h1>
  <p class="dek">${esc(site.description)}</p>
  <div class="prose">
<p>${esc(site.name)} is an independent news journal. We answer to our readers, not to an owner, a party or an advertiser.</p>
<h2 id="standards">Our standards</h2>
<p>We report what can be verified. Every story lists its sources, with links, at the foot of the page. Where a figure is preliminary or a claim is disputed, we say so. Opinion is labelled as opinion and kept apart from reporting.</p>
<h2>How we use AI</h2>
<p>Our stories are researched and drafted with the help of AI tools. An editor reviews every story before it is published, and the editor is responsible for what appears on this site.</p>
<h2 id="corrections">Corrections</h2>
<p>When we get something wrong, we fix it in the story and add a correction note at the bottom saying what changed. We do not quietly delete errors.</p>
<h2 id="contact">Contact and complaints</h2>
${contact}
${grievance}
  </div>
</article></main>`;
    write("about/index.html", layout({ root, title: "About", description: `About ${site.name}, our standards and how to contact us.`, canonical: "about/", body, small: true }));
  }

  // Search page
  write("search/index.html", layout({ root: "../", title: "Search", canonical: "search/", small: true, body: `<main class="search-page"><div class="page-head"><h1>Search</h1></div><label class="sr" for="q2">Search stories</label><input id="q2" type="search" placeholder="Search The Declaration" autofocus><div id="search-results"></div></main>` }));

  // 404
  write("404.html", layout({ root: "/", title: "Page not found", body: `<main><div class="notice"><div class="label kicker">404</div><h2>We couldn't find that page</h2><p><a href="/">Go to the front page</a></p></div></main>`, small: true }));

  // Data files
  write("latest.json", JSON.stringify({ newest, builtAt: now.toISOString() }));
  write("search.json", JSON.stringify(stories.map((s) => ({ id: s.id, title: s.title, dek: s.dek, section: s.section, date: ist(s.publishedAt), text: s.body.slice(0, 2000) }))));
  if (BASE) {
    const items = stories.slice(0, 50).map((s) => `<item><title>${esc(s.title)}</title><link>${BASE}/story/${s.id}/</link><guid>${BASE}/story/${s.id}/</guid><pubDate>${s.publishedAt.toUTCString()}</pubDate><category>${esc(s.section)}</category><description>${esc(s.dek)}</description></item>`).join("");
    write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${BASE}/</link><description>${esc(site.description)}</description><language>en-in</language>${items}</channel></rss>`);
    const urls = ["", "about/", ...SECTIONS.map((s) => `section/${slug(s)}/`), ...stories.map((s) => `story/${s.id}/`)];
    write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${BASE}/${u}</loc></url>`).join("")}</urlset>`);
    write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
    write("CNAME", BASE.replace("https://", "") + "\n");
  } else {
    write("feed.xml", `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><description>${esc(site.description)}</description></channel></rss>`);
  }
  write(".nojekyll", "");
  console.log(`Built ${stories.length} stories into _site/`);
}

build();
