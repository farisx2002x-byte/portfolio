// يولّد صور placeholder (SVG) وبيانات GeoJSON تجريبية للنسخة الأولى من الموقع.
// يُشغَّل مرة واحدة: node scripts/make-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const w = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

const ramp = ["#2A1E5C", "#2D6F8E", "#28A085", "#C9B23A", "#FFF3C4"];
function svg(label, sub, W = 1600, H = 1000, seed = 1) {
  let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cols = 16, rows = Math.round(16 * H / W), cw = W / cols, ch = H / rows;
  let cells = "";
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const v = Math.max(0, 1 - Math.hypot(x - cols * (0.3 + 0.4 * r()), y - rows * 0.5) / (cols * 0.55));
    const c = ramp[Math.min(4, Math.floor(v * 5))];
    cells += `<rect x="${x * cw}" y="${y * ch}" width="${cw - 2}" height="${ch - 2}" fill="${c}" opacity="${(0.35 + v * 0.6).toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
<rect width="${W}" height="${H}" fill="#0E1216"/>${cells}
<rect x="${W * 0.06}" y="${H * 0.62}" width="${W * 0.88}" height="${H * 0.26}" rx="24" fill="#0E1216" opacity=".82"/>
<text x="${W / 2}" y="${H * 0.74}" text-anchor="middle" font-family="IBM Plex Sans Arabic, Arial" font-size="${W * 0.045}" font-weight="700" fill="#F2F4F1">${label}</text>
<text x="${W / 2}" y="${H * 0.83}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="${W * 0.022}" fill="#C9B23A">${sub}</text>
</svg>`;
}

w("media/profile.svg", svg("صورة شخصية · مثال", "PLACEHOLDER · 800×800", 800, 800, 3));
w("media/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0E1216"/><rect x="10" y="10" width="20" height="20" rx="4" fill="#2D6F8E"/><rect x="34" y="10" width="20" height="20" rx="4" fill="#28A085"/><rect x="10" y="34" width="20" height="20" rx="4" fill="#C9B23A"/><rect x="34" y="34" width="20" height="20" rx="4" fill="#FFF3C4"/></svg>`);

const P = { "example-brt": ["cover", "g1", "g2", "s1", "s2", "s3"], "example-school-mobility": ["cover", "s1", "s2"], "example-regional-poles": ["cover", "g1"], "example-digital-tool": ["cover"], "example-long-title": ["cover"] };
let seed = 10;
for (const [id, files] of Object.entries(P)) for (const f of files) {
  const isSlide = f.startsWith("s");
  w(`media/projects/${id}/${f}.svg`, svg(`${id} · ${f} · مثال`, isSlide ? "SLIDE PLACEHOLDER · 1920×1080" : "IMAGE PLACEHOLDER · 1600×1000", isSlide ? 1920 : 1600, isSlide ? 1080 : 1000, seed++));
}
for (const c of ["example-cert-gis", "example-cert-python", "example-cert-no-verify", "example-cert-language"])
  w(`media/certificates/${c}.svg`, svg(`شهادة مثال · ${c}`, "CERTIFICATE PLACEHOLDER · 1400×1000", 1400, 1000, seed++));

// ملف PDF تجريبي بسيط (صالح) للمرفقات
w("files/example-brief.pdf", `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 60>>stream
BT /F1 24 Tf 72 760 Td (Sample project brief - placeholder) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000221 00000 n
0000000330 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
398
%%EOF`);

// بيانات GeoJSON تجريبية حول جدة
const fc = (features) => JSON.stringify({ type: "FeatureCollection", features }, null, 0);
w("data/example-brt-corridor.geojson", fc([{ type: "Feature", properties: { name: "Sample BRT corridor", phase: "proposed" }, geometry: { type: "LineString", coordinates: [[39.16, 21.46], [39.17, 21.50], [39.175, 21.54], [39.185, 21.57], [39.19, 21.61]] } }]));
w("data/example-brt-existing.geojson", fc([{ type: "Feature", properties: { name: "Sample existing route" }, geometry: { type: "LineString", coordinates: [[39.14, 21.47], [39.16, 21.52], [39.20, 21.55], [39.23, 21.60]] } }]));
const st = [[39.16, 21.46, "regular", 1200], [39.17, 21.50, "interchange", 4800], [39.175, 21.54, "regular", 2100], [39.185, 21.57, "interchange", 5600], [39.19, 21.61, "regular", 900]];
w("data/example-stations.geojson", fc(st.map(([lon, lat, type, b], i) => ({ type: "Feature", properties: { name: `Sample station ${i + 1}`, type, daily_boardings: b }, geometry: { type: "Point", coordinates: [lon, lat] } }))));
w("data/example-stations.csv", "name,type,daily_boardings,lon,lat\n" + st.map(([lon, lat, type, b], i) => `Sample station ${i + 1},${type},${b},${lon},${lat}`).join("\n") + "\n");
const cells = []; let k = 0;
for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
  const lon0 = 39.13 + x * 0.02, lat0 = 21.45 + y * 0.03;
  const d = Math.round(100 * Math.max(0, 1 - Math.hypot(x - 2.5, y - 3) / 4));
  cells.push({ type: "Feature", properties: { cell: `C${++k}`, density: d }, geometry: { type: "Polygon", coordinates: [[[lon0, lat0], [lon0 + 0.02, lat0], [lon0 + 0.02, lat0 + 0.03], [lon0, lat0 + 0.03], [lon0, lat0]]] } });
}
w("data/example-density.geojson", fc(cells));
console.log("placeholders written");
