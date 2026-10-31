(function () {
  var TZ = "Asia/Kolkata";
  var root = document.documentElement.getAttribute("data-root") || "./";

  // Today's date in the top bar
  try {
    var t = document.getElementById("today");
    if (t) t.textContent = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  } catch (e) {}

  // "12 min ago" style times
  function ago(d) {
    var m = Math.round((Date.now() - d) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + " min ago";
    var h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? " hr ago" : " hrs ago");
    return null;
  }
  function tick() {
    document.querySelectorAll("[data-ago]").forEach(function (el) {
      var d = new Date(el.getAttribute("datetime"));
      var s = isNaN(d) ? null : ago(d);
      if (s) el.textContent = s;
    });
  }
  tick();
  setInterval(tick, 60000);

  // Tell readers when new stories are published, without reloading under them
  var newest = document.body.getAttribute("data-newest");
  if (newest && window.fetch) {
    setInterval(function () {
      if (document.hidden) return;
      fetch(root + "latest.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !j.newest || j.newest === newest || document.querySelector(".fresh")) return;
        var b = document.createElement("button");
        b.className = "fresh";
        b.type = "button";
        b.textContent = "New stories published · Refresh";
        b.onclick = function () { location.reload(); };
        document.body.appendChild(b);
      }).catch(function () {});
    }, 120000);
  }

  // Hide an expired breaking bar; rotate the Latest ticker
  var lb = document.querySelector(".livebar[data-until]");
  if (lb && Date.now() > Date.parse(lb.getAttribute("data-until"))) lb.hidden = true;
  var tk = document.querySelectorAll(".ticker a");
  if (tk.length > 1 && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    var ti = 0;
    setInterval(function () {
      if (document.hidden) return;
      tk[ti].hidden = true; ti = (ti + 1) % tk.length; tk[ti].hidden = false;
    }, 5000);
  }

  // Light / dark switch (remembered on this device only)
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  });

  // Reading progress on story pages
  var bar = document.querySelector(".progress i"), story = document.querySelector(".story");
  if (bar && story) {
    var upd = function () {
      var r = story.getBoundingClientRect(), total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.width = (p * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  // Copy link button
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = location.href;
      var done = function () { btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = "Copy link"; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link", url); });
      else window.prompt("Copy this link", url);
    });
  });

  // Search page
  var box = document.getElementById("search-results");
  if (box) {
    var input = document.getElementById("q2");
    var q = new URLSearchParams(location.search).get("q") || "";
    input.value = q;
    var data = [];
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var run = function () {
      var v = input.value.trim().toLowerCase();
      if (!v) { box.innerHTML = '<p class="byline">Type a name, place or topic.</p>'; return; }
      var hits = data.filter(function (a) { return (a.title + " " + a.dek + " " + a.section + " " + a.text).toLowerCase().indexOf(v) >= 0; });
      if (!hits.length) { box.innerHTML = '<div class="notice"><h2>No stories match that search</h2><p>Try a different word.</p></div>'; return; }
      box.innerHTML = '<p class="label" style="color:var(--ink-3)">' + hits.length + " result" + (hits.length === 1 ? "" : "s") + '</p><div class="cards">' + hits.map(function (a) {
        return '<article class="card"><div class="kicker label">' + esc(a.section) + '</div><h3><a href="' + root + "story/" + a.id + '/">' + esc(a.title) + "</a></h3>" + (a.dek ? "<p>" + esc(a.dek) + "</p>" : "") + '<div class="byline">' + esc(a.date) + "</div></article>";
      }).join("") + "</div>";
    };
    fetch(root + "search.json").then(function (r) { return r.json(); }).then(function (j) { data = j; run(); });
    input.addEventListener("input", run);
  }
})();
