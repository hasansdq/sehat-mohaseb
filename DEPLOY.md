# استقرار صحت محاسب — Ubuntu 22.04 و DirectAdmin

## راه‌اندازی

نیازمند Docker Engine و پلاگین Docker Compose با پشتیبانی از `up --wait` هستید.
دامنه و گواهی SSL را در DirectAdmin تنظیم کنید. این پروژه پورت ۸۰ یا ۴۴۳ را نمی‌گیرد.

```bash
cd /opt/sehat-mohaseb
cp .env.docker.example .env.docker
openssl rand -base64 48
nano .env.docker
mkdir -p secrets
nano secrets/.z-ai-config
chmod 600 .env.docker
chmod 644 secrets/.z-ai-config
bash deploy.sh build
```

رشته تصادفی تولیدشده را در JWT_SECRET قرار دهید. ADMIN_PASSWORD باید رمز قوی اختصاصی با حداقل ۱۲ کاراکتر باشد. رمز مدیر فقط در اولین اجرا ساخته می‌شود؛ تغییر رمز بعدی از پنل انجام می‌شود.

فایل secrets/.z-ai-config یک JSON با مقادیر واقعی اتصال SDK است:

```json
{"baseUrl":"https://YOUR-AI-SERVICE/EXACT-API-BASE","apiKey":"YOUR-REAL-KEY"}
```

آدرس پایه دقیق سرویس را از ارائه‌دهنده دریافت کنید؛ SDK مسیر `/chat/completions` را به آن اضافه می‌کند. کلید محیط داخلی z.ai الزاماً خارج از آن محیط معتبر نیست. فایل باید برای UID 1001 داخل کانتینر قابل خواندن باشد. chmod 644 فایل را برای سایر کاربران محلی خواندنی می‌کند؛ در سرور اشتراکی به جای آن مالکیت/ACL مناسب UID 1001 و مجوز 640 تنظیم کنید.

## Reverse proxy در DirectAdmin با Apache

در تنظیمات سفارشی **VirtualHost مربوط به HTTPS دامنه**، فقط دستورات زیر را اضافه کنید؛ بلوک VirtualHost جدید نسازید:

```apache
ProxyPreserveHost On
ProxyRequests Off
ProxyPass /.well-known/acme-challenge/ !
ProxyPass / http://127.0.0.1:3001/
ProxyPassReverse / http://127.0.0.1:3001/
RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Port "443"
```

ماژول‌های proxy، proxy_http و headers باید در Apache فعال باشند. فعال‌سازی و بازسازی تنظیمات را مطابق CustomBuild همان سرور انجام دهید؛ دستور a2enmod برای همه نصب‌های DirectAdmin معتبر نیست. HTTPS اجباری را در DirectAdmin فعال کنید. مسیر ACME برای تمدید SSL باید محلی باقی بماند.

اگر وب‌سرور nginx یا nginx_apache است، فایل راهنمای nginx-directadmin-proxy.conf.example را ببینید؛ تنظیمات را در قالب مناسب دامنه اعمال کنید و location موجود را جایگزین کنید، نه اینکه location / تکراری بسازید.

## بررسی و نگهداری

```bash
curl -f http://127.0.0.1:3001/api/public/site
bash deploy.sh status
bash deploy.sh logs
bash deploy.sh backup
bash deploy.sh update
```

`update` فقط برای checkout گیت است. برای پروژه ZIP، فایل‌های کد جدید را جایگزین و `bash deploy.sh build` را اجرا کنید. فایل محیط، secrets و volumeها را حفظ کنید. در به‌روزرسانی هیچ‌وقت `docker compose down -v` اجرا نکنید.

SQLite، بکاپ و uploadها در volumeهای مستقل باقی می‌مانند. کد seed تغییرات موجود را بازنویسی نمی‌کند. اگر جدول محتوایی را کاملاً خالی کنید، seed در شروع بعدی داده اولیه آن جدول را دوباره می‌سازد.

هماهنگ‌سازی schema با `db push --skip-generate` انجام می‌شود و تغییر دارای خطر حذف داده کانتینر را متوقف می‌کند. پیش از تغییر schema بکاپ بگیرید و تغییرات بزرگ را با migration برنامه‌ریزی‌شده اعمال کنید؛ استقرار خودکار اجازه حذف داده ندارد.

برای بازیابی: برنامه را متوقف کنید، فایل SQLite بازیابی‌شده را روی volume دیتابیس قرار دهید، مالکیت UID/GID 1001 را حفظ کنید و بعد برنامه را بالا بیاورید. روی دیتابیس در حال استفاده فایل کپی نکنید.

ساخت و تست برنامه، CLI Prisma، schema، seed، بکاپ و HTTP در محیط بررسی انجام می‌شود؛ اجرای خود ایمیج Alpine روی Docker و اتصال واقعی AI باید روی VPS بررسی شود.
