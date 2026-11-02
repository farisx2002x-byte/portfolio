// الوسائط: تحويل الصور إلى WebP بمقاسات مناسبة، وتحويل PDF إلى شرائح، وتبسيط طبقات GIS.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { tmpdir } from "node:os";

export const SIZES = { cover: 1600, gallery: 1600, slides: 1920, certificates: 1400, profile: 800, og: 1200 };
const IMG = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif", ".bmp", ".heic"]);
export const isImage = (name) => IMG.has(extname(name).toLowerCase());
export const isPdf = (name) => extname(name).toLowerCase() === ".pdf";
export const slug = (name) => basename(name, extname(name)).toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "");

let sharp = null;
async function getSharp() { if (sharp === null) { try { sharp = (await import("sharp")).default; } catch { sharp = false; } } return sharp; }

/* يكتب WebP بعرض أقصى؛ إن غاب sharp يحفظ الأصل كما هو */
export async function toWebp(buf, outPath, maxW) {
  mkdirSync(join(outPath, ".."), { recursive: true });
  const sh = await getSharp();
  if (!sh) { const alt = outPath.replace(/\.webp$/, extname(outPath)); writeFileSync(alt, buf); return { path: alt, converted: false }; }
  await sh(buf, { failOn: "none" }).rotate().resize({ width: maxW, withoutEnlargement: true }).webp({ quality: 82 }).toFile(outPath);
  return { path: outPath, converted: true };
}
/* صورة المشاركة OG بصيغة PNG (واتساب وX لا يعرضان WebP/SVG بثبات) */
export async function toPng(buf, outPath, maxW) {
  mkdirSync(join(outPath, ".."), { recursive: true }); const sh = await getSharp();
  if (!sh) { writeFileSync(outPath, buf); return { path: outPath, converted: false }; }
  await sh(buf, { failOn: "none" }).rotate().resize({ width: maxW, height: Math.round(maxW * 630 / 1200), fit: "cover" }).png({ quality: 85 }).toFile(outPath); return { path: outPath, converted: true };
}
/* PDF → صور شرائح عبر pdftoppm (poppler) ثم WebP */
export async function pdfToSlides(buf, outDir, maxW = SIZES.slides) {
  const tmp = join(tmpdir(), "fa-pdf-" + Date.now()); mkdirSync(tmp, { recursive: true }); const pdf = join(tmp, "in.pdf"); writeFileSync(pdf, buf);
  try { execFileSync("pdftoppm", ["-png", "-r", "110", pdf, join(tmp, "p")], { stdio: "ignore" }); } catch { rmSync(tmp, { recursive: true, force: true }); return { ok: false, reason: "pdftoppm غير متاح" }; }
  const pages = readdirSync(tmp).filter((f) => f.startsWith("p") && f.endsWith(".png")).sort();
  const out = []; mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < pages.length; i++) { const r = await toWebp(readFileSync(join(tmp, pages[i])), join(outDir, `slide-${String(i + 1).padStart(2, "0")}.webp`), maxW); out.push(r.path); }
  rmSync(tmp, { recursive: true, force: true }); return { ok: true, files: out };
}
/* GeoJSON/Shapefile(zip) → GeoJSON مبسّط بإسقاط WGS 84 عبر mapshaper */
export function simplifyGis(inputPath, outPath, pct = "10%") {
  mkdirSync(join(outPath, ".."), { recursive: true });
  const bin = join(process.cwd(), "node_modules", ".bin", "mapshaper");
  if (!existsSync(bin)) { if (inputPath.endsWith(".geojson") || inputPath.endsWith(".json")) { writeFileSync(outPath, readFileSync(inputPath)); return { ok: true, simplified: false }; } return { ok: false, reason: "mapshaper غير مثبت" }; }
  try { execFileSync(bin, ["-i", inputPath, "-proj", "wgs84", "-simplify", pct, "keep-shapes", "-o", "format=geojson", "precision=0.000001", outPath], { stdio: "ignore" }); return { ok: true, simplified: true }; }
  catch (e) { return { ok: false, reason: String(e.message).slice(0, 200) }; }
}
export const bytes = (p) => { try { return statSync(p).size; } catch { return 0; } };
