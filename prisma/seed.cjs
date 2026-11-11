/* eslint-disable @typescript-eslint/no-require-imports -- Startup seed runs directly in Node.js. */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
const hashPassword = (p) => bcrypt.hashSync(p, 12);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'rayantech';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
(async () => {
  try {
    console.log('🌱 Seeding (idempotent — only fills missing data)...');

    // ---- Admin credentials (only if not already set) ----
    const exUser = await db.setting.findUnique({ where: { key: 'admin.username' } });
    if (!exUser) {
      await db.setting.create({ data: { key: 'admin.username', value: ADMIN_USERNAME, group: 'general' } });
      console.log('  → Seeded admin username');
    } else {
      console.log('  → Admin username already set, skipping');
    }

    const exPw = await db.setting.findUnique({ where: { key: 'admin.passwordHash' } });
    if (!exPw) {
      await db.setting.create({ data: { key: 'admin.passwordHash', value: hashPassword(ADMIN_PASSWORD), group: 'general' } });
      console.log('  → Seeded admin password hash');
    } else {
      console.log('  → Admin password already set, skipping');
    }

    const exName = await db.setting.findUnique({ where: { key: 'admin.displayName' } });
    if (!exName) {
      await db.setting.create({ data: { key: 'admin.displayName', value: 'مدیر سیستم صحت محاسب', group: 'general' } });
    }

    // ---- Services (only if table is empty) ----
    const svcCount = await db.service.count();
    if (svcCount === 0) {
      console.log('  → Seeding services...');
      const services = [
        { slug: 'modiriat-mali', title: 'مدیریت مالی', shortDesc: 'طراحی و پیاده‌سازی سیستم‌های مکانیزه مالی', description: 'طراحی و پیاده‌سازی سیستم‌های مکانیزه مالی متناسب با نیاز کسب‌وکار شما.', icon: 'TrendingUp', order: 1, featured: true, priceLabel: 'استعلام قیمت' },
        { slug: 'mashwere-mali-maliati', title: 'مشاوره مالی و مالیاتی', shortDesc: 'ارائه راهکارهای بهینه‌سازی مالیاتی', description: 'ارائه راهکارهای بهینه‌سازی مالیاتی و مشاوره در تصمیم‌گیری‌های مالی.', icon: 'ReceiptText', order: 2, featured: true, priceLabel: 'استعلام قیمت' },
        { slug: 'hasabarasi-hesabdari', title: 'اجرای عملیات حسابرسی و حسابداری', shortDesc: 'تهیه صورت‌های مالی و حسابرسی داخلی', description: 'تهیه و تنظیم صورت‌های مالی، کنترل اسناد و حسابرسی داخلی.', icon: 'Calculator', order: 3, featured: true, priceLabel: 'استعلام قیمت' },
        { slug: 'coaching-kasbokar', title: 'کوچینگ و مشاوره کسب‌وکار', shortDesc: 'تحلیل مدل کسب‌وکار و استراتژی رشد', description: 'تحلیل مدل کسب‌وکار، بهبود فرآیندها و همراهی در توسعه.', icon: 'Users2', order: 4, featured: true, priceLabel: 'استعلام قیمت' },
        { slug: 'sepidar-dasht-system', title: 'سیستم حسابداری سپیدار و دشت', shortDesc: 'نماینده رسمی آموزش و فروش', description: 'استقرار و راه‌اندازی نرم‌افزار سپیدار و دشت، آموزش و پشتیبانی.', icon: 'Package', order: 5, featured: true, priceLabel: 'طبق پلن رسمی' },
      ];
      for (const s of services) await db.service.create({ data: s });
      console.log('  → Seeded ' + services.length + ' services');
    } else {
      console.log('  → Services already populated (' + svcCount + '), skipping');
    }

    // ---- Packages (only if table is empty) ----
    const pkgCount = await db.businessPackage.count();
    if (pkgCount === 0) {
      console.log('  → Seeding packages...');
      const packages = [
        { slug: 'sepidar-corporate', name: 'نرم افزار شرکتی سپیدار', software: 'سپیدار', category: 'شرکتی', shortDesc: 'نرم‌افزار حسابداری شرکتی سپیدار', description: 'نرم‌افزار حسابداری شرکتی سپیدار.', features: 'برنامه‌ریزی فروش\nمحاسبات سود و زیان\nتولید\nمدیریت انبار\nدریافت و پرداخت', price: null, oldPrice: null, badge: 'نماینده رسمی', popular: true, order: 1, icon: 'Package' },
        { slug: 'dasht-retail', name: 'نرم افزار فروشگاهی دشت', software: 'دشت', category: 'فروشگاهی', shortDesc: 'نرم‌افزار فروشگاهی دشت', description: 'نرم‌افزار فروشگاهی دشت.', features: 'تعریف کالا\nثبت خرید و فروش\nگزارشات\nاتصال به سخت‌افزار', price: null, oldPrice: null, badge: 'نماینده رسمی', popular: false, order: 2, icon: 'ShoppingCart' },
        { slug: 'training-courses', name: 'دوره‌های جامع آموزش', software: 'آموزشی', category: 'آموزشی', shortDesc: 'دوره‌های آموزش سپیدار و دشت', description: 'دوره‌های جامع آموزش نرم‌افزارهای حسابداری.', features: 'آموزش سپیدار\nآموزش دشت\nآموزش پخش سپیدار\nآموزش پایه و تکمیلی دشت', price: null, oldPrice: null, badge: 'مدرک‌دار', popular: false, order: 3, icon: 'GraduationCap' },
        { slug: 'support', name: 'پشتیبانی', software: 'پشتیبانی', category: 'خدماتی', shortDesc: 'پشتیبانی فنی سپیدار و دشت', description: 'پشتیبانی فنی نرم‌افزارها.', features: 'راهنمایی خطاها\nبرطرف کردن خطاهای DB\nمشاوره عملکرد\nپشتیبانی ایام تعطیل', price: null, oldPrice: null, badge: null, popular: false, order: 4, icon: 'Headset' },
      ];
      for (const p of packages) await db.businessPackage.create({ data: p });
      console.log('  → Seeded ' + packages.length + ' packages');
    } else {
      console.log('  → Packages already populated (' + pkgCount + '), skipping');
    }

    // ---- Landing blocks (only seed missing keys — never overwrites) ----
    const blocks = [
      { section: 'hero', key: 'title_line1', value: 'همراه مالی' },
      { section: 'hero', key: 'title_line2', value: 'کسب‌وکار شما' },
      { section: 'hero', key: 'title_line3', value: 'از حساب تا رشد' },
      { section: 'hero', key: 'subtitle', value: 'موسسه حسابداری صحت محاسب، نماینده رسمی نرم‌افزار سپیدار و دشت؛ امنیت مالی، شفافیت و رشد واقعی.' },
      { section: 'hero', key: 'cta1', value: 'دریافت مشاوره رایگان' },
      { section: 'hero', key: 'cta2', value: 'مشاهده بسته‌ها' },
      { section: 'hero', key: 'badge', value: 'نماینده رسمی سطح ۱ سپیدار و دشت' },
      { section: 'hero', key: 'feature1', value: 'امنیت مالی' },
      { section: 'hero', key: 'feature2', value: 'کاهش ریسک مالیاتی' },
      { section: 'hero', key: 'feature3', value: 'گزارش‌های شفاف' },
      { section: 'hero', key: 'ministat1_value', value: '+۸۵۰' },
      { section: 'hero', key: 'ministat1_label', value: 'کسب‌وکار' },
      { section: 'hero', key: 'ministat2_value', value: '٪۹۸' },
      { section: 'hero', key: 'ministat2_label', value: 'رضایت' },
      { section: 'hero', key: 'ministat3_value', value: '+۱۲' },
      { section: 'hero', key: 'ministat3_label', value: 'سال تجربه' },
      { section: 'hero', key: 'ministat4_value', value: '+۳۰' },
      { section: 'hero', key: 'ministat4_label', value: 'متخصص' },
      { section: 'hero', key: 'dash_title', value: 'داشبورد مالی' },
      { section: 'hero', key: 'dash_subtitle', value: 'صحت محاسب' },
      { section: 'hero', key: 'dash_status', value: 'سالم' },
      { section: 'hero', key: 'dash_chart_label', value: 'صورت سود و زیان ۱۴۰۴' },
      { section: 'hero', key: 'dash_kpi1_label', value: 'درآمد' },
      { section: 'hero', key: 'dash_kpi1_value', value: '۲.۴B' },
      { section: 'hero', key: 'dash_kpi2_label', value: 'هزینه' },
      { section: 'hero', key: 'dash_kpi2_value', value: '۸۶۰M' },
      { section: 'hero', key: 'dash_kpi3_label', value: 'سود' },
      { section: 'hero', key: 'dash_kpi3_value', value: '۱.۵B' },
      { section: 'hero', key: 'dash_risk_label', value: 'ریسک مالیاتی' },
      { section: 'hero', key: 'dash_risk_value', value: 'کم' },
      { section: 'hero', key: 'dash_health', value: 'وضعیت مالی کسب‌وکار شما پایدار است' },
      { section: 'hero', key: 'card1_label', value: 'مالیات سالانه' },
      { section: 'hero', key: 'card1_value', value: '٪۴۰ کاهش' },
      { section: 'hero', key: 'card2_label', value: 'رشد سود' },
      { section: 'hero', key: 'card2_value', value: '+۱۸٪' },
      { section: 'hero', key: 'card3_label', value: 'مشاوره آنلاین' },
      { section: 'hero', key: 'card3_value', value: 'در حال پاسخ' },
      { section: 'hero', key: 'partner1_name', value: 'سپیدار' },
      { section: 'hero', key: 'partner1_sub', value: 'همکاران سیستم' },
      { section: 'hero', key: 'partner2_name', value: 'دشت' },
      { section: 'hero', key: 'partner2_sub', value: 'نرم‌افزار فروشگاهی' },
      { section: 'hero', key: 'partner3_name', value: 'همکاران سیستم' },
      { section: 'hero', key: 'partner3_sub', value: 'شریک رسمی' },
      { section: 'hero', key: 'partners_title', value: 'نمایندگی رسمی' },
      { section: 'hero', key: 'ai_teaser_title', value: 'دستیار هوشمند «صحت»' },
      { section: 'hero', key: 'ai_teaser_sub', value: 'ساختن پک اختصاصی با هوش مصنوعی' },
      { section: 'hero', key: 'scroll_hint', value: 'اسکرول کنید' },
      { section: 'stats', key: 'stat1_value', value: '+۱۲' },
      { section: 'stats', key: 'stat1_label', value: 'سال تجربه' },
      { section: 'stats', key: 'stat2_value', value: '+۸۵۰' },
      { section: 'stats', key: 'stat2_label', value: 'کسب‌وکار همراه' },
      { section: 'stats', key: 'stat3_value', value: '%۹۸' },
      { section: 'stats', key: 'stat3_label', value: 'رضایت مشتریان' },
      { section: 'stats', key: 'stat4_value', value: '+۳۰' },
      { section: 'stats', key: 'stat4_label', value: 'متخصص مالی' },
      { section: 'about', key: 'title', value: 'درباره موسسه صحت محاسب' },
      { section: 'about', key: 'eyebrow', value: 'چرا ما را انتخاب می‌کنند' },
      { section: 'about', key: 'body', value: 'موسسه ما با یک نیاز واقعی شکل گرفت؛ صاحبان کسب‌وکار درگیر پیچیدگی قوانین مالیاتی، دفاتر حسابداری نامنظم و گزارش‌های غیرقابل استناد بودند.' },
      { section: 'about', key: 'body2', value: 'امروز، موسسه ما به‌عنوان مجموعه‌ای شناخته می‌شود که به مشتریانش کمک می‌کند تصمیم‌های مالی دقیق بگیرند.' },
      { section: 'why', key: 'title', value: 'چرا صحت محاسب؟' },
      { section: 'process', key: 'title', value: 'مسیر همکاری با ما' },
      { section: 'cta', key: 'title', value: 'آماده‌اید کسب‌وکارتان را به مسیر درست بسپارید؟' },
      { section: 'cta', key: 'subtitle', value: 'همین حالا مشاوره رایگان بگیرید.' },
    ];
    let seededBlocks = 0;
    for (const b of blocks) {
      const ex = await db.landingBlock.findUnique({ where: { section_key: { section: b.section, key: b.key } } });
      if (!ex) { await db.landingBlock.create({ data: b }); seededBlocks++; }
    }
    console.log('  → Seeded ' + seededBlocks + ' landing blocks (of ' + blocks.length + ')');

    // ---- FAQs (only if empty) ----
    const faqCount = await db.faq.count();
    if (faqCount === 0) {
      const faqs = [
        { question: 'نرم‌افزار سپیدار برای چه کسب‌وکاری مناسب است؟', answer: 'سپیدار یک نرم‌افزار حسابداری شرکتی است.' },
        { question: 'تفاوت سپیدار و دشت چیست؟', answer: 'سپیدار برای حسابداری شرکتی و دشت برای فروشگاه‌ها.' },
        { question: 'آیا دوره‌های آموزشی مدرک دارند؟', answer: 'بله، پس از قبولی مدرک معتبر ارائه می‌شود.' },
        { question: 'مشاوره مالیاتی چگونه انجام می‌شود؟', answer: 'ابتدا وضعیت بررسی و سپس برنامه‌ریزی می‌شود.' },
        { question: 'پشتیبانی چقدر طول می‌کشد؟', answer: 'بسته به پلن از ۳ تا ۲۴ ماه.' },
      ];
      for (const f of faqs) { const ex = await db.faq.findFirst({ where: { question: f.question } }); if (!ex) await db.faq.create({ data: f }); }
      console.log('  → Seeded ' + faqs.length + ' FAQs');
    }

    // ---- Testimonials (only if empty) ----
    const tesCount = await db.testimonial.count();
    if (tesCount === 0) {
      const tes = [
        { name: 'علی رضایی', company: 'شرکت پارس', role: 'مدیرعامل', message: 'حساب‌هایمان شفاف شده.', rating: 5, order: 1 },
        { name: 'مریم کاظمی', company: 'فروشگاه آرمان', role: 'مالک', message: 'مدیریت چند شعبه راحت‌تر شد.', rating: 5, order: 2 },
        { name: 'حسین موسوی', company: 'تولیدی نگین', role: 'مدیر مالی', message: 'جریمه بزرگی حذف شد.', rating: 5, order: 3 },
      ];
      for (const t of tes) { const ex = await db.testimonial.findFirst({ where: { name: t.name } }); if (!ex) await db.testimonial.create({ data: t }); }
      console.log('  → Seeded ' + tes.length + ' testimonials');
    }

    console.log('✅ Seed complete (idempotent — admin edits preserved)');

    // ---- Migrate any old /articles nav-items → /blog (one-time) ----
    try {
      const oldNav = await db.navItem.findFirst({ where: { href: '/articles' } });
      if (oldNav) {
        await db.navItem.update({ where: { id: oldNav.id }, data: { href: '/blog' } });
        console.log('  → Migrated nav-item /articles → /blog');
      }
    } catch (e) {
      console.warn('  → nav-item migration skipped:', e.message);
    }

    // ---- Articles (only if table is empty) ----
    const artCount = await db.article.count();
    if (artCount === 0) {
      console.log('  → Seeding articles...');
      const now = new Date();
      const day = 24 * 60 * 60 * 1000;
      const articles = [
        {
          slug: 'sepidar-vs-dasht-comparison',
          title: 'سپیدار یا دشت؟ راهنمای انتخاب نرم‌افزار حسابداری مناسب کسب‌وکار شما',
          excerpt: 'در این مقاله تفاوت‌های نرم‌افزار سپیدار و دشت را بررسی می‌کنیم و به شما کمک می‌کنیم بهترین انتخاب را برای نوع کسب‌وکار خود داشته باشید.',
          content: '## مقدمه\n\nانتخاب نرم‌افزار حسابداری مناسب یکی از مهم‌ترین تصمیمات مالی هر کسب‌وکار است. دو محصول برجسته همکاران سیستم یعنی **سپیدار** و **دشت** هرکدام برای دسته خاصی از کسب‌وکارها طراحی شده‌اند.\n\n## سپیدار — حسابداری شرکتی\n\nسپیدار یک نرم‌افزار حسابداری جامع برای شرکت‌های خدماتی، تولیدی، تجاری و پیمانکاری است.\n\n## دشت — راهکار فروشگاهی\n\nدشت برای مدیریت فروشگاه‌های خرده‌فروشی و زنجیره‌ای طراحی شده است.\n\n## نتیجه‌گیری\n\nاگر شرکت خدماتی، تولیدی یا پیمانکاری دارید، **سپیدار** انتخاب بهتری است. اگر صاحب فروشگاه هستید، **دشت** دقیقاً برای شما طراحی شده است.',
          category: 'نرم‌افزار حسابداری',
          tags: 'سپیدار,دشت,نرم‌افزار حسابداری,همکاران سیستم',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: true,
          readingMinutes: 6,
          publishedAt: new Date(now.getTime() - 2 * day),
        },
        {
          slug: 'tax-optimization-1404-guide',
          title: 'راهنمای جامع بهینه‌سازی مالیاتی در سال ۱۴۰۴',
          excerpt: 'آخرین تغییرات قانون مالیاتی ۱۴۰۴، بخشنامه‌های جدید و راهکارهای قانونی کاهش بار مالیاتی را در این مقاله بررسی می‌کنیم.',
          content: '## تغییرات مهم مالیاتی سال ۱۴۰۴\n\nسال ۱۴۰۴ با تغییرات مهمی در قوانین مالیاتی همراه بوده است.\n\n## ۱. معافیت‌های مالیاتی جدید\n\n- معافیت سود حساب‌های پس‌انداز ویژه\n- کاهش نرخ مالیاتی کسب‌وکارهای دانش‌بنیان\n\n## ۲. ساماندهی صورت‌های مالی\n\nارائه صورت‌های مالی شفاف، شرط استفاده از معافیت‌ها است.\n\n## ۳. راهکارهای قانونی کاهش مالیات\n\n1. استفاده کامل از معافیت‌های سود سهام\n2. زمان‌بندی هوشمند خرید دارایی‌های مشمول استهلاک\n3. استفاده از کسورات مالیاتی پژوهش و توسعه\n\n## نتیجه‌گیری\n\nبهینه‌سازی مالیاتی یک فرآیند مداوم است.',
          category: 'مالیات',
          tags: 'مالیات,بهینه‌سازی مالیاتی,۱۴۰۴',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: true,
          readingMinutes: 8,
          publishedAt: new Date(now.getTime() - 9 * day),
        },
        {
          slug: 'financial-statements-101',
          title: 'صورت‌های مالی چیست و چرا برای کسب‌وکار شما حیاتی است؟',
          excerpt: 'ترازنامه، صورت سود و زیان و صورت جریان نقدینگی؛ سه گزارش اساسی که وضعیت مالی کسب‌وکار شما را نشان می‌دهند.',
          content: '## صورت‌های مالی چیست؟\n\nصورت‌های مالی گزارش‌های استانداردی هستند که تصویری کامل از وضعیت مالی ارائه می‌دهند.\n\n### ۱. ترازنامه\n\nترازنامه دارایی‌ها، بدهی‌ها و سرمایه را نشان می‌دهد.\n\n### ۲. صورت سود و زیان\n\nاین گزارش درآمد، هزینه و سود/زیان دوره را نشان می‌دهد.\n\n### ۳. صورت جریان نقدینگی\n\nجریان نقد ورودی و خروجی را نشان می‌دهد.\n\n## نتیجه‌گیری\n\nخوانش صورت‌های مالی مهارتی حیاتی برای هر مدیر مالی است.',
          category: 'حسابداری',
          tags: 'صورت‌های مالی,ترازنامه,سود و زیان',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: false,
          readingMinutes: 5,
          publishedAt: new Date(now.getTime() - 16 * day),
        },
        {
          slug: 'small-business-accounting-mistakes',
          title: '۷ اشتباه رایج حسابداری در کسب‌وکارهای کوچک',
          excerpt: 'از عدم تفکیک حساب‌های شخصی و تجاری تا دیررسیدن به سر موعد مالیاتی؛ این هفت اشتباه می‌توانند به کسب‌وکار شما آسیب جدی بزنند.',
          content: '## اشتباهات رایج حسابداری\n\n### ۱. عدم تفکیک حساب شخصی و تجاری\n\nمخلوط کردن هزینه‌های شخصی و تجاری چالش‌های مالیاتی ایجاد می‌کند.\n\n### ۲. دیرکرد در ثبت اسناد\n\nروزانه ثبت کنید.\n\n### ۳. نداشتن بودجه\n\nبدون بودجه نمی‌توان جریان نقد را مدیریت کرد.\n\n## نتیجه‌گیری\n\nبا سپردن حسابداری به تیمی حرفه‌ای، می‌توانید این اشتباهات را پشت سر بگذارید.',
          category: 'مدیریت مالی',
          tags: 'حسابداری,کسب‌وکار کوچک',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: false,
          readingMinutes: 5,
          publishedAt: new Date(now.getTime() - 25 * day),
        },
        {
          slug: 'payroll-management-best-practices',
          title: 'مدیریت حقوق و دستمزد: بهترین شیوه‌ها در سال ۱۴۰۴',
          excerpt: 'نحوه محاسبه حقوق، بیمه، مالیات حقوق و مدیریت فیش حقوقی کارکنان؛ راهنمای گام‌به‌گام.',
          content: '## اهمیت مدیریت حقوق و دستمزد\n\nمدیریت حقوق و دستمزد از حساس‌ترین فرآیندهای هر کسب‌وکار است.\n\n## مراحل مدیریت حقوق و دستمزد\n\n### ۱. ثبت اطلاعات اولیه کارکنان\n\n### ۲. محاسبه حقوق پایه و مزایا\n\n### ۳. کسر کسورات قانونی\n\n- بیمه تأمین اجتماعی\n- مالیات حقوق پلکانی\n\n### ۴. صدور فیش حقوقی و گزارش‌های ماهانه\n\n## نتیجه‌گیری\n\nمدیریت حقوق و دستمزد نیازمند دقت بالا و آشنایی با آخرین قوانین است.',
          category: 'حقوق و دستمزد',
          tags: 'حقوق و دستمزد,بیمه,مالیات حقوق',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: false,
          readingMinutes: 7,
          publishedAt: new Date(now.getTime() - 35 * day),
        },
        {
          slug: 'inventory-management-accounting',
          title: 'مدیریت انبار از نگاه حسابداری؛ از رسید تا کسر فاکتور',
          excerpt: 'ثبت دقیق ورود و خروج کالا، انبارگردانی و تطبیق با صورت‌های مالی.',
          content: '## حسابداری انبار\n\nانبار قلب تپنده بسیاری از کسب‌وکارهاست.\n\n## مراحل کلیدی حسابداری انبار\n\n### ۱. تعریف کالا با کد و بارکد\n\n### ۲. ثبت رسید و حواله\n\n### ۳. ارزش‌گذاری موجودی\n\nروش‌های رایج: FIFO، LIFO، میانگین وزنی\n\n### ۴. انبارگردانی دوره‌ای\n\n### ۵. تطبیق انبار با حسابداری\n\n## نتیجه‌گیری\n\nمدیریت صحیح انبار نیازمند سیستم دقیق و کار تیمی منسجم است.',
          category: 'حسابداری',
          tags: 'مدیریت انبار,حسابداری انبار,انبارگردانی',
          authorName: 'موسسه صحت محاسب',
          status: 'PUBLISHED',
          featured: false,
          readingMinutes: 6,
          publishedAt: new Date(now.getTime() - 48 * day),
        },
      ];
      for (const a of articles) { await db.article.create({ data: a }); }
      console.log('  → Seeded ' + articles.length + ' PUBLISHED articles');
    } else {
      console.log('  → Articles already populated (' + artCount + ' rows), skipping');
    }
  } catch (e) {
    console.error('❌ Seed FAILED:', e.message);
    console.error('   Container will NOT start.');
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
})();
