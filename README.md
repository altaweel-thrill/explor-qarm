# قَرم — إدارة الأراضي

تطبيق Next.js / TypeScript بواجهة عربية متجاوبة، Google Maps وFirebase Authentication / Cloud Firestore.

تسجيل دخول الإدارة مطلوب دائمًا، والصلاحيات محفوظة في Firestore. متغير `NEXT_PUBLIC_REQUIRE_LOGIN` يتحكم حاليًا في التخزين المحلي أو السحابي للأراضي والطلبات فقط؛ لا يعطّل حماية الإدارة.

## التشغيل

```sh
npm install
cp .env.example .env.local
npm run dev
```

افتح http://localhost:3000. بدون إعدادات Firebase تظهر بيانات توضيحية تحفظ في المتصفح. بدون مفتاح الخرائط يظهر مخطط توضيحي وليس خريطة جغرافية؛ إضافة أرض جديدة تحتاج الخريطة الحقيقية. البيانات التجريبية لا تنتقل تلقائيًا إلى حساب Firebase.

## Google Maps

1. أنشئ مشروعًا في Google Cloud، فعّل الفوترة وMaps JavaScript API.
2. أضف المفتاح في `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` داخل `.env.local`.
3. قيّد المفتاح بـ Maps JavaScript API ونطاقات موقعك، وأضف `http://localhost:3000/*` للتطوير.
4. أعد تشغيل التطبيق بعد تغيير متغيرات البيئة.

الرسم يستخدم Google Maps Polygon مباشرة؛ لا يعتمد على Drawing Library الملغاة. انقر زوايا الأرض بالترتيب ثم احفظ. يمكن سحب الزوايا أثناء التحرير والتراجع عن النقطة الأخيرة. يجب ألا تتقاطع الحدود. المساحة الكروية المحسوبة تقريبية؛ يمكن إدخال مساحة الصك بدلًا منها. السعر الإجمالي = المساحة المعتمدة × سعر المتر. العملة الافتراضية ريال سعودي، والموقع الابتدائي شمال الرياض.

## Firebase

1. أنشئ Firebase Web App وانسخ القيم الأربع إلى المتغيرات الموضحة في `.env.example`.
2. أنشئ Cloud Firestore وفعّل Authentication → Email/Password.
3. أضف localhost ونطاق الإنتاج إلى Authorized domains في Authentication.
4. انشر `firestore.rules` من Firebase Console أو بواسطة Firebase CLI:

