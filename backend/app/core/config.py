import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "AI Diagnosis API"
    jwt_secret: str = "please-change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_hours: int = 24
    database_url: str = "sqlite:///./medai.db"
    cors_origins: list[str] = ["*"]
    admin_email: str = ""
    admin_password: str = ""
    admin_full_name: str = "System Admin"


def _load_settings() -> Settings:
    cors_raw = os.getenv("CORS_ORIGINS", "*")
    cors = [item.strip() for item in cors_raw.split(",") if item.strip()]
    return Settings(
        app_name=os.getenv("APP_NAME", "AI Diagnosis API"),
        jwt_secret=os.getenv("JWT_SECRET", "please-change-this-secret"),
        access_token_expire_hours=int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24")),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./medai.db"),
        cors_origins=cors or ["*"],
        admin_email=os.getenv("ADMIN_EMAIL", "").strip().lower(),
        admin_password=os.getenv("ADMIN_PASSWORD", "").strip(),
        admin_full_name=os.getenv("ADMIN_FULL_NAME", "System Admin").strip() or "System Admin",
    )


settings = _load_settings()
