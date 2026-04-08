from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, auth, diagnosis, history
from app.core.config import settings
from app.core.database import init_db
from app.services.auth_service import ensure_admin_user

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False if "*" in settings.cors_origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    ensure_admin_user()


@app.get("/")
def root():
    return {"status": "ok", "service": settings.app_name}


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
app.include_router(history.router, prefix="/api/v1/history", tags=["history"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
