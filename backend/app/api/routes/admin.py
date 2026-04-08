import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.core.database import get_db
from app.models.diagnosis import DiagnosisHistory
from app.models.user import User
from app.schemas.user import UserOut, UserRoleUpdateIn

router = APIRouter()


@router.get("/users", response_model=list[UserOut])
def users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/role")
def change_role(
    user_id: int,
    payload: UserRoleUpdateIn,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if payload.role not in {"admin", "user"}:
        raise HTTPException(status_code=400, detail="Role must be admin or user")
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.role = payload.role
    db.commit()
    return {"message": "updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    return {"message": "deleted"}


@router.get("/stats")
def stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_diagnoses = db.query(func.count(DiagnosisHistory.id)).scalar() or 0
    active_today = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0

    first_probs: list[float] = []
    rows = db.query(DiagnosisHistory.results).all()
    for (results,) in rows:
        if isinstance(results, str):
            try:
                results = json.loads(results)
            except json.JSONDecodeError:
                results = []
        if isinstance(results, list) and results:
            try:
                first_probs.append(float(results[0].get("probability", 0)))
            except (TypeError, ValueError):
                pass

    avg_probability = (sum(first_probs) / len(first_probs)) if first_probs else 0.0
    return {
        "total_users": int(total_users),
        "active_today": int(active_today),
        "total_diagnoses": int(total_diagnoses),
        "avg_probability": round(avg_probability, 2),
    }


@router.get("/diagnoses")
def diagnoses(
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(DiagnosisHistory, User).join(User, User.id == DiagnosisHistory.user_id)
    rows = query.order_by(DiagnosisHistory.created_at.desc()).offset(offset).limit(limit).all()
    items = [
        {
            "id": history.id,
            "user_name": user.full_name,
            "user_email": user.email,
            "created_at": history.created_at,
            "top_diagnosis": history.top_diagnosis,
            "symptoms": history.symptoms,
            "results": history.results,
        }
        for history, user in rows
    ]
    return {"items": items, "total": query.count()}
