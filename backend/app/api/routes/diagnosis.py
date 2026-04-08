from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.diagnosis import AnalyzeIn, AnalyzeOut
from app.services.diagnosis_service import analyze_symptoms

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeOut)
def analyze(payload: AnalyzeIn, _: User = Depends(get_current_user)):
    if not payload.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms are required")
    return AnalyzeOut(results=analyze_symptoms(payload.symptoms))
