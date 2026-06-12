from typing import List, Tuple

from models.scan_models import Finding, RiskLevel


def calculate_risk(findings: List[Finding]) -> Tuple[int, RiskLevel]:
    """Calculate overall score and risk level from findings."""
    score = 100

    for finding in findings:
        score -= finding.points_deducted

    score = max(0, min(100, score))

    if score >= 80:
        risk_level: RiskLevel = "SAFE"
    elif score >= 60:
        risk_level = "LOW"
    elif score >= 40:
        risk_level = "MEDIUM"
    elif score >= 20:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return score, risk_level
