# PROGRESS — صباحٌ يُغنَّى (Nezar motion)

## الحالة: العينة 0–62s قيد الرندر
- [x] البريف + المعالجة + دليل الأسلوب + التوقيتات (`docs/`)
- [x] دفعة الأصول ١: ٤ لوحات عمودية (terraces/valley/clouds/peak) + شعار ومض
- [x] المحرك عمودي 1080×1920 + بيانات طاقة الصوت (3600 إطار)
- [x] مشاهد العينة s00–s04 + ٣ جولات مراجعة (contact_r1/2/3.jpg)
- [ ] رندر العينة + مكس + فحص QA ← **جارٍ الآن**
- [ ] رفع العينة إلى `zoih6/Nezarmotion/deliverables/` + تحديث README
- [ ] انتظار اعتماد المستخدم → دفعة الأصول ٢ → مشاهد 09–20 → الفيلم الكامل

## سجل المراجعات
- R1: الخطّاف داكن + التلال مسطحة + الكاريوكي صغير → تفتيح + حلقة + إزالة التلال (فشلت Edit الأولى) + تكبير
- R2: تأكيد بقاء التلال (Edit لم يُطبَّق!) → إعادة كتابة s02_world.js كاملة + تثبيت حجم الكاريوكي 92
- R3: اعتماد — التلال زالت، الشفرات والطيور ظاهرة، الابتسامة والكاريوكي سليمة

## درس مهم
`edit_file` قد يبلّغ نجاحاً دون تطبيق (حصل مرتين). **تحقق بـ grep بعد كل تعديل.**

## الاستئناف من الصفر
```bash
export PATH="$HOME/.local/bin:$PATH"  # ffmpeg (أو /usr/local/bin/ffmpeg)
cd /home/user/nezar-film/film
PAGE=index.html ../tools/cs.sh NAME 5 <times...>   # شيت مراجعة
# رندر عينة:
rm -rf /var/tmp/nzr && mkdir -p /var/tmp/nzr && cp -r film tools /var/tmp/nzr/ && ln -s $PWD/node_modules /var/tmp/nzr/node_modules
cd /var/tmp/nzr/film && ffmpeg -v error -y -i "/home/user/Nezarmotion/الأغنية.mp3" -ac 2 -ar 48000 tmp/vo.wav
PAGE=index.html VO=tmp/vo.wav python3 -u ../tools/render_seg.py sample 0 1860
```

## QA العينة (يُستكمل بعد الرندر)
- [ ] الإطارات = 1860، المدة 62.0s
- [ ] الصوت −14±1 LUFS، TP ≤ −1.5
- [ ] تزامن: 42.6 دخول اللالا، 59.9 أول بيت
- [ ] فحص فك الترميز + تشغيل بالمتصفح
