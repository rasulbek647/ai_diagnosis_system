from app.ml.model import run_rule_based_diagnosis


def analyze_symptoms(symptoms: list[str]) -> list[dict]:
    return run_rule_based_diagnosis(symptoms)
    