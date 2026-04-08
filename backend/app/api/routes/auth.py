from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import AuthLoginIn, AuthRegisterIn, AuthResponse, UserOut
from app.services.auth_service import create_access_token, get_user_by_email, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(payload: AuthRegisterIn, db: Session = Depends(get_db)):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if get_user_by_email(db, payload.email):
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
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthLoginIn, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    return AuthResponse(access_token=create_access_token(user.id, user.role), user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
