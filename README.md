# AI Diagnosis System - Railway Deploy Guide

Bu loyiha uchun backend `FastAPI` qilib deployga tayyorlandi.

## Nimalar tayyorlandi

- `backend/app/main.py` - to'liq API:
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
- `backend/requirements.txt` - kerakli paketlar qo'shildi.
- `backend/.env.example` - env namuna.
- `Dockerfile` (root) - Railway rootdan to'g'ridan-to'g'ri backendni ko'taradi.
- `backend/Dockerfile` - backend alohida deploy uchun ham tayyor.

Default admin:

- Email: `admin@medai.uz`
- Parol: `admin123`

## Railway ga qo'yish

1. Repository ni GitHub ga push qiling.
2. Railway da **New Project -> Deploy from GitHub repo** ni tanlang.
3. Repo tanlang, Railway avtomatik rootdagi `Dockerfile` bilan build qiladi.
4. `Variables` bo'limida quyidagilarni kiriting:
   - `JWT_SECRET=uzun-maxfiy-kalit`
   - `ACCESS_TOKEN_EXPIRE_HOURS=24`
   - `CORS_ORIGINS=*` (yoki frontend domainingiz)
5. Deploy tugagach URL olasiz, masalan:
   - `https://your-api.up.railway.app`

Health check:

- `GET https://your-api.up.railway.app/health`

## Frontend ulash

Frontend deploy qilingan joyda env kiriting:

- `VITE_API_URL=https://your-api.up.railway.app/api/v1`
- `VITE_DEMO=false`

Shundan keyin frontend backendga ulanadi.
# ai_diagnosis_system
