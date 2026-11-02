// عميل Google خفيف بحساب خدمة (JWT RS256) بلا اعتماديات خارجية.
// يغطي: Sheets (قراءة/إلحاق)، Drive (قوائم/تنزيل/تصدير Docs).
import { createSign } from "node:crypto";

let token = null, tokenExp = 0;
export function loadServiceAccount() {
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON غير موجود في المتغيرات/الأسرار");
  if (!raw.trim().startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(raw);
}
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
export async function accessToken(scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.readonly"]) {
  if (token && Date.now() < tokenExp - 60000) return token;
  const sa = loadServiceAccount(); const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope: scopes.join(" "), aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }) });
  if (!r.ok) throw new Error(`فشل الحصول على رمز الدخول: ${r.status} ${await r.text()}`);
  const j = await r.json(); token = j.access_token; tokenExp = Date.now() + j.expires_in * 1000; return token;
}
async function api(url, opts = {}) {
  const t = await accessToken();
  const r = await fetch(url, { ...opts, headers: { authorization: `Bearer ${t}`, ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`Google API ${r.status} ${url.split("?")[0]}: ${(await r.text()).slice(0, 300)}`);
  return r;
}
/* ── Sheets ── */
export async function sheetTabs(sheetId) { const j = await (await api(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`)).json(); return (j.sheets || []).map((s) => s.properties.title); }
export async function readTab(sheetId, tab) {
  const j = await (await api(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}?valueRenderOption=UNFORMATTED_VALUE`)).json();
  const rows = j.values || []; if (!rows.length) return [];
  const head = rows[0].map((h) => String(h || "").trim());
  return rows.slice(1).filter((r) => r.some((v) => String(v ?? "").trim() !== "")).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}
export async function appendRows(sheetId, tab, head, rows) {
  const values = rows.map((o) => head.map((h) => o[h] ?? ""));
  await api(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tab)}:append?valueInputOption=RAW`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ values }) });
}
/* ── Drive ── */
export async function listChildren(folderId) {
  const out = []; let pageToken = "";
  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const j = await (await api(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name,mimeType,modifiedTime,size,md5Checksum)&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true${pageToken ? `&pageToken=${pageToken}` : ""}`)).json();
    out.push(...(j.files || [])); pageToken = j.nextPageToken || "";
  } while (pageToken);
  return out;
}
export const isFolder = (f) => f.mimeType === "application/vnd.google-apps.folder";
/* شجرة المجلد كاملة: { name, id, files:[], dirs:{} } */
export async function tree(folderId, name = "") {
  const node = { id: folderId, name, files: [], dirs: {} };
  for (const f of await listChildren(folderId)) { if (isFolder(f)) node.dirs[f.name] = await tree(f.id, f.name); else node.files.push(f); }
  return node;
}
export async function download(fileId) { return Buffer.from(await (await api(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`)).arrayBuffer()); }
export async function exportDoc(fileId, mime = "text/html") { return await (await api(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mime)}`)).text(); }
