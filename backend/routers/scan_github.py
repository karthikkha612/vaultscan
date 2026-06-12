import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from models.scan_models import ScanResponse, ScanGithubRequest
from scanners.dependency_scanner import scan_dependencies
from scanners.secret_scanner import scan_secrets
from utils.risk_engine import calculate_risk

router = APIRouter(prefix="/api/scan", tags=["GitHub Scan"])


def _validate_github_url(repo_url: str) -> str:
    repo_url = repo_url.strip()
    if not repo_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")

    if not re.search(r"github\.com/[^/]+/[^/]+", repo_url):
        raise HTTPException(
            status_code=422,
            detail="Invalid GitHub repository URL. Expected format: https://github.com/owner/repo",
        )

    return repo_url


@router.post("/github", response_model=ScanResponse)
async def scan_github(request: ScanGithubRequest):
    try:
        repo_url = _validate_github_url(request.repo_url)

        findings = []
        findings.extend(scan_dependencies(repo_url))
        findings.extend(scan_secrets(repo_url))

        overall_score, risk_level = calculate_risk(findings)

        return ScanResponse(
            target=repo_url,
            scan_type="github",
            overall_score=overall_score,
            risk_level=risk_level,
            findings=findings,
            scanned_at=datetime.now(timezone.utc),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(exc)}")
