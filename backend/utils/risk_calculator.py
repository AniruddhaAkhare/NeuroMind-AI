"""
Utility to calculate patient risk level based on model prediction probabilities
and clinical heuristics.
"""

def calculate_risk(probabilities: dict) -> dict:
    """
    Given the model's class probabilities, determine the risk level
    and a normalized risk score (0.0 to 1.0).

    Classes:
        NonDemented
        VeryMildDemented
        MildDemented
        ModerateDemented
    """
    
    # Weight the probabilities to compute an overall risk score
    # 0 = No risk, 1 = Highest risk
    score = (
        probabilities.get("NonDemented", 0) * 0.0 +
        probabilities.get("VeryMildDemented", 0) * 0.33 +
        probabilities.get("MildDemented", 0) * 0.66 +
        probabilities.get("ModerateDemented", 0) * 1.0
    )

    if score >= 0.75:
        level = "CRITICAL"
        recommendation = "Immediate neurological consultation recommended. High probability of moderate dementia."
    elif score >= 0.45:
        level = "HIGH"
        recommendation = "Schedule follow-up within 2 weeks. Mild dementia indicators present."
    elif score >= 0.20:
        level = "MODERATE"
        recommendation = "Monitor cognitive function. Schedule follow-up in 3-6 months. Very mild indicators detected."
    else:
        level = "LOW"
        recommendation = "No immediate action required. Routine annual checkup recommended."

    return {
        "score": round(score, 4),
        "level": level,
        "recommendation": recommendation
    }
