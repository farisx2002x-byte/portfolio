// اختبار معادلات UTM مقابل نقاط مرجعية من pyproj (EPSG:326xx)
import { toUTM, fromUTM, distanceBearing, parseDMS, toDMS } from "../assets/js/geo.js";
const V = [[21.5433,39.1728,37,517893.1274058068,2382287.976939654],[24.7136,46.6753,38,669459.6216098682,2734271.6718420503],[28.3838,36.566,37,261496.65987360565,3142128.2239391482],[26.4207,50.0888,39,409134.15700976865,2922596.5824802136],[18.2164,42.5053,38,236160.9948804619,2015923.845970384],[0,33,36,500000,0],[45,-3,30,500000,4982950.400226552]];
let bad = 0;
for (const [lat, lon, z, E, N] of V) {
  const u = toUTM(lat, lon); const dE = Math.abs(u.easting - E), dN = Math.abs(u.northing - N);
  const b = fromUTM(u.zone, u.hemisphere, u.easting, u.northing); const dl = Math.hypot(b.lat - lat, b.lon - lon);
  const ok = u.zone === z && dE < 0.005 && dN < 0.005 && dl < 1e-8; if (!ok) bad++;
  console.log(ok ? "OK " : "BAD", lat, lon, "zone", u.zone, "ΔE", dE.toFixed(4), "ΔN", dN.toFixed(4), "roundtrip", dl.toExponential(2));
}
const d = distanceBearing(21.5433, 39.1728, 24.7136, 46.6753); console.log("Jeddah→Riyadh", (d.meters/1000).toFixed(1), "km bearing", d.bearing.toFixed(1), "° (expected ≈ 848 km, ≈ 63°)");
console.log(parseDMS(toDMS(21.5433, true)).toFixed(4), toDMS(39.1728,false), parseDMS("39°10'22.08\"E").toFixed(4));
if (bad) { console.error("FAILED", bad); process.exit(1); } else console.log("ALL GEO TESTS PASSED");
