# AI Diagnosis System

Frontend Netlify uchun, backend Render uchun tayyorlangan.

## Backend endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/diagnosis/analyze`
- `GET /api/v1/history`
- `POST /api/v1/history`
- `DELETE /api/v1/history/{id}`
- `GET /api/v1/history/stats`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}/role`
- `DELETE /api/v1/admin/users/{id}`
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/diagnoses`

## Render ga backend deploy

### Variant A (eng oson)
Repo ichida `render.yaml` bor. Render Blueprint ishlatsangiz avtomatik sozlanadi.

1. Render -> **New +** -> **Blueprint**
2. GitHub repo ni tanlang
3. `render.yaml` dagi service yaratiladi
4. `ADMIN_EMAIL` va `ADMIN_PASSWORD` ni Render dashboardda qo'lda kiriting
5. Deploy qiling

### Variant B (qo'lda Web Service)

1. Render -> **New +** -> **Web Service**
2. Repo ni tanlang
3. Sozlamalar:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment variables kiriting:
   - `APP_NAME=AI Diagnosis API`
   - `JWT_SECRET=<juda-uzun-maxfiy-kalit>`
   - `ACCESS_TOKEN_EXPIRE_HOURS=24`
   - `DATABASE_URL=sqlite:///./medai.db` (demo uchun)
   - `CORS_ORIGINS=https://<your-netlify-site>.netlify.app`
   - `ADMIN_FULL_NAME=<ismingiz>`
   - `ADMIN_EMAIL=<admin-email>`
   - `ADMIN_PASSWORD=<admin-parol>`
5. Health check: `/health`

## Netlify frontend env

Netlify -> Site settings -> Environment variables:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`
- `VITE_DEMO=false`

Keyin Netlify’da **Redeploy** qiling.

## Muhim eslatma

- `CORS_ORIGINS` ni productionda `*` qilmang, Netlify domeningizni yozing.
- `JWT_SECRET` va `ADMIN_PASSWORD` kuchli bo'lsin.
- Agar Render free plan ishlatsangiz, birinchi so'rovda backend "uyqudan uyg'onishi" mumkin.
