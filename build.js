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
      format: ["brief", "standard", "indepth"].includes(d.format) ? d.format : "standard",
      topics: Array.isArray(d.topics) ? d.topics.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim()).slice(0, 5) : [],
      card: fs.existsSync(path.join(ROOT, "content/cards", id + ".jpg")) ? id + ".jpg" : null,
      image: d.image && /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(d.image.src || "") && fs.existsSync(path.join(ROOT, "content/images", d.image.src)) ? d.image : null,
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
function layout({ root, title, description, canonical, body, current, ogType = "website", jsonld, newest, small, live, ogImage, progress }) {
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
<meta property="og:image" content="${(BASE ? BASE + "/" : root) + (ogImage || "assets/share.png")}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${root}feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,600;1,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${root}assets/style.css">
<script>try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body${newest ? ` data-newest="${esc(newest)}"` : ""}>
${progress ? '<div class="progress" aria-hidden="true"><i></i></div>' : ""}
<div class="wrap">
  <div class="util"><span id="today">${esc(fLong.format(new Date()))}</span><span class="util-r"><a href="${root}about/">About</a><a href="${root}team/">Team</a><a href="${root}feed.xml">RSS</a><button type="button" class="theme" data-theme-toggle aria-label="Switch between light and dark mode"><span class="sun" aria-hidden="true">☀</span><span class="moon" aria-hidden="true">☾</span><span class="tt">Theme</span></button></span></div>
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
      <div><h3>${esc(site.name)}</h3><ul><li><a href="${root}about/">About us</a></li><li><a href="${root}about/#standards">Our standards</a></li><li><a href="${root}team/">Editorial team</a></li><li><a href="${root}ownership/">Ownership &amp; funding</a></li><li><a href="${root}about/#contact">Contact</a></li></ul></div>
      <div><h3>Policies</h3><ul><li><a href="${root}corrections/">Corrections log</a></li><li><a href="${root}privacy/">Privacy policy</a></li><li><a href="${root}terms/">Terms of use</a></li></ul><p style="margin-top:14px">All times are Indian Standard Time.</p></div>
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
const minutes = (s) => Math.max(1, Math.round((s.title + " " + s.dek + " " + s.body).split(/\s+/).length / 220));
const readTime = (s) => s.format === "brief" ? "Brief" : s.format === "indepth" ? `In depth · ${minutes(s)} min read` : `${minutes(s)} min read`;
const topicHref = (t, root) => `${root}topic/${slug(t)}/`;
const tagsHtml = (s, root) => s.topics.length ? `<div class="tags"><span class="label">Topics</span>${s.topics.map((t) => `<a href="${topicHref(t, root)}">${esc(t)}</a>`).join("")}</div>` : "";
function relatedTo(s, stories, n) {
  const score = (x) => x.topics.filter((t) => s.topics.includes(t)).length * 3 + (x.section === s.section ? 1 : 0);
  return stories.filter((x) => x !== s).map((x) => [x, score(x)]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1] || b[0].publishedAt - a[0].publishedAt).slice(0, n).map(([x]) => x);
}
const ogFor = (s) => (s.card ? "cards/" + s.card : s.image ? "images/" + s.image.src : null);
// Simple standard page
function pageDoc(root, kickerText, title, dek, innerHtml) {
  return `<main><article class="story doc"><div class="kicker label">${esc(kickerText)}</div><h1>${esc(title)}</h1>${dek ? `<p class="dek">${esc(dek)}</p>` : ""}<div class="prose">${innerHtml}</div></article></main>`;
}
const figure = (s, root, linked) => {
  if (!s.image) return "";
  const img = `<img src="${root}images/${s.image.src}" alt="${esc(s.image.alt || "")}" width="1600" height="900" loading="lazy" decoding="async">`;
  const cap = [s.image.caption, s.image.credit].filter(Boolean).map(esc).join(" · ");
  return `<figure class="fig">${linked ? `<a href="${href(s, root)}" tabindex="-1">${img}</a>` : img}${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
};
const isLive = (s, now) => s.breaking && now - s.publishedAt < 36 * 3600e3;
function liveBar(stories, root, now) {
  const b = stories.find((s) => isLive(s, now));
  return b ? `<div class="livebar"><div class="wrap"><span class="tag"><i aria-hidden="true"></i>LIVE</span><a href="${href(b, root)}">BREAKING: ${esc(b.title)}</a></div></div>` : "";
}
const plain = (p) => p.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
function excerptHtml(s, root) {
  const paras = s.body.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^(##|>)/.test(p)).slice(0, 2).map(plain);
  if (!paras.length) return "";
  let out = [], len = 0;
  for (const p of paras) { if (len > 0 && len + p.length > 700) break; out.push(clip(p, 520)); len += p.length; }
  return `<div class="excerpt">${out.map((p) => `<p>${esc(p)}</p>`).join("")}<a class="cont" href="${href(s, root)}">Continue reading →</a></div>`;
}
const stamp = (d, now) => dayKey(d) === dayKey(now) ? fTime.format(d) : fDay.format(d);
const ago = (s) => `<time data-ago datetime="${when(s).toISOString()}">${ist(when(s))}</time>`;
// Pictures appear on front and section pages only when marked as a hero (a graphic that explains the story at a glance).
// Every other picture appears inside its story only.
const heroFig = (s, root) => (s.image && s.image.hero ? figure(s, root, true) : "");
const secondary = (s, root) => `<article class="sec">${kicker(s, root)}<h3><a href="${href(s, root)}">${esc(s.title)}</a></h3>${s.dek ? `<p>${esc(s.dek)}</p>` : ""}<div class="byline">${ago(s)}</div></article>`;
const compact = (s, root) => `<article class="mini-card">${kicker(s, root)}<h3><a href="${href(s, root)}">${esc(s.title)}</a></h3>${s.dek ? `<p>${esc(clip(s.dek, 150))}</p>` : ""}<div class="byline">${ago(s)} · ${readTime(s)}</div></article>`;
// Top of a page: secondaries | lead | latest rail
function topBlock(list, root, now, latestTitle = "Latest") {
  const lead = list.find((s) => s.lead) || list[0];
  const others = list.filter((s) => s !== lead);
  const secs = [...others.filter((s) => isLive(s, now)), ...others.filter((s) => !isLive(s, now))].slice(0, 3);
  const lp = firstPara(lead);
  const latestList = others.filter((s) => !secs.includes(s)).slice(0, 6);
  const latest = latestList.map((s) => `<li><a href="${href(s, root)}"><time datetime="${s.publishedAt.toISOString()}">${stamp(s.publishedAt, now)}</time><span><span class="s label${isLive(s, now) ? " live" : ""}">${isLive(s, now) ? "Breaking" : esc(s.section)}</span><span class="t">${esc(s.title)}</span></span></a></li>`).join("");
  const html = `<div class="fp${secs.length ? "" : " no-left"}${latest ? "" : " no-right"}">
    ${secs.length ? `<div class="fp-left">${secs.map((s) => secondary(s, root)).join("")}</div>` : ""}
    <article class="fp-lead">
      <div class="top">${isLive(lead, now) ? '<span class="chip">BREAKING</span>' : `<span class="kicker label">${esc(lead.section)}</span>`}<span class="readtime">${readTime(lead)}</span></div>
      <h2><a href="${href(lead, root)}">${esc(lead.title)}</a></h2>${lead.dek ? `<p class="dek">${esc(lead.dek)}</p>` : ""}${byline(lead, true)}${lead.image && lead.image.hero ? `<div class="hero">${heroFig(lead, root)}</div>` : excerptHtml(lead, root)}</article>
    ${latest ? `<aside class="fp-latest"><div class="rail-head"><h2>${latestTitle}</h2><span class="label">IST</span></div><ol>${latest}</ol></aside>` : ""}
  </div>`;
  return { lead, used: [lead, ...secs, ...latestList], html };
}
const opinionCol = (s, root) => `<article class="op"><h3><a href="${href(s, root)}">${esc(s.title)}</a></h3>${s.dek ? `<p>${esc(s.dek)}</p>` : ""}<div class="who">${esc(s.author)}</div></article>`;
const standardsBox = (root) => `<aside class="standards"><div><div class="label">Independent journalism</div><h2>Every story sourced. Every correction in the open.</h2></div><a class="btn" href="${root}about/">Our standards →</a></aside>`;

// ---------- build ----------
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });
  if (fs.existsSync(path.join(ROOT, "content/images"))) fs.cpSync(path.join(ROOT, "content/images"), path.join(OUT, "images"), { recursive: true });
  if (fs.existsSync(path.join(ROOT, "content/cards"))) fs.cpSync(path.join(ROOT, "content/cards"), path.join(OUT, "cards"), { recursive: true });
  const stories = load();
  const now = new Date();
  const newest = stories.length ? stories[0].id + "@" + when(stories[0]).toISOString() : "";

  // Front page
  {
    const root = "./";
    let body;
    if (!stories.length) body = `<main><div class="notice"><div class="label kicker">First edition</div><h2>Stories will appear here as they are published</h2></div></main>`;
    else {
      const { used, html } = topBlock(stories, root, now);
      const rest = stories.filter((s) => !used.includes(s));
      const more = rest.slice(0, 8);
      const moreHtml = more.length ? `<section class="more-news"><div class="block-head"><h2>More news</h2></div><div class="grid4">${more.map((s) => compact(s, root)).join("")}</div></section>` : "";
      const secsWith = SECTIONS.filter((sec) => stories.some((s) => s.section === sec));
      const strips = secsWith.map((sec) => {
        const items = stories.filter((s) => s.section === sec).slice(0, 4);
        if (sec === "Opinion") return `<section class="strip"><div class="strip-name"><h2 class="italic">Opinion</h2><a href="${root}section/opinion/">More ›</a></div><div class="ops">${items.slice(0, 3).map((s) => opinionCol(s, root)).join("")}</div></section>`;
        return `<section class="strip"><div class="strip-name"><h2>${esc(sec)}</h2><a href="${root}section/${slug(sec)}/">All ${esc(sec)} ›</a></div><ul class="strip-list">${items.map((s) => `<li><a href="${href(s, root)}">${esc(s.title)}</a><time datetime="${s.publishedAt.toISOString()}">${stamp(s.publishedAt, now)}</time></li>`).join("")}</ul></section>`;
      }).join("");
      const blocks = strips ? `<div class="by-section"><div class="block-head"><h2>By section</h2></div>${strips}</div>` : "";
      body = `<main>${html}${moreHtml}${blocks}${standardsBox(root)}</main>`;
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
      const { used, html } = topBlock(list, root, now, "Latest in " + sec);
      const rest = list.filter((s) => !used.includes(s));
      main = `<div class="page-head"><h1>${esc(sec)}</h1><p>${list.length} ${list.length === 1 ? "story" : "stories"}</p></div>${html}${rest.length ? `<section class="more-news"><div class="block-head"><h2>More ${esc(sec)}</h2></div><div class="grid4">${rest.map((s) => compact(s, root)).join("")}</div></section>` : ""}`;
    }
    write(`section/${slug(sec)}/index.html`, layout({ root, title: sec, description: `${sec} news from ${site.name}.`, canonical: `section/${slug(sec)}/`, body: `<main>${main}</main>`, live: liveBar(stories, root, now), current: slug(sec), newest, small: true }));
  }

  // Story pages
  for (const s of stories) {
    const root = "../../";
    const related = relatedTo(s, stories, 4);
    const latestOther = stories.filter((x) => x !== s && !related.includes(x)).slice(0, related.length ? 4 - Math.min(related.length, 4) : 4);
    const shareText = encodeURIComponent(s.title + (BASE ? " " + BASE + "/story/" + s.id + "/" : ""));
    const body = `<main><article class="story">
  <a class="back" href="${root}">← Front page</a>
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${isLive(s, now) ? '<span class="chip">BREAKING</span>' : ""}${kicker({ ...s, breaking: false }, root)}<span class="readtime">${readTime(s)}</span></div>
  <h1>${esc(s.title)}</h1>
  ${s.dek ? `<p class="dek">${esc(s.dek)}</p>` : ""}
  <div class="meta">${byline(s, true)}<div class="share">${BASE ? `<a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener">WhatsApp</a><a href="https://x.com/intent/post?text=${shareText}" target="_blank" rel="noopener">X</a>` : ""}<button type="button" data-copy>Copy link</button></div></div>
  ${figure(s, root, false)}
  <div class="prose">${prose(s.body)}</div>
  ${s.correction ? `<div class="correction"><b>Correction:</b> ${inline(s.correction)}</div>` : ""}
  ${s.sources.length ? `<section class="sources"><h2 class="label">Sources</h2><ol>${s.sources.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title || x.url)}</a></li>`).join("")}</ol></section>` : ""}
  ${tagsHtml(s, root)}
  <p class="disclosure">This story was researched and drafted with AI assistance and reviewed by an editor before publication. Spotted an error? <a href="${root}about/#contact">Tell us</a>. <a href="${root}corrections/">Corrections log</a>.</p>
</article>
${related.length ? `<section class="more"><div class="block-head"><h2>Related coverage</h2></div><div class="grid4">${related.map((x) => compact(x, root)).join("")}</div></section>` : ""}
${latestOther.length ? `<section class="more-news"><div class="block-head"><h2>Latest from ${esc(site.name)}</h2><a href="${root}">Front page ›</a></div><div class="grid4">${latestOther.map((x) => compact(x, root)).join("")}</div></section>` : ""}
</main>`;
    const jsonld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: s.title, description: s.dek, datePublished: s.publishedAt.toISOString(), dateModified: when(s).toISOString(), author: { "@type": "Organization", name: s.author }, publisher: { "@type": "Organization", name: site.name, ...(BASE ? { logo: { "@type": "ImageObject", url: BASE + "/assets/share.png" } } : {}) }, articleSection: s.section, ...(s.topics.length ? { keywords: s.topics.join(", ") } : {}), ...(BASE ? { image: [BASE + "/" + (ogFor(s) || "assets/share.png")], mainEntityOfPage: BASE + "/story/" + s.id + "/" } : {}) };
    write(`story/${s.id}/index.html`, layout({ root, title: s.title, description: s.dek || clip(firstPara(s), 160), canonical: `story/${s.id}/`, body, ogType: "article", jsonld, small: true, ogImage: ogFor(s), progress: true, live: s.breaking ? "" : liveBar(stories, root, now) }));
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
<p>${esc(site.name)} is an independent news journal. We answer to our readers, not to a political party, a government or an advertiser. <a href="${root}ownership/">Who owns us</a>.</p>
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

  // Topic pages
  const topics = [...new Set(stories.flatMap((s) => s.topics))];
  for (const t of topics) {
    const root = "../../";
    const list = stories.filter((s) => s.topics.includes(t));
    const body = `<main><div class="page-head"><div class="kicker label">Topic</div><h1>${esc(t)}</h1><p>${list.length} ${list.length === 1 ? "story" : "stories"} · newest first</p></div><div class="grid4">${list.map((s) => compact(s, root)).join("")}</div></main>`;
    write(`topic/${slug(t)}/index.html`, layout({ root, title: t, description: `Coverage of ${t} from ${site.name}.`, canonical: `topic/${slug(t)}/`, body, newest, small: true, live: liveBar(stories, root, now) }));
  }

  // Standard pages
  const updatedNote = (d) => `<p class="doc-date">Last updated: ${esc(d)}</p>`;
  const contactLine = site.contactEmail ? `<b>${esc(site.contactEmail)}</b>` : "the contact address on our About page (to be published shortly)";
  {
    const root = "../";
    const editor = site.editor ? `<p><b>${esc(site.editor)}</b>, Editor${site.editorBio ? ` — ${esc(site.editorBio)}` : ""}</p>` : `<p>The editor's name will be published here shortly.</p>`;
    write("team/index.html", layout({ root, title: "Editorial team", canonical: "team/", small: true, description: `Who runs ${site.name} and how stories are produced.`, body: pageDoc(root, "About", "Editorial team", `Who decides what ${site.name} publishes, and how each story is made.`, `
<h2>Editor</h2>
${editor}
<p>The editor decides what is published, approves every story before it goes live, and is responsible for corrections.</p>
<h2>Declaration Desk</h2>
<p>Stories bylined <b>Declaration Desk</b> are researched and drafted with AI assistance from published reports, official statements and data, and reviewed by the editor before publication. Every such story lists its sources, with links, at the foot of the page.</p>
<h2>Grievance officer</h2>
<p>${site.grievanceOfficer ? `<b>${esc(site.grievanceOfficer)}</b>. ` : "The grievance officer's name will be published here shortly. "}Complaints about our content can be sent to ${contactLine}. We acknowledge complaints within 24 hours and aim to resolve them within 15 days.</p>
<h2>Write for us</h2>
<p>We welcome tips, documents and first-hand reports, especially from West Bengal. Contact us at ${contactLine}.</p>`) }));

    write("ownership/index.html", layout({ root, title: "Ownership and funding", canonical: "ownership/", small: true, description: `Who owns ${site.name} and how it is funded.`, body: pageDoc(root, "About", "Ownership and funding", "Readers should know who stands behind the news they read.", `
<h2>Ownership</h2>
<p>${site.name} is independently owned${site.owner ? ` by <b>${esc(site.owner)}</b>` : ""}. It is not owned by, or affiliated with, any political party, government body or media group.</p>
<h2>Funding</h2>
<p>${site.funding ? esc(site.funding) : `${site.name} currently carries no advertising and no sponsored content.`}</p>
<h2>Our commitments</h2>
<p>We do not accept payment for coverage. If we ever publish advertising or sponsored material, it will be clearly labelled and kept separate from our reporting. Any change to our ownership or funding will be disclosed on this page.</p>
${updatedNote("30 October 2026")}`) }));

    const corrected = stories.filter((s) => s.correction).sort((a, b) => when(b) - when(a));
    write("corrections/index.html", layout({ root, title: "Corrections", canonical: "corrections/", small: true, description: `Every correction ${site.name} has published.`, body: pageDoc(root, "Policies", "Corrections log", "When we get something wrong, we fix it in the story, say what changed, and list it here.", `
${corrected.length ? `<ul class="corr-list">${corrected.map((s) => `<li><time>${ist(when(s))}</time><a href="${href(s, root)}">${esc(s.title)}</a><p>${inline(s.correction)}</p></li>`).join("")}</ul>` : `<p>No corrections have been published yet.</p>`}
<h2>How to report an error</h2>
<p>Write to ${contactLine} with a link to the story and what you believe is wrong. Every report is read by the editor.</p>
<h2>Updates are not corrections</h2>
<p>When a developing story gets new information, such as a revised figure, we update it and show the time of the update under the headline. A correction note is added only when something we published was wrong.</p>`) }));

    write("privacy/index.html", layout({ root, title: "Privacy policy", canonical: "privacy/", small: true, description: `How ${site.name} handles your data.`, body: pageDoc(root, "Policies", "Privacy policy", "The short version: we don't track you, and we don't collect your personal data.", `
<h2>What we collect</h2>
<p>Nothing that identifies you. ${site.name} has no user accounts, no advertising, no analytics and no tracking cookies.</p>
<h2>What stays on your device</h2>
<p>If you choose a light or dark theme, that choice is saved in your own browser so the site remembers it. It is never sent to us.</p>
<h2>Services that handle your connection</h2>
<p>The site is hosted on GitHub Pages, which, like any web host, processes your IP address to deliver pages and may keep it in security logs under GitHub's privacy statement. Our fonts are served by Google Fonts, so your browser connects to Google to load them. Share buttons (WhatsApp, X) only contact those services when you tap them.</p>
<h2>If you write to us</h2>
<p>If you email us, we use your message and address only to reply and to act on what you sent, such as a correction request. We do not sell or share it, and we handle it in line with India's Digital Personal Data Protection Act, 2023.</p>
<h2>Contact</h2>
<p>Questions about this policy can be sent to ${contactLine}.</p>
${updatedNote("30 October 2026")}`) }));

    write("terms/index.html", layout({ root, title: "Terms of use", canonical: "terms/", small: true, description: `The terms for using ${site.name}.`, body: pageDoc(root, "Policies", "Terms of use", `By using ${site.name}, you agree to these terms.`, `
<h2>Our content</h2>
<p>Stories, graphics and design on this site are © ${site.name} unless stated otherwise. You are welcome to share links to our stories and to quote short extracts with a credit and a link back. Republishing a full story or graphic needs our written permission.</p>
<h2>Accuracy</h2>
<p>We work hard to be accurate, name our sources, and correct mistakes openly (see our <a href="${root}corrections/">corrections log</a>). News develops quickly, though, and early figures can change. Our reporting is for general information. It is not financial, legal, medical or investment advice.</p>
<h2>Links to other sites</h2>
<p>Our stories link to the sources we used. We are not responsible for the content of other websites, and a link is not an endorsement.</p>
<h2>Acceptable use</h2>
<p>Please do not copy the site in bulk, interfere with its operation, or use it in any unlawful way.</p>
<h2>Changes and law</h2>
<p>We may update these terms, and the date below will change when we do. These terms are governed by the laws of India.</p>
${updatedNote("30 October 2026")}`) }));
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
    const urls = ["", "about/", "team/", "ownership/", "corrections/", "privacy/", "terms/", ...SECTIONS.map((s) => `section/${slug(s)}/`), ...topics.map((t) => `topic/${slug(t)}/`), ...stories.map((s) => `story/${s.id}/`)];
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
