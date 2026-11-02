/* ─────────────────────────────────────────────
   حسابات جيوديسية خالصة (بلا DOM): WGS84 ↔ DMS ↔ UTM، مسافة واتجاه، دوائر.
   UTM: معادلات Krüger (سلسلة من الدرجة السادسة) كما في Karney 2011، دقة مليمترية.
   ───────────────────────────────────────────── */
const a = 6378137.0, f = 1 / 298.257223563, k0 = 0.9996;
const n = f / (2 - f), n2 = n * n, n3 = n2 * n, n4 = n3 * n, n5 = n4 * n, n6 = n5 * n;
const A = (a / (1 + n)) * (1 + n2 / 4 + n4 / 64 + n6 / 256);
const alpha = [n / 2 - 2 * n2 / 3 + 5 * n3 / 16 + 41 * n4 / 180 - 127 * n5 / 288 + 7891 * n6 / 37800, 13 * n2 / 48 - 3 * n3 / 5 + 557 * n4 / 1440 + 281 * n5 / 630 - 1983433 * n6 / 1935360, 61 * n3 / 240 - 103 * n4 / 140 + 15061 * n5 / 26880 + 167603 * n6 / 181440, 49561 * n4 / 161280 - 179 * n5 / 168 + 6601661 * n6 / 7257600, 34729 * n5 / 80640 - 3418889 * n6 / 1995840, 212378941 * n6 / 319334400];
const beta = [n / 2 - 2 * n2 / 3 + 37 * n3 / 96 - n4 / 360 - 81 * n5 / 512 + 96199 * n6 / 604800, n2 / 48 + n3 / 15 - 437 * n4 / 1440 + 46 * n5 / 105 - 1118711 * n6 / 3870720, 17 * n3 / 480 - 37 * n4 / 840 - 209 * n5 / 4480 + 5569 * n6 / 90720, 4397 * n4 / 161280 - 11 * n5 / 504 - 830251 * n6 / 7257600, 4583 * n5 / 161280 - 108847 * n6 / 3991680, 20648693 * n6 / 638668800];
const delta = [2 * n - 2 * n2 / 3 - 2 * n3 + 116 * n4 / 45 + 26 * n5 / 45 - 2854 * n6 / 675, 7 * n2 / 3 - 8 * n3 / 5 - 227 * n4 / 45 + 2704 * n5 / 315 + 2323 * n6 / 945, 56 * n3 / 15 - 136 * n4 / 35 - 1262 * n5 / 105 + 73814 * n6 / 2835, 4279 * n4 / 630 - 332 * n5 / 35 - 399572 * n6 / 14175, 4174 * n5 / 315 - 144838 * n6 / 6237, 601676 * n6 / 22275];
const e = Math.sqrt(f * (2 - f));
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

export const zoneOf = (lon) => Math.floor((lon + 180) / 6) + 1;
export function toUTM(lat, lon, zone = zoneOf(lon)) {
  const north = lat >= 0, lon0 = (zone - 1) * 6 - 180 + 3;
  const phi = lat * D2R, lam = (lon - lon0) * D2R;
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - e * Math.atanh(e * Math.sin(phi)));
  const xi0 = Math.atan2(t, Math.cos(lam)), eta0 = Math.atanh(Math.sin(lam) / Math.sqrt(1 + t * t));
  let xi = xi0, eta = eta0;
  for (let j = 1; j <= 6; j++) { xi += alpha[j - 1] * Math.sin(2 * j * xi0) * Math.cosh(2 * j * eta0); eta += alpha[j - 1] * Math.cos(2 * j * xi0) * Math.sinh(2 * j * eta0); }
  const E = 500000 + k0 * A * eta, N = (north ? 0 : 10000000) + k0 * A * xi;
  return { zone, hemisphere: north ? "N" : "S", easting: E, northing: N };
}
export function fromUTM(zone, hemisphere, E, N) {
  const lon0 = (zone - 1) * 6 - 180 + 3;
  const xi = (N - (hemisphere === "S" ? 10000000 : 0)) / (k0 * A), eta = (E - 500000) / (k0 * A);
  let xi1 = xi, eta1 = eta;
  for (let j = 1; j <= 6; j++) { xi1 -= beta[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta); eta1 -= beta[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta); }
  const chi = Math.asin(Math.sin(xi1) / Math.cosh(eta1));
  let phi = chi; for (let j = 1; j <= 6; j++) phi += delta[j - 1] * Math.sin(2 * j * chi);
  const lam = Math.atan2(Math.sinh(eta1), Math.cos(xi1));
  return { lat: phi * R2D, lon: lon0 + lam * R2D };
}
export function toDMS(v, isLat) {
  const h = isLat ? (v >= 0 ? "N" : "S") : (v >= 0 ? "E" : "W"); v = Math.abs(v);
  const d = Math.floor(v), m = Math.floor((v - d) * 60), s = ((v - d) * 60 - m) * 60;
  return `${d}° ${m}′ ${s.toFixed(2)}″ ${h}`;
}
export function parseDMS(str) {
  const s = String(str || "").trim(); if (!s) return NaN;
  const m = s.match(/(-?\d+(?:\.\d+)?)[°\s]+(?:(\d+(?:\.\d+)?)['′\s]+)?(?:(\d+(?:\.\d+)?)["″\s]*)?\s*([NSEWnsew])?/);
  if (!m) { const v = parseFloat(s); return isNaN(v) ? NaN : v; }
  let v = Math.abs(+m[1]) + (+(m[2] || 0)) / 60 + (+(m[3] || 0)) / 3600;
  if (m[1].startsWith("-") || /[SWsw]/.test(m[4] || "")) v = -v; return v;
}
/* مسافة الدائرة العظمى (haversine) والاتجاه الأولي */
export function distanceBearing(lat1, lon1, lat2, lon2) {
  const R = 6371008.8, p1 = lat1 * D2R, p2 = lat2 * D2R, dp = (lat2 - lat1) * D2R, dl = (lon2 - lon1) * D2R;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  const d = 2 * R * Math.asin(Math.sqrt(h));
  const y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  const b = (Math.atan2(y, x) * R2D + 360) % 360;
  return { meters: d, bearing: b };
}
/* مضلع دائرة جيوديسية تقريبية (للنطاق) */
export function circlePolygon(lat, lon, radiusM, steps = 64) {
  const R = 6371008.8, d = radiusM / R, p1 = lat * D2R, l1 = lon * D2R, ring = [];
  for (let i = 0; i <= steps; i++) { const b = (i / steps) * 2 * Math.PI; const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b)); const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2)); ring.push([l2 * R2D, p2 * R2D]); }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}
