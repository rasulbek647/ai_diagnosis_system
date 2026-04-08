from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AnalyzeIn(BaseModel):
    symptoms: list[str]


class DiagnosisResultOut(BaseModel):
    id: int
    name: str
    probability: float
    description: str
    recommendations: list[str]


class AnalyzeOut(BaseModel):
    results: list[DiagnosisResultOut]


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
