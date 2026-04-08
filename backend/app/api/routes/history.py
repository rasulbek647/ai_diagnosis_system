from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.diagnosis import DiagnosisHistory
from app.models.user import User
from app.schemas.diagnosis import HistoryCreateIn, PagedHistory

router = APIRouter()


@router.post("")
def create_history(
    payload: HistoryCreateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = DiagnosisHistory(
        user_id=user.id,
        symptoms=payload.symptoms,
        results=payload.results,
        top_diagnosis=(payload.top_diagnosis or (payload.results[0]["name"] if payload.results else "")),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "message": "saved"}


@router.get("", response_model=PagedHistory)
def list_history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(DiagnosisHistory).filter(DiagnosisHistory.user_id == user.id)
    return PagedHistory(
        items=query.order_by(DiagnosisHistory.created_at.desc()).offset(offset).limit(limit).all(),
        total=query.count(),
    )


@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.id == history_id,
        DiagnosisHistory.user_id == user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    db.delete(item)
    db.commit()
    return {"message": "deleted"}


@router.get("/stats")
def history_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_items = db.query(DiagnosisHistory).filter(DiagnosisHistory.user_id == user.id).all()
    week_start = datetime.now(timezone.utc) - timedelta(days=7)

    this_week = 0
    for item in all_items:
        created_at = item.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if created_at >= week_start:
            this_week += 1

    top_counter: dict[str, int] = {}
    for item in all_items:
        if item.top_diagnosis:
            top_counter[item.top_diagnosis] = top_counter.get(item.top_diagnosis, 0) + 1

    return {
        "total": len(all_items),
        "this_week": this_week,
        "top_disease": max(top_counter, key=top_counter.get) if top_counter else "—",
    }
