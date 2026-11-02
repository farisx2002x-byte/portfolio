# -*- coding: utf-8 -*-
"""تغطية المعلومات الخاصة في الصور بعد الاستيراد (قابل للتكرار)."""
import os, sys, json
from PIL import Image, ImageDraw
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
VOL = sys.argv[1] if len(sys.argv) > 1 else ""   # مسار volCertificate-.pdf الأصلي (اختياري)
# 1) شهادة التطوع: رقم الهوية + QR
if VOL and os.path.exists(VOL):
    os.system(f'pdftoppm -png -r 150 -f 1 -l 1 "{VOL}" /tmp/vol')
    im = Image.open("/tmp/vol-1.png").convert("RGB"); W, H = im.size; s = 150 / 72; d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = 341.42 * s, 276.8 * s, 444.43 * s, 293.8 * s
    d.rounded_rectangle((x0 - 8, y0 - 6, x1 + 8, y1 + 6), radius=6, fill=(20, 24, 30)); d.text((x0 + 10, y0 + 1), "■ ■ ■ ■", fill=(200, 200, 200))
    d.rounded_rectangle((int(W * .78), int(H * .74), int(W * .92), int(H * .90)), radius=10, fill=(28, 36, 48))
    im.thumbnail((1400, 1400)); os.makedirs("media/certificates", exist_ok=True); im.save("media/certificates/volunteer-104h-2025.webp", "WEBP", quality=84)
    c = json.load(open("content/certificates.json", encoding="utf-8"))
    for x in c:
        if x["id"] == "volunteer-104h-2025": x["image"] = "media/certificates/volunteer-104h-2025.webp"; x["noFile"] = False; x["note"] = {"ar": "9 أكتوبر – 3 نوفمبر 2025، مع الإدارة العامة للمسؤولية الاجتماعية وخدمة المجتمع بالجامعة. رقم الهوية ورمز التحقق مغطّيان في الصورة.", "en": "9 Oct – 3 Nov 2025 with KAU's Social Responsibility & Community Service administration. ID number and QR masked."}
    json.dump(c, open("content/certificates.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1); print("vol cert masked")
# 2) بوستر عسير: أسماء الزملاء في الترويسة
p = "media/posters/posters-asir-hawra.webp"
if os.path.exists(p):
    im = Image.open(p).convert("RGB"); d = ImageDraw.Draw(im); d.rectangle((88, 268, 330, 298), fill=(255, 255, 255)); d.rectangle((88, 318, 330, 352), fill=(255, 255, 255)); im.save(p, "WEBP", quality=82); print("asir names masked")
# 3) ملخص TOD، الشريحة 3: أسماء الطلاب في المفتاح
p = "media/projects/urp244-tod-neighbourhood/slides/slide-03.webp"
if os.path.exists(p):
    im = Image.open(p).convert("RGB"); d = ImageDraw.Draw(im)
    for cy in [723, 750, 777, 805, 860]: d.rectangle((872, cy - 13, 996, cy + 13), fill=(255, 255, 255)); d.rectangle((900, cy - 4, 990, cy + 4), fill=(190, 190, 190))
    im.save(p, "WEBP", quality=82); print("tod legend masked")
