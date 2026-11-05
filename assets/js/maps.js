/* ─────────────────────────────────────────────
   خرائط MapLibre: تحميل كسول، طبقات GeoJSON من content/gis.json،
   مفتاح تلقائي، نوافذ بيانات، مقارنة Swipe، وعرض مائل ثلاثي الأبعاد.
   خريطة الأساس: OpenFreeMap (بلا مفتاح API).
   ───────────────────────────────────────────── */
import { state, L, esc, el, t, base, reduce } from "./core.js";

const STYLES = { dark: "https://tiles.openfreemap.org/styles/dark", light: "https://tiles.openfreemap.org/styles/positron" };
const isDark = () => (document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
let libP = null;
export const baseStyle = () => (isDark() ? STYLES.dark : STYLES.light);
export function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  libP ??= new Promise((res, rej) => {
    const b = new URL("../vendor/", import.meta.url); document.head.appendChild(el("link", { rel: "stylesheet", href: b + "maplibre-gl.css" }));
    const s = el("script", { src: b + "maplibre-gl.js" }); s.onload = () => res(window.maplibregl); s.onerror = rej; document.head.appendChild(s);
  });
  return libP;
}

/* إنشاء خريطة مع معالجة فشل خريطة الأساس */
export async function createMap(container, opts = {}) {
  const ml = await loadMapLibre();
  const map = new ml.Map({ container, style: STYLES[isDark() ? "dark" : "light"], center: opts.center || [39.17, 21.54], zoom: opts.zoom ?? 10, pitch: opts.pitch ?? 0, bearing: opts.bearing ?? 0, attributionControl: { compact: true }, cooperativeGestures: opts.cooperative ?? true, ...(opts.map || {}) });
  map.on("error", (e) => { if (e?.error?.status === 404 || /style/i.test(e?.error?.message || "")) { try { map.setStyle(STYLES.light); } catch {} } });
  if (!opts.noCtl) map.addControl(new ml.NavigationControl({ visualizePitch: true }), opts.ctlPos || (state.lang === "ar" ? "top-left" : "top-right"));
  map._layersAdded = [];
  document.addEventListener("themechange", () => { const keep = [...map._layersAdded]; map.once("styledata", () => setTimeout(() => keep.forEach((cfg) => addLayer(map, cfg, true)), 200)); map.setStyle(STYLES[isDark() ? "dark" : "light"]); });
  return map;
}
export const whenReady = (map) => new Promise((r) => (map.loaded() ? r() : map.once("load", r)));

/* تحميل GeoJSON (مع ذاكرة مؤقتة) */
const cache = new Map();
export async function loadGeo(src) {
  if (cache.has(src)) return cache.get(src);
  const p = fetch(base() + src).then((r) => (r.ok ? r.json() : null)).catch(() => null); cache.set(src, p); return p;
}
export function geoBounds(fc) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const walk = (c) => { if (typeof c[0] === "number") { minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]); minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]); } else c.forEach(walk); };
  for (const f of fc.features || []) if (f.geometry) walk(f.geometry.coordinates);
  return minX <= maxX ? [[minX, minY], [maxX, maxY]] : null;
}

/* تعبير اللون من تعريف الترميز */
function colorExpr(st) {
  if (!st || st.type === "single" || !st.field) return st?.color || "#28A085";
  if (st.type === "categories") { const e = ["match", ["get", st.field]]; for (const c of st.classes || []) e.push(c.value, c.color); e.push(st.default || "#888"); return e; }
  if (st.type === "graduated") { const e = ["step", ["to-number", ["get", st.field], 0], st.colors[0]]; (st.breaks || []).forEach((b, i) => e.push(b, st.colors[i + 1] || st.colors[st.colors.length - 1])); return e; }
  return "#28A085";
}

