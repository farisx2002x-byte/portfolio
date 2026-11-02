/* صفحة الأدوات المكانية: محوّل إحداثيات، مسافة واتجاه، نطاق وصول تقريبي */
import { boot, state, t, L, esc, $, $$, toast, setMeta } from "./core.js";
import { toUTM, fromUTM, toDMS, parseDMS, zoneOf, distanceBearing, circlePolygon } from "./geo.js";

const S = {
  ar: { h: "أدوات صغيرة للخرائط", lead: "ثلاث حاسبات أستخدمها في عملي اليومي، تعمل في متصفحك مباشرة. لا تحتاج أن تكون مخططاً لتجربتها: اكتب أرقاماً واضغط «احسب».", intro_h: "ما هذه الصفحة؟", intro: "كل مكان على الأرض له «عنوان رقمي» (إحداثيات). الخرائط المختلفة تكتب هذا العنوان بصيغ مختلفة، وهذه الأدوات تترجم بين الصيغ وتقيس المسافات وتقدّر ما يمكن الوصول إليه مشياً أو قيادة.", conv_why: "متى تحتاجه؟ نسخت موقعاً من خرائط Google (مثل 21.54, 39.17) وتريده بصيغة الخرائط المساحية الرسمية (UTM) أو العكس.", dist_why: "متى تحتاجه؟ تريد معرفة المسافة المباشرة بين موقعين «بخط مستقيم» واتجاه أحدهما عن الآخر، مثلاً من جدة إلى الرياض.", reach_why: "متى تحتاجه؟ تسأل: كم يبعد ما يمكنني الوصول إليه في 10 دقائق مشياً من هذه النقطة؟ هذا تقدير دائري مبسّط.", example: "مثال", try_jed: "جدة", try_ryd: "الرياض", try_mak: "مكة", conv: "محوّل الإحداثيات", conv_d: "بين WGS 84 العشري، والدرجات والدقائق والثواني، وUTM (المناطق 36–39 تغطي المملكة).", lat: "خط العرض", lon: "خط الطول", dms_lat: "عرض (DMS)", dms_lon: "طول (DMS)", zone: "المنطقة", hemi: "نصف الكرة", E: "شرقي (E)", N: "شمالي (N)", from: "المصدر", dec: "عشري", dms: "DMS", utm: "UTM", calc: "احسب", copy: "نسخ",
    dist: "المسافة والاتجاه", dist_d: "مسافة الدائرة العظمى (haversine) والاتجاه الأولي بين نقطتين.", p1: "النقطة 1", p2: "النقطة 2", meters: "المسافة", bearing: "الاتجاه", back: "الاتجاه العكسي",
    reach: "نطاق الوصول التقريبي", reach_d: "دائرة مشي أو قيادة حول نقطة بسرعة وزمن تحددهما أنت. هذا تقريب دائري وليس تحليل شبكة طرق، فالنطاق الفعلي أصغر وغير منتظم.", mode: "الوسيلة", walk: "مشي", bike: "دراجة", drive: "قيادة", speed: "السرعة (كم/س)", mins: "الزمن (دقائق)", radius: "نصف القطر", area: "المساحة التقريبية", draw: "ارسم على الخريطة", center: "المركز", invalid: "قيمة غير صالحة" },
  en: { h: "Small map tools", lead: "Three calculators I use daily, running in your browser. You don't need to be a planner: type numbers and press Compute.", intro_h: "What is this page?", intro: "Every place on Earth has a numeric address (coordinates). Different maps write it in different formats; these tools translate between them, measure distances, and estimate what you can reach on foot or by car.", conv_why: "When? You copied a location from Google Maps (e.g. 21.54, 39.17) and need it in the official survey grid (UTM), or the other way round.", dist_why: "When? You want the straight-line distance between two places and the direction, e.g. Jeddah to Riyadh.", reach_why: "When? You ask: how far can I get in 10 minutes on foot from here? A simplified circular estimate.", example: "Example", try_jed: "Jeddah", try_ryd: "Riyadh", try_mak: "Makkah", conv: "Coordinate converter", conv_d: "Between decimal WGS 84, degrees-minutes-seconds and UTM (zones 36–39 cover Saudi Arabia).", lat: "Latitude", lon: "Longitude", dms_lat: "Lat (DMS)", dms_lon: "Lon (DMS)", zone: "Zone", hemi: "Hemisphere", E: "Easting", N: "Northing", from: "Convert from", dec: "Decimal", dms: "DMS", utm: "UTM", calc: "Compute", copy: "Copy",
    dist: "Distance & bearing", dist_d: "Great-circle distance (haversine) and initial bearing between two points.", p1: "Point 1", p2: "Point 2", meters: "Distance", bearing: "Bearing", back: "Back bearing",
    reach: "Approximate reach", reach_d: "A walking or driving circle around a point for a speed and time you set. This is a circular approximation, not a road-network analysis; the real catchment is smaller and irregular.", mode: "Mode", walk: "Walk", bike: "Bike", drive: "Drive", speed: "Speed (km/h)", mins: "Time (minutes)", radius: "Radius", area: "Approx. area", draw: "Draw on map", center: "Centre", invalid: "Invalid value" }
};
const s = (k) => (S[state.lang] || S.ar)[k];
const orow = (label, val, id) => `<div class="orow"><span>${esc(label)}</span><code id="${id}">${esc(val)}</code><button type="button" data-copy="${id}">${esc(s("copy"))}</button></div>`;
const num = (id) => parseFloat($(`#${id}`).value);
let c, map, M;

