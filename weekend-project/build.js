// Weekend Project blog builder — markdown posts -> brand-matched static HTML
// Run: bun build.js  (from weekend-project/)
import { marked } from "marked";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename } from "path";

const POSTS_DIR = join(import.meta.dir, "_posts");
const OUT_DIR = join(import.meta.dir, "..", "weekend-project"); // repo root weekend-project

const BRAND = {
  paper: "#F7F3EA", bright: "#FCFAF3", ink: "#141412", inkSoft: "#3A3A36",
  rust: "#C44C1E", rustText: "#BE4A1D",
};

const CSS = `
:root{--paper:${BRAND.paper};--paper-bright:${BRAND.bright};--ink:${BRAND.ink};--ink-soft:${BRAND.inkSoft};--rust:${BRAND.rust};--rust-text:${BRAND.rustText};--rule:3px solid var(--ink);}
*{margin:0;padding:0;box-sizing:border-box;}
body{background-color:var(--paper);background-image:radial-gradient(rgba(20,20,18,0.055) 1px,transparent 1.4px);background-size:15px 15px;color:var(--ink);font-family:'Space Grotesk',sans-serif;font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;}
.wrap{max-width:760px;margin:0 auto;padding:0 24px;}
a{color:inherit;}
h1,h2,h3{font-family:'Lilita One',sans-serif;font-weight:400;line-height:1.08;text-transform:uppercase;letter-spacing:.5px;}
.kicker{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-soft);}
.rust{color:var(--rust-text);}
header.site{border-bottom:var(--rule);padding:22px 0;margin-bottom:40px;}
header.site .wrap{display:flex;justify-content:space-between;align-items:center;max-width:1080px;}
.brand{font-family:'Lilita One',sans-serif;font-size:22px;text-transform:uppercase;letter-spacing:.5px;}
.brand .dyn{color:var(--rust);font-size:13px;letter-spacing:4px;display:block;}
nav.site{font-family:'Space Mono',monospace;font-size:12px;text-transform:uppercase;letter-spacing:1px;}
nav.site a{text-decoration:none;margin-left:18px;}
nav.site a:hover{color:var(--rust);}
article.post .kicker{margin-bottom:14px;}
article.post h1{font-size:40px;margin-bottom:18px;}
.meta{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-soft);border-bottom:var(--rule);padding-bottom:22px;margin-bottom:30px;}
.meta .rust{color:var(--rust-text);}
article.post p{margin-bottom:20px;}
article.post h2{font-size:24px;margin:34px 0 14px;}
article.post h3{font-size:19px;margin:26px 0 10px;}
article.post ul,article.post ol{margin:0 0 20px 22px;}
article.post li{margin-bottom:8px;}
article.post blockquote{border-left:4px solid var(--rust);padding:4px 0 4px 18px;margin:0 0 20px;font-style:italic;color:var(--ink-soft);}
article.post code{font-family:'Space Mono',monospace;font-size:14px;background:rgba(20,20,18,0.07);padding:2px 6px;border-radius:3px;}
article.post pre{background:var(--ink);color:var(--paper-bright);padding:18px;border-radius:6px;overflow-x:auto;margin:0 0 20px;font-family:'Space Mono',monospace;font-size:14px;line-height:1.5;}
article.post pre code{background:none;color:inherit;padding:0;}
article.post img{max-width:100%;border:2px solid var(--ink);margin:6px 0 20px;}
footer.site{border-top:var(--rule);margin-top:60px;padding:26px 0 40px;}
footer.site .wrap{max-width:1080px;display:flex;justify-content:space-between;align-items:center;font-family:'Space Mono',monospace;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-soft);}
footer.site a{text-decoration:none;}
footer.site a:hover{color:var(--rust);}
`;

const HEAD = (title, desc) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Weekend Project</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://devriesdynamics.com/weekend-project/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="DeVries Dynamics">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://devriesdynamics.com/weekend-project/">
<meta property="og:image" content="https://devriesdynamics.com/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>`;

const HEADER = `<header class="site"><div class="wrap">
  <div class="brand">DeVries<span class="dyn">Dynamics</span></div>
  <nav class="site">
    <a href="/">Support</a>
    <a href="/">Build</a>
    <a href="/weekend-project/">Weekend Project</a>
    <a href="/#contact">Get in touch</a>
  </nav>
</div></header>`;

const FOOTER = `<footer class="site"><div class="wrap">
  <span>— Winnipeg · Métis-owned &amp; operated</span>
  <a href="https://devriesdynamics.com">devriesdynamics.com</a>
</div></footer>`;

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

function slugFromFile(f) {
  return basename(f, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function renderPost(f) {
  const raw = readFileSync(join(POSTS_DIR, f), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const slug = slugFromFile(f);
  const html = marked.parse(body);
  const title = meta.title || slug;
  const desc = (meta.title || slug) + " — Weekend Project, a DeVries Dynamics build log.";
  const tags = (meta.tags || "").replace(/[\[\]"]/g, "").split(",").map(t => t.trim()).filter(Boolean).join(" · ");
  const page = `${HEAD(title, desc)}
${HEADER}
<article class="post"><div class="wrap">
  <div class="kicker">${meta.kicker || "Weekend Project"}</div>
  <h1>${title}</h1>
  <div class="meta">${meta.date || ""} · <span class="rust">${tags}</span> · ${meta.read || ""}</div>
  ${html}
</div></article>
${FOOTER}
</body></html>`;
  writeFileSync(join(OUT_DIR, slug + ".html"), page);
  return { slug, title, date: meta.date || "", kicker: meta.kicker || "Weekend Project" };
}

// Build all posts
const posts = readdirSync(POSTS_DIR).filter(f => f.endsWith(".md")).map(renderPost);

// Build index (newest first)
posts.sort((a, b) => (a.date < b.date ? 1 : -1));
const listItems = posts.map(p =>
  `<li><a href="/weekend-project/${p.slug}.html"><span class="kicker">${p.kicker}</span><h2>${p.title}</h2></a></li>`
).join("\n");

const index = `${HEAD("Weekend Project", "A build log from DeVries Dynamics — repurposing old hardware into useful things.")}
${HEADER}
<article class="post"><div class="wrap">
  <div class="kicker">Weekend Project</div>
  <h1>Build log</h1>
  <div class="meta">Repurposing old hardware into useful things · <span class="rust">free · no subscriptions</span></div>
  <p>Every weekend, an old device gets a second life. Here's what we're building.</p>
  <ul class="post-list">${listItems}</ul>
</div></article>
${FOOTER}
</body></html>`;

writeFileSync(join(OUT_DIR, "index.html"), index);
console.log("Built", posts.length, "posts + index");
for (const p of posts) console.log(" -", p.slug + ".html", "|", p.title);
