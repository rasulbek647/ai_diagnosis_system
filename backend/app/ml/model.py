from app.ml.symptoms_data import DISEASE_RULES


def run_rule_based_diagnosis(symptoms: list[str]) -> list[dict]:
    normalized = [symptom.lower().strip() for symptom in symptoms if symptom.strip()]
    if not normalized:
        return []

    scored: list[dict] = []
    for idx, disease in enumerate(DISEASE_RULES, start=1):
        keywords = disease["keywords"]
        matches = sum(
            1 for kw in keywords if any((kw in symptom) or (symptom in kw) for symptom in normalized)
        )
        ratio = matches / max(len(keywords), 1)
        probability = min(0.95, round(ratio * 0.88 + min(len(normalized), 8) * 0.01, 2))
        scored.append(
            {
                "id": idx,
                "name": disease["name"],
                "probability": probability,
                "description": disease["description"],
                "recommendations": disease["recommendations"],
            }
        )

    scored.sort(key=lambda item: item["probability"], reverse=True)
    return scored[:4]
