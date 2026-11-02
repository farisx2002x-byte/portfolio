#!/usr/bin/env node
// البناء بعد المزامنة: وسوم SEO في index.html، صفحة OG ثابتة لكل مشروع، sitemap.xml، robots.txt.
// الاستخدام: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const J = (f) => { try { return JSON.parse(readFileSync(join(ROOT, "content", f + ".json"), "utf8")); } catch { return null; } };
const site = J("site") || {}, profile = J("profile") || {}, projects = J("projects") || [], notes = J("notes") || [];
const L = (o, l = site.defaultLang || "ar") => (o && typeof o === "object" ? o[l] || o.ar || o.en || "" : o || "");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const base = (site.siteUrl || "").replace(/\/$/, "");
const abs = (p) => (p ? (base ? `${base}/${p}` : p) : "");

/* وسوم الصفحة الرئيسية */
{ const p = join(ROOT, "index.html"); let h = readFileSync(p, "utf8");
  const title = L(site.seo?.title) || L(profile.name) || "Portfolio", desc = L(site.seo?.description) || L(profile.tagline) || "";
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`).replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`).replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`).replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(abs(site.seo?.ogImage || "media/og.png"))}">`);
  writeFileSync(p, h); }

/* صفحة OG لكل مشروع: projects/<id>.html تعرض الوسوم ثم تحوّل إلى صفحة المشروع */
const pdir = join(ROOT, "projects"); if (existsSync(pdir)) for (const f of readdirSync(pdir)) if (f.endsWith(".html")) rmSync(join(pdir, f)); mkdirSync(pdir, { recursive: true });
for (const p of projects) {
  const title = `${L(p.title)} · ${L(profile.name)}`, desc = L(p.summary), img = abs(p.cover || site.seo?.ogImage || "media/og.png"), url = abs(`project.html?id=${encodeURIComponent(p.id)}`);
  writeFileSync(join(pdir, `${p.id}.html`), `<!doctype html><html lang="${site.defaultLang || "ar"}"><head><meta charset="utf-8"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:url" content="${esc(url)}"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${esc(url)}"><meta http-equiv="refresh" content="0; url=../project.html?id=${encodeURIComponent(p.id)}"><script>location.replace("../project.html?id=${encodeURIComponent(p.id)}")</script></head><body><a href="../project.html?id=${encodeURIComponent(p.id)}">${esc(L(p.title))}</a></body></html>\n`);
}
/* sitemap + robots */
const now = new Date().toISOString().slice(0, 10);
const urls = ["index.html", "cv.html", "tools.html", ...projects.map((p) => `projects/${p.id}.html`), ...notes.map((n) => `note.html?id=${encodeURIComponent(n.id)}`)];
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(abs(u))}</loc><lastmod>${now}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /edit.html\nDisallow: /preview.html\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ""}`);
console.log(`build: ${projects.length} project pages, sitemap with ${urls.length} urls`);
