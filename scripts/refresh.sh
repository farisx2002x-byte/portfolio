#!/usr/bin/env bash
# إعادة بناء المحتوى + استيراد الوسائط + التغطية + صفحات OG. الاستخدام: scripts/refresh.sh <مجلد الملفات المحلية> [volCertificate.pdf]
set -e; cd "$(dirname "$0")/.."
python3 scripts/real-content.py
[ -n "$1" ] && node scripts/import-media.mjs --from "$1"
python3 scripts/apply-masks.py "$2"
node scripts/build.mjs