/* إضافة طبقة من تعريف gis.json */
export async function addLayer(map, cfg, silent = false) {
  const data = await loadGeo(cfg.src); if (!data) return null;
  const id = `L-${cfg.id}`; if (map.getSource(id)) return id;
  map.addSource(id, { type: "geojson", data });
  const color = colorExpr(cfg.style), g = cfg.geometry || "point";
  if (g === "polygon") { map.addLayer({ id, type: "fill", source: id, paint: { "fill-color": color, "fill-opacity": cfg.style?.opacity ?? .55 } }); map.addLayer({ id: id + "-line", type: "line", source: id, paint: { "line-color": "#ffffff", "line-opacity": .35, "line-width": 1 } }); }
  else if (g === "line") map.addLayer({ id, type: "line", source: id, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color, "line-width": cfg.style?.width ?? 3 } });
  else map.addLayer({ id, type: "circle", source: id, paint: { "circle-color": color, "circle-radius": cfg.style?.radius ?? 7, "circle-stroke-color": "#0E1216", "circle-stroke-width": 1.5 } });
  if (!silent && !map._layersAdded.some((x) => x.id === cfg.id)) map._layersAdded.push(cfg);
  // نافذة البيانات
  map.on("click", id, (e) => {
    const f = e.features?.[0]; if (!f) return; const fields = cfg.popupFields?.length ? cfg.popupFields : Object.keys(f.properties || {}).slice(0, 6);
    const rows = fields.filter((k) => f.properties[k] != null).map((k) => `<div class="popup-row"><span>${esc(k)}</span><b>${esc(f.properties[k])}</b></div>`).join("");
    new window.maplibregl.Popup({ closeButton: true, maxWidth: "280px" }).setLngLat(e.lngLat).setHTML(`<b style="display:block;margin-bottom:6px">${esc(L(cfg.title))}</b>${rows || `<div class="popup-row"><span>—</span></div>`}`).addTo(map);
  });
  map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer")); map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  return id;
}
export function setVisible(map, cfgId, on) { for (const id of [`L-${cfgId}`, `L-${cfgId}-line`]) if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
export async function fitTo(map, cfgs) {
  let b = null; for (const c of cfgs) { const d = await loadGeo(c.src); const bb = d && geoBounds(d); if (!bb) continue; b = b ? [[Math.min(b[0][0], bb[0][0]), Math.min(b[0][1], bb[0][1])], [Math.max(b[1][0], bb[1][0]), Math.max(b[1][1], bb[1][1])]] : bb; }
  if (b) map.fitBounds(b, { padding: 48, duration: reduce ? 0 : 900, maxZoom: 14 });
}

/* مفتاح الخريطة التلقائي */
export function legendHtml(cfgs) {
  return cfgs.map((c) => {
    const st = c.style || {}, pt = c.geometry === "point" ? "pt" : "";
    let items = "";
    if (st.type === "categories") items = (st.classes || []).map((k) => `<div class="li"><i class="${pt}" style="background:${k.color}"></i>${esc(L(k.label) || k.value)}</div>`).join("");
    else if (st.type === "graduated") { const br = st.breaks || []; items = st.colors.map((col, i) => { const lo = i === 0 ? "<" : br[i - 1], hi = br[i] ?? "+"; return `<div class="li"><i style="background:${col}"></i><span class="mono">${i === 0 ? `< ${br[0]}` : i === st.colors.length - 1 ? `≥ ${br[i - 1]}` : `${lo} – ${hi}`}</span></div>`; }).join(""); }
    else items = `<div class="li"><i class="${pt}" style="background:${st.color || "#28A085"}"></i>${esc(L(c.title))}</div>`;
    return `<div><b>${esc(L(c.title))}</b>${items}</div>`;
  }).join("");
}

/* عرض مائل مع مباني مجسمة (إن توفرت بيانات الارتفاع في خريطة الأساس) */
export function toggle3D(map, on) {
  const id = "fa-3d";
  if (on) {
    const src = Object.keys(map.getStyle().sources || {}).find((s) => /openmaptiles|openfreemap/i.test(s));
    if (src && !map.getLayer(id)) { try { map.addLayer({ id, type: "fill-extrusion", source: src, "source-layer": "building", minzoom: 13, paint: { "fill-extrusion-color": isDark() ? "#3A4652" : "#B9C2BE", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 10], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": .8 } }); } catch {} }
    map.easeTo({ pitch: 55, bearing: -17, duration: reduce ? 0 : 900 });
  } else { if (map.getLayer(id)) map.removeLayer(id); map.easeTo({ pitch: 0, bearing: 0, duration: reduce ? 0 : 700 }); }
}

/* مقارنة Swipe: خريطة ثانية مقصوصة ومتزامنة */
export async function createSwipe(box, baseMap, leftCfg, rightCfg) {
  const ml = await loadMapLibre();
  const wrap = el("div", { class: "map", style: "z-index:4" }); box.appendChild(wrap);
  const top = new ml.Map({ container: wrap, style: baseMap.getStyle(), center: baseMap.getCenter(), zoom: baseMap.getZoom(), pitch: baseMap.getPitch(), bearing: baseMap.getBearing(), attributionControl: false, interactive: false });
  await whenReady(top);
  await addLayer(top, rightCfg, true); setVisible(top, rightCfg.id, true); setVisible(top, leftCfg.id, false);
  const bar = el("div", { class: "swipe-bar", role: "slider", "aria-label": t("swipe"), "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "50", tabindex: "0" }); box.appendChild(bar);
  let x = box.clientWidth / 2;
  const apply = () => { x = Math.max(0, Math.min(box.clientWidth, x)); bar.style.left = x + "px"; wrap.style.clipPath = `inset(0 0 0 ${x}px)`; bar.setAttribute("aria-valuenow", Math.round(100 * x / box.clientWidth)); };
  apply();
  let drag = false;
  bar.addEventListener("pointerdown", (e) => { drag = true; bar.setPointerCapture(e.pointerId); });
  bar.addEventListener("pointermove", (e) => { if (!drag) return; x = e.clientX - box.getBoundingClientRect().left; apply(); });
  bar.addEventListener("pointerup", () => (drag = false)); bar.addEventListener("pointercancel", () => (drag = false));
  bar.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { x -= 20; apply(); } if (e.key === "ArrowRight") { x += 20; apply(); } });
  let lock = false;
  const sync = (a, b) => () => { if (lock) return; lock = true; b.jumpTo({ center: a.getCenter(), zoom: a.getZoom(), pitch: a.getPitch(), bearing: a.getBearing() }); lock = false; };
  baseMap.on("move", sync(baseMap, top));
  new ResizeObserver(() => { top.resize(); apply(); }).observe(box);
  return { destroy() { wrap.remove(); bar.remove(); top.remove(); } };
}
