#!/bin/bash
# =============================================================
#  سكربت نشر موقع mbclive على GitHub Pages
#  شغّله من داخل مجلد mbclive بهذا الأمر:
#      bash deploy.sh
# =============================================================

set -e

echo ""
echo "📣 (1 من 5) ضبط هوية Git (مرة واحدة فقط)..."
git config --global user.name "ahmedlasheenrespicare-png"
git config --global user.email "ahmedlasheenrespicare@gmail.com"

echo "📣 (2 من 5) التأكد أننا داخل مجلد المشروع الصحيح..."
if [ ! -f "package.json" ]; then
    echo ""
    echo "❌ خطأ: هذا ليس مجلد المشروع!"
    echo "   نفّذ السكربت من داخل مجلد mbclive (المجلد الذي يحتوي على package.json)"
    echo "   أو اسحب هذا الملف إلى داخل مجلد mbclive ثم اكتب: bash deploy.sh"
    exit 1
fi
echo "   ✅ تم العثور على package.json — المجلد صحيح"

echo "📣 (3 من 5) تهيئة المستودع المحلي والربط بـ GitHub..."
git init -b main 2>/dev/null || { git init && git branch -M main; }
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/ahmedlasheenrespicare-png/serverproject.git

echo "📣 (4 من 5) حفظ جميع ملفات الموقع..."
git add .
git commit -m "Redesign: Salient-style light theme (cream + ink + lime)" || echo "   (لا توجد تغييرات جديدة — تم الحفظ مسبقاً)"

echo "📣 (5 من 5) الرفع إلى GitHub..."
echo "   ⚠️ ممكن تظهر لك نافذة تسجيل دخول المتصفح — سجّل بحساب GitHub الخاص بك"
git push -u origin main

echo ""
echo "============================================================"
echo "✅ تم الرفع بنجاح! أكمل الخطوتين الأخيرتين يدوياً:"
echo ""
echo "   1) افتح الرابط التالي واختر Source = GitHub Actions :"
echo "      https://github.com/ahmedlasheenrespicare-png/serverproject/settings/pages"
echo ""
echo "   2) تابع تبويب Actions حتى تظهر علامة ✅ الخضراء"
echo "      ثم افتح موقعك الجديد:"
echo "      https://ahmedlasheenrespicare-png.github.io/serverproject/"
echo "============================================================"