function render() {
  $("#app").innerHTML = `<div class="wrap page-head"><div class="breadcrumb"><a href="index.html">${esc(L(c.profile.name))}</a><span>/</span><span>${esc(t("nav_tools"))}</span></div><h1 class="h2">${esc(s("h"))}</h1><p class="lead">${esc(s("lead"))}</p>
    <div class="guide rv in"><b>${esc(s("intro_h"))}</b><p class="note" style="font-size:14px;margin:0">${esc(s("intro"))}</p></div>
    <div class="tool-grid">
      <div class="card tool-card"><h3>${esc(s("conv"))}</h3><p class="desc">${esc(s("conv_why"))}</p><p class="desc" style="opacity:.75">${esc(s("conv_d"))}</p><div class="share-row" style="margin:0 0 10px"><span class="mono" style="font-size:11.5px;color:var(--dim)">${esc(s("example"))}:</span><button class="chip" type="button" data-city="21.5433,39.1728">${esc(s("try_jed"))}</button><button class="chip" type="button" data-city="24.7136,46.6753">${esc(s("try_ryd"))}</button><button class="chip" type="button" data-city="21.4225,39.8262">${esc(s("try_mak"))}</button></div>
        <div class="fields"><div class="f full"><label for="src">${esc(s("from"))}</label><select id="src"><option value="dec">${esc(s("dec"))}</option><option value="dms">${esc(s("dms"))}</option><option value="utm">${esc(s("utm"))}</option></select></div>
          <div class="f" data-src="dec"><label for="lat">${esc(s("lat"))}</label><input id="lat" inputmode="decimal" value="21.5433" dir="ltr"></div><div class="f" data-src="dec"><label for="lon">${esc(s("lon"))}</label><input id="lon" inputmode="decimal" value="39.1728" dir="ltr"></div>
          <div class="f" data-src="dms" hidden><label for="dlat">${esc(s("dms_lat"))}</label><input id="dlat" value="21° 32′ 35.88″ N" dir="ltr"></div><div class="f" data-src="dms" hidden><label for="dlon">${esc(s("dms_lon"))}</label><input id="dlon" value="39° 10′ 22.08″ E" dir="ltr"></div>
          <div class="f" data-src="utm" hidden><label for="uz">${esc(s("zone"))}</label><select id="uz"><option>36</option><option selected>37</option><option>38</option><option>39</option></select></div><div class="f" data-src="utm" hidden><label for="uh">${esc(s("hemi"))}</label><select id="uh"><option value="N">N</option><option value="S">S</option></select></div>
          <div class="f" data-src="utm" hidden><label for="ue">${esc(s("E"))}</label><input id="ue" inputmode="decimal" value="517893.13" dir="ltr"></div><div class="f" data-src="utm" hidden><label for="un">${esc(s("N"))}</label><input id="un" inputmode="decimal" value="2382287.98" dir="ltr"></div>
          <div class="f full"><button class="btn btn-primary btn-sm" type="button" id="go-conv">${esc(s("calc"))}</button></div></div><div class="out" id="conv-out"></div></div>
      <div class="card tool-card"><h3>${esc(s("dist"))}</h3><p class="desc">${esc(s("dist_why"))}</p><p class="desc" style="opacity:.75">${esc(s("dist_d"))}</p>
        <div class="fields"><div class="f"><label for="a-lat">${esc(s("p1"))} · ${esc(s("lat"))}</label><input id="a-lat" inputmode="decimal" value="21.5433" dir="ltr"></div><div class="f"><label for="a-lon">${esc(s("p1"))} · ${esc(s("lon"))}</label><input id="a-lon" inputmode="decimal" value="39.1728" dir="ltr"></div>
          <div class="f"><label for="b-lat">${esc(s("p2"))} · ${esc(s("lat"))}</label><input id="b-lat" inputmode="decimal" value="24.7136" dir="ltr"></div><div class="f"><label for="b-lon">${esc(s("p2"))} · ${esc(s("lon"))}</label><input id="b-lon" inputmode="decimal" value="46.6753" dir="ltr"></div>
          <div class="f full"><button class="btn btn-primary btn-sm" type="button" id="go-dist">${esc(s("calc"))}</button></div></div><div class="out" id="dist-out"></div></div>
      <div class="card tool-card full"><h3>${esc(s("reach"))}</h3><p class="desc">${esc(s("reach_why"))}</p><p class="desc" style="opacity:.75">${esc(s("reach_d"))}</p>
        <div class="fields" style="grid-template-columns:repeat(2,1fr)"><div class="f"><label for="r-lat">${esc(s("center"))} · ${esc(s("lat"))}</label><input id="r-lat" inputmode="decimal" value="21.5433" dir="ltr"></div><div class="f"><label for="r-lon">${esc(s("center"))} · ${esc(s("lon"))}</label><input id="r-lon" inputmode="decimal" value="39.1728" dir="ltr"></div>
          <div class="f"><label for="mode">${esc(s("mode"))}</label><select id="mode"><option value="5">${esc(s("walk"))}</option><option value="15">${esc(s("bike"))}</option><option value="30">${esc(s("drive"))}</option></select></div><div class="f"><label for="speed">${esc(s("speed"))}</label><input id="speed" inputmode="decimal" value="5" dir="ltr"></div>
          <div class="f"><label for="mins">${esc(s("mins"))}</label><input id="mins" inputmode="decimal" value="15" dir="ltr"></div><div class="f" style="justify-content:end"><button class="btn btn-primary btn-sm" type="button" id="go-reach">${esc(s("draw"))}</button></div></div>
        <div class="out" id="reach-out"></div><div class="tool-map"><div class="map" id="tmap"></div></div></div></div></div>`;
  $("#src").addEventListener("change", () => { const v = $("#src").value; $$("[data-src]").forEach((e) => (e.hidden = e.dataset.src !== v)); });
  $$("[data-city]").forEach((b) => b.addEventListener("click", () => { const [la, lo] = b.dataset.city.split(","); $("#src").value = "dec"; $$("[data-src]").forEach((f) => (f.hidden = f.dataset.src !== "dec")); $("#lat").value = la; $("#lon").value = lo; conv(); }));
  $("#go-conv").addEventListener("click", conv); $("#go-dist").addEventListener("click", dist); $("#go-reach").addEventListener("click", reach);
  $("#mode").addEventListener("change", () => ($("#speed").value = $("#mode").value));
  $("#app").addEventListener("click", (e) => { const b = e.target.closest("[data-copy]"); if (b) navigator.clipboard?.writeText($("#" + b.dataset.copy).textContent).then(() => toast(t("copied"))); });
  conv(); dist(); initMap().then(reach);
  setMeta(`${t("nav_tools")} · ${L(c.profile.name)}`, s("lead"));
}
function conv() {
  const src = $("#src").value; let lat, lon;
  if (src === "dec") { lat = num("lat"); lon = num("lon"); } else if (src === "dms") { lat = parseDMS($("#dlat").value); lon = parseDMS($("#dlon").value); } else { const r = fromUTM(+$("#uz").value, $("#uh").value, num("ue"), num("un")); lat = r.lat; lon = r.lon; }
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 84 || Math.abs(lon) > 180) { $("#conv-out").innerHTML = `<p class="note" style="color:var(--rust)">${esc(s("invalid"))}</p>`; return; }
  const u = toUTM(lat, lon);
  $("#conv-out").innerHTML = orow(`${s("dec")}`, `${lat.toFixed(6)}, ${lon.toFixed(6)}`, "o1") + orow(s("dms"), `${toDMS(lat, true)}  ${toDMS(lon, false)}`, "o2") + orow(`${s("utm")} ${u.zone}${u.hemisphere}`, `E ${u.easting.toFixed(2)}  N ${u.northing.toFixed(2)}`, "o3") + orow("EPSG", `${u.hemisphere === "N" ? 32600 + u.zone : 32700 + u.zone}`, "o4");
}
function dist() {
  const r = distanceBearing(num("a-lat"), num("a-lon"), num("b-lat"), num("b-lon"));
  if (!isFinite(r.meters)) { $("#dist-out").innerHTML = `<p class="note" style="color:var(--rust)">${esc(s("invalid"))}</p>`; return; }
  $("#dist-out").innerHTML = orow(s("meters"), r.meters >= 10000 ? `${(r.meters / 1000).toFixed(2)} km` : `${r.meters.toFixed(1)} m`, "d1") + orow(s("bearing"), `${r.bearing.toFixed(1)}°`, "d2") + orow(s("back"), `${((r.bearing + 180) % 360).toFixed(1)}°`, "d3");
}
async function initMap() {
  try { M = await import("./maps.js"); map = await M.createMap("tmap", { center: [39.1728, 21.5433], zoom: 11, cooperative: true }); await M.whenReady(map); map.on("click", (e) => { $("#r-lat").value = e.lngLat.lat.toFixed(5); $("#r-lon").value = e.lngLat.lng.toFixed(5); reach(); }); } catch { $("#tmap").innerHTML = `<div class="map-fallback">${esc(t("map_unavail"))}</div>`; }
}
function reach() {
  const lat = num("r-lat"), lon = num("r-lon"), sp = num("speed"), mn = num("mins"); if (![lat, lon, sp, mn].every(isFinite)) return;
  const r = (sp * 1000) * (mn / 60); const area = Math.PI * r * r / 1e6;
  $("#reach-out").innerHTML = orow(s("radius"), r >= 1000 ? `${(r / 1000).toFixed(2)} km` : `${r.toFixed(0)} m`, "r1") + orow(s("area"), `${area.toFixed(2)} km²`, "r2");
  if (!map || !map.loaded()) return;
  const fc = { type: "FeatureCollection", features: [circlePolygon(lat, lon, r)] };
  if (map.getSource("reach")) map.getSource("reach").setData(fc); else { map.addSource("reach", { type: "geojson", data: fc }); map.addLayer({ id: "reach-f", type: "fill", source: "reach", paint: { "fill-color": "#28A085", "fill-opacity": .25 } }); map.addLayer({ id: "reach-l", type: "line", source: "reach", paint: { "line-color": "#C9B23A", "line-width": 2, "line-dasharray": [2, 2] } }); }
  const b = fc.features[0].geometry.coordinates[0]; map.fitBounds([[Math.min(...b.map((x) => x[0])), Math.min(...b.map((x) => x[1]))], [Math.max(...b.map((x) => x[0])), Math.max(...b.map((x) => x[1]))]], { padding: 40, duration: 600 });
}
(async () => { c = await boot("tools"); render(); document.addEventListener("langchange", render); })();
