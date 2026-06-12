from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
ScanType = Literal["url", "github"]


class ScanURLRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Target URL to scan")


class ScanGithubRequest(BaseModel):
    repo_url: str = Field(..., min_length=1, description="GitHub repository URL")


class Finding(BaseModel):
    title: str
    description: str
    risk_level: RiskLevel
    recommendation: str
    points_deducted: int = 0


class ScanResponse(BaseModel):
    target: str
    scan_type: ScanType
    overall_score: int
    risk_level: RiskLevel
    findings: List[Finding]
    scanned_at: datetime
