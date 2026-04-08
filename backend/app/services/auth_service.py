from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.access_token_expire_hours)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def ensure_admin_user() -> None:
    # If admin credentials are not provided, skip auto admin creation.
    if not settings.admin_email or not settings.admin_password:
        return

    db = SessionLocal()
    try:
        existing = get_user_by_email(db, settings.admin_email)
        if existing:
            if existing.role != "admin":
                existing.role = "admin"
                db.commit()
            return

        admin = User(
            full_name=settings.admin_full_name,
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()


def parse_token_user_id(token: str) -> int:
    try:
        payload = decode_access_token(token)
        return int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise ValueError("Invalid token")
