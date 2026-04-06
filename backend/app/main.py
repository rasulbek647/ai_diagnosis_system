from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker


# -----------------------------
# Config
# -----------------------------
APP_NAME = os.getenv("APP_NAME", "AI Diagnosis API")
JWT_SECRET = os.getenv("JWT_SECRET", "please-change-this-secret")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medai.db")

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [o.strip() for o in cors_origins_env.split(",") if o.strip()]


# -----------------------------
# Database
# -----------------------------
class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    histories: Mapped[list["History"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class History(Base):
    __tablename__ = "history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    symptoms: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    results: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    top_diagnosis: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    user: Mapped[User] = relationship(back_populates="histories")


connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Security helpers
# -----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


# -----------------------------
# Schemas
# -----------------------------
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime


class AuthLoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthRegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


class AnalyzeIn(BaseModel):
    symptoms: list[str]


class HistoryCreateIn(BaseModel):
    symptoms: list[str]
    results: list[dict[str, Any]]
    top_diagnosis: str | None = None


class HistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    symptoms: list[str]
    results: list[dict[str, Any]]
    top_diagnosis: str
    created_at: datetime


class PagedHistory(BaseModel):
    items: list[HistoryOut]
    total: int


# -----------------------------
# Diagnosis logic
# -----------------------------
def _disease_rules() -> list[dict[str, Any]]:
    return [
        {
            "name": "ARVI (Tez-tez shamollash)",
            "description": "Yuqori nafas yo'llarining virusli kasalligi.",
            "recommendations": ["Ko'proq suyuqlik iching", "Dam oling", "Zarur bo'lsa shifokorga boring"],
            "keywords": ["yotal", "yo'tal", "cough", "isitma", "fever", "burun", "runny nose", "tomoq"],
        },
        {
            "name": "Gripp (Influenza)",
            "description": "Influenza virusi chaqirgan o'tkir kasallik.",
            "recommendations": ["Ko'proq dam oling", "Shifokor tavsiyasi bilan dori qabul qiling"],
            "keywords": ["isitma", "fever", "charchoq", "fatigue", "bosh ogrigi", "headache"],
        },
        {
            "name": "Migren",
            "description": "Kuchli bosh og'riq bilan kechadigan holat.",
            "recommendations": ["Tinch joyda dam oling", "Yorug'lik va shovqinni kamaytiring"],
            "keywords": ["bosh ogrigi", "headache", "koz ogrigi", "dizziness"],
        },
        {
            "name": "Gastrit",
            "description": "Oshqozon shilliq qavatining yallig'lanishi.",
            "recommendations": ["Yog'li va achchiq taomdan saqlaning", "Ovqatlanish tartibini yaxshilang"],
            "keywords": ["qorin ogrigi", "stomach", "nausea", "kongil aynishi", "vomiting"],
        },
    ]


def run_simple_diagnosis(symptoms: list[str]) -> list[dict[str, Any]]:
    lower = [s.lower().strip() for s in symptoms if s.strip()]
    if not lower:
        return []

    scored = []
    rules = _disease_rules()
    for idx, disease in enumerate(rules, start=1):
        keywords = disease["keywords"]
        matches = sum(
            1
            for kw in keywords
            if any(kw in symptom or symptom in kw for symptom in lower)
        )
        base = matches / max(len(keywords), 1)
        # Small deterministic boost by symptom count.
        prob = min(0.95, round(base * 0.88 + min(len(lower), 8) * 0.01, 2))
        scored.append(
            {
                "id": idx,
                "name": disease["name"],
                "probability": prob,
                "description": disease["description"],
                "recommendations": disease["recommendations"],
            }
        )

    scored.sort(key=lambda item: item["probability"], reverse=True)
    return scored[:4]


# -----------------------------
# App
# -----------------------------
app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in CORS_ORIGINS else CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    # Create default admin for first launch.
    db = SessionLocal()
    try:
        exists = db.query(User).filter(User.email == "admin@medai.uz").first()
        if not exists:
            admin = User(
                full_name="System Admin",
                email="admin@medai.uz",
                password_hash=hash_password("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "service": APP_NAME}


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/v1/auth/register", response_model=AuthResponse)
def register(payload: AuthRegisterIn, db: Session = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role="user",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.role)
    return AuthResponse(access_token=token, user=user)


@app.post("/api/v1/auth/login", response_model=AuthResponse)
def login(payload: AuthLoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    token = create_access_token(user.id, user.role)
    return AuthResponse(access_token=token, user=user)


@app.get("/api/v1/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.post("/api/v1/diagnosis/analyze")
def analyze(payload: AnalyzeIn, _: User = Depends(get_current_user)):
    if not payload.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms are required")
    results = run_simple_diagnosis(payload.symptoms)
    return {"results": results}


@app.post("/api/v1/history")
def create_history(payload: HistoryCreateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = History(
        user_id=user.id,
        symptoms=payload.symptoms,
        results=payload.results,
        top_diagnosis=(payload.top_diagnosis or (payload.results[0]["name"] if payload.results else "")),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "message": "saved"}


@app.get("/api/v1/history", response_model=PagedHistory)
def list_history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(History).filter(History.user_id == user.id)
    total = q.count()
    items = q.order_by(History.created_at.desc()).offset(offset).limit(limit).all()
    return PagedHistory(items=items, total=total)


@app.delete("/api/v1/history/{history_id}")
def delete_history(history_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(History).filter(History.id == history_id, History.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    db.delete(item)
    db.commit()
    return {"message": "deleted"}


@app.get("/api/v1/history/stats")
def history_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_items = db.query(History).filter(History.user_id == user.id).all()
    total = len(all_items)
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)
    this_week = 0
    for item in all_items:
        created = item.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created >= week_start:
            this_week += 1

    counter: dict[str, int] = {}
    for item in all_items:
        if item.top_diagnosis:
            counter[item.top_diagnosis] = counter.get(item.top_diagnosis, 0) + 1
    top_disease = max(counter, key=counter.get) if counter else "—"
    return {"total": total, "this_week": this_week, "top_disease": top_disease}


@app.get("/api/v1/admin/users", response_model=list[UserOut])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@app.patch("/api/v1/admin/users/{user_id}/role")
def admin_change_role(
    user_id: int,
    payload: dict[str, str],
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    role = payload.get("role")
    if role not in {"admin", "user"}:
        raise HTTPException(status_code=400, detail="Role must be admin or user")
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.role = role
    db.commit()
    return {"message": "updated"}


@app.delete("/api/v1/admin/users/{user_id}")
def admin_delete_user(user_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    return {"message": "deleted"}


@app.get("/api/v1/admin/stats")
def admin_stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_diagnoses = db.query(func.count(History.id)).scalar() or 0
    active_today = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0

    first_probs: list[float] = []
    rows = db.query(History.results).all()
    for (res,) in rows:
        if isinstance(res, str):
            try:
                res = json.loads(res)
            except json.JSONDecodeError:
                res = []
        if isinstance(res, list) and res:
            p = res[0].get("probability", 0)
            try:
                first_probs.append(float(p))
            except (TypeError, ValueError):
                pass
    avg_probability = (sum(first_probs) / len(first_probs)) if first_probs else 0.0

    return {
        "total_users": int(total_users),
        "active_today": int(active_today),
        "total_diagnoses": int(total_diagnoses),
        "avg_probability": round(avg_probability, 2),
    }


@app.get("/api/v1/admin/diagnoses")
def admin_diagnoses(
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    q = db.query(History, User).join(User, User.id == History.user_id)
    total = q.count()
    rows = q.order_by(History.created_at.desc()).offset(offset).limit(limit).all()
    items = [
        {
            "id": h.id,
            "user_name": u.full_name,
            "user_email": u.email,
            "created_at": h.created_at,
            "top_diagnosis": h.top_diagnosis,
            "symptoms": h.symptoms,
            "results": h.results,
        }
        for h, u in rows
    ]
    return {"items": items, "total": total}