```sh
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

5. أعد تشغيل التطبيق وسجل الدخول. يتم حفظ بيانات كل حساب في `users/{uid}/lands/{landId}`. القواعد تحمي بيانات كل حساب، وتسمح لمشرف المنطقة بالعمل على الأراضي ضمن محافظاته المحددة بعد تفعيل التخزين السحابي.

## الإمكانات

- خريطة وحدود قابلة للرسم والتعديل، تكبير وتصغير، وعرض القمر الصناعي.
- إضافة وتعديل وحذف الأرض مع تأكيد الحذف.
- المالك، التواصل، الموقع، مساحة الأرض، سعر المتر، حالة الأرض (متاحة للبيع أو الإيجار، محجوزة، مباعة)، والملاحظات.
- إجمالي تلقائي، إحصائيات، بحث، تصفية وعرض قائمة.
- حفظ سحابي للحساب المسجل أو وضع تجريبي محلي عند غياب إعدادات Firebase.

## التحقق

```sh
npm run typecheck
npm run build
```

يحتاج اختبار الخرائط وتسجيل الدخول والحفظ السحابي إلى مفاتيح حقيقية وخدمات مفعلة. لا تستخدم بيانات شخصية حقيقية في الوضع التجريبي على جهاز مشترك. مفاتيح الويب متاحة للمتصفح بطبيعتها؛ تقييد مفتاح الخرائط وقواعد Firestore هما ما يحمي الوصول.

المراجع: [Next.js](https://nextjs.org/docs/app/getting-started/installation)، [Google Maps Polygon](https://developers.google.com/maps/documentation/javascript/shapes)، [Firebase Rules](https://firebase.google.com/docs/rules/basics).

## بيانات الموقع والإحالة

يتضمن نموذج الأرض المنطقة والمحافظة والحي، واسم الشخص المحيل ورقم جواله كحقلين اختياريين ضمن مجموعة «عن طريق من». تُحفظ هذه الحقول وتظهر في التفاصيل وتُستخدم في البحث الداخلي؛ لا يُنشر رقم المحيل في الواجهة العامة. بعد رسم حدود صالحة، يحاول التطبيق جلب العنوان بالعربية من Google Geocoding بعد توقف الرسم لثانية. يجب تفعيل Geocoding API على نفس مشروع Google Cloud وإضافتها إلى قيود مفتاح الخرائط. البيانات قد تكون ناقصة؛ راجعها وأكملها يدويًا. تُطابق المحافظة المأخوذة من administrative_area_level_2 مع القائمة الرسمية، ثم يمكن اختيارها يدويًا من القائمة إذا تعذرت المطابقة. الحقول المعدّلة يدويًا لا تُستبدل تلقائيًا. يلزم نشر قواعد Firestore المحدثة عند إعادة تفعيل التخزين السحابي.

نوع العقار اختيار إلزامي للسجلات الجديدة، ويشمل الأنواع الـ٢٥ الظاهرة في الصور المرجعية. يُحفظ في سجل الإدارة ويظهر في البطاقة العامة ويُستخدم في البحث. السجلات القديمة التي لا تملك هذا الحقل تظل قابلة للعرض، وتحتاج تحديد النوع عند تعديلها. عند تشغيل حفظ Firestore السحابي، انشر `firestore.rules` المحدّث قبل نشر واجهة النموذج الجديدة؛ قاعدة `publicLands` السابقة لا تسمح بالحقل الجديد.

## Public marketplace and administration

- `/`: public marketplace and contact form.
- `/admin`: land management; `/admin/lands`: land list.
- `/admin/requests`: contact requests.
- `/admin/users`: user creation, roles and account access status.
- `/admin/login`: Firebase email/password login.

## Users and permissions — Firestore is authoritative

Profiles are stored at `users/{Firebase Auth UID}` with `name`, `email`, `role` (`admin`, `editor`, or `regional_supervisor`), `active` (boolean), and assigned regional scopes. Passwords are handled exclusively by Firebase Authentication and are never written to Firestore. The former custom claim is no longer consulted by the UI or Firestore rules.

Admin: manage profiles, create login accounts, assign roles and activate/deactivate access, plus manage their lands and requests. Editor: manage their own lands and associated requests; cannot manage profiles. Admin land portfolios remain per-account, not shared across staff. A user can read their own profile; only active admins can list or edit profiles. Self-demotion/deactivation is blocked in rules and UI. Profile changes update the route guard through a live Firestore subscription.

For a new account use the users form with name, email and password; a secondary in-memory Firebase Auth instance keeps the current admin signed in. If profile creation fails, the new Auth account is rolled back when possible; otherwise the UI shows its UID for repair. The interface creates new accounts only; existing-account linking is not offered. Email on a profile is metadata; the UID determines authorization. Disabling access does not delete the Auth account or its records, but denies admin routes and protected Firestore data.

The initial administrator profile has been saved in project `qarm-3b02c` and the Firestore rules have been deployed. Future rule edits must be deployed explicitly with `firebase deploy --only firestore:rules --project qarm-3b02c`.

## Data mode

Authentication is always required for administration. `NEXT_PUBLIC_REQUIRE_LOGIN=false` currently selects local storage for lands and contact requests only; user profiles and permissions always use Firestore. Local data is browser-specific and is not protected production storage. To use cloud land/request storage, set the flag to `true` and restart. Existing local records are not migrated automatically.

Cloud land saves atomically update the private record and a public projection in `publicLands`; sold/deleted lands are removed from public listings. Public projections exclude owner contact details, internal notes and referrals. Contact requests are created by visitors in `contactRequests` and read only by authorized staff associated with that land. Add anti-abuse protection for visitor submissions before public production launch.

## مشرف المنطقة والمحافظات

تُحفظ صلاحيات `regional_supervisor` في `users/{uid}` كقائمة `regions` وخريطة `governorates` تربط كل منطقة بالمحافظات المسموحة. في صفحة `/admin/users` يمكن للمدير تحديد المنطقة ثم محافظة واحدة أو أكثر تحتها، واختيار الكل أو إلغاء الكل، ثم حفظ الصلاحيات. يجب اختيار محافظة واحدة على الأقل لكل منطقة مختارة. الحسابات القديمة التي تملك مناطق فقط تحتاج تحديث المحافظات من صفحة المستخدمين قبل أن تتمكن من الدخول كمشرف.

قائمة المواقع مستمدة من [دليل المناطق والمحافظات الرسمي للمركز الوطني للوثائق والمحفوظات](https://ncar.gov.sa/regions-coding). بيانات الدليل الحالية التي استُخدمت هنا تشمل ١٤١ محافظة و١٣ مقر إمارة؛ تُعرض مقار الإمارات بوسم خاص حتى يمكن إسناد أراضٍ داخل المدن الرئيسة. العدد ١٣٦ المذكور في طلب المشروع لا يطابق هذا الدليل الحالي، ويمكن استبدال القائمة إذا وُفّرت نسخة معتمدة محددة.

نموذج الأرض يستعمل قائمة محافظات تتبع المنطقة المختارة، ويحاول مطابقة نتيجة Google Geocoding مع الاسم المعتمد. يقتصر استعلام مشرف المنطقة للأراضي والطلبات على محافظاته، وتتحقق قواعد Firestore من المنطقة والمحافظة عند القراءة والكتابة. السجلات القديمة ذات محافظة غير متطابقة تحتاج تعديلًا من مالكها قبل أن تظهر للمشرف. البيانات المحلية في المتصفح لا تنتقل تلقائيًا إلى Firestore.

نُشرت القواعد والفهارس في مشروع `qarm-3b02c` بتاريخ ١٥ سبتمبر ٢٠٢٦. بعد أي تعديل مستقبلي لهما، انشر الملفين مجددًا باستخدام Firebase CLI:

```sh
npx firebase deploy --only firestore:rules,firestore:indexes --project qarm-3b02c
```
## خريطة المشرفين

صفحة `/admin/supervisors` متاحة للمدير فقط، وتقرأ ملفات المستخدمين من Firestore مباشرة. تُظهر على خريطة المناطق الإدارية الـ١٣ عدد المشرفين النشطين ذوي صلاحيات المناطق والمحافظات المكتملة؛ يُحسب المشرف في كل منطقة كُلّف بها، لذلك قد يزيد مجموع التكليفات عن عدد الأشخاص. اختيار منطقة من الخريطة أو القائمة يعرض المشرفين فيها وعدد المحافظات المسندة لكل منهم. حدود الخريطة مبسطة لأغراض العرض وليست مرجعًا مساحيًا رسميًا، ومصدرها [geoBoundaries SAU ADM1](https://www.geoboundaries.org/api/current/gbOpen/SAU/ADM1/) المبني على بيانات OpenStreetMap المرخّصة ODbL.

## النطاق المنشور ومفتاح Firebase

عند نشر التطبيق على نطاق جديد، أضف النطاق إلى قيود المواقع الإلكترونية لمفتاح Firebase المستخدم في `NEXT_PUBLIC_FIREBASE_API_KEY` ضمن Google Cloud Console ← APIs & Services ← Credentials. للنطاق الحالي أضف `https://explor-qarm-suzwp.ondigitalocean.app` و`https://explor-qarm-suzwp.ondigitalocean.app/*`، مع إبقاء قيود localhost الموجودة. مفتاح Google Maps منفصل ولا يعالج فشل Firebase Authentication. رسالة `Requests from referer ... are blocked` تعني رفض النطاق من مفتاح Firebase قبل التحقق من البريد أو كلمة المرور.
