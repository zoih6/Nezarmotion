# Production — صباحٌ يُغنَّى
كود الفيلم (Motion-Doc Studio، عمودي 1080×1920).
- `film/` صفحة الفيلم + المشاهد (`scenes/s*.js`) + الأصول المستخدمة
- `assets/gen/` اللوحات المولّدة (PNG أصلية) · `assets/real/` شعار ومض
- `docs/` البريف والمعالجة والأسلوب والتوقيتات والمراجعات
- `tools/` أدوات الرندر (نفس أدوات Motion-Doc Studio، معدّلة للعمودي)
## التشغيل
```bash
npm i --no-audit --no-fund playwright && npx playwright install chromium
cd film && PAGE=index.html ../tools/cs.sh test 4 1 10 45 60
```
