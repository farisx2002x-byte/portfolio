// يبني نسخة النشر في dist/: ينسخ ملفات الموقع فقط (بلا سكربتات المزامنة والقوالب والتوثيق)،
// ويضغط JavaScript وCSS ويزيل التعليقات، فيبقى المصدر المقروء في المستودع الخاص وحده.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { transformSync } from "esbuild";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "dist");
const BANNER = "/* © فارس الأسمري — نموذج الملاءمة. جميع الحقوق محفوظة. */";
const COPY = ["assets", "content", "data", "files", "media", "projects", "robots.txt", "sitemap.xml", "favicon.svg", "favicon.ico"];
const HTML = readdirSync(ROOT).filter((f) => f.endsWith(".html") && f !== "edit.html"); // محرّر المحتوى يبقى محلياً

rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
for (const n of [...COPY, ...HTML]) { const src = join(ROOT, n); if (existsSync(src)) cpSync(src, join(OUT, n), { recursive: true }); }

let js = 0, css = 0, html = 0;
const walk = (d) => { if (d.endsWith("/vendor")) return; for (const f of readdirSync(d)) { const p = join(d, f); const st = statSync(p); if (st.isDirectory()) { walk(p); continue; }
  const ext = extname(f);
  if (ext === ".js") { const code = readFileSync(p, "utf8"); const r = transformSync(code, { minify: true, format: "esm", target: "es2020", legalComments: "none", charset: "utf8" }); writeFileSync(p, BANNER + "\n" + r.code); js++; }
  else if (ext === ".css") { const code = readFileSync(p, "utf8"); const r = transformSync(code, { loader: "css", minify: true, legalComments: "none", charset: "utf8" }); writeFileSync(p, BANNER + r.code); css++; }
  else if (ext === ".html") { let code = readFileSync(p, "utf8"); code = code.replace(/<!--(?!\[if)[\s\S]*?-->/g, ""); writeFileSync(p, code); html++; } } };
walk(OUT);
console.log(`dist ready: ${js} js, ${css} css, ${html} html minified`);
