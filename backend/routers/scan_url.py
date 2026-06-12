from datetime import datetime, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException

from models.scan_models import ScanResponse, ScanURLRequest
from scanners.header_scanner import scan_headers
from scanners.xss_scanner import scan_xss
from utils.risk_engine import calculate_risk

router = APIRouter(prefix="/api/scan", tags=["URL Scan"])


def _validate_url(url: str) -> str:
    url = url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    if not parsed.netloc:
        raise HTTPException(status_code=422, detail="Invalid URL format")

    return url


@router.post("/url", response_model=ScanResponse)
async def scan_url(request: ScanURLRequest):
    try:
        url = _validate_url(request.url)

        findings = []
        findings.extend(scan_headers(url))
        findings.extend(scan_xss(url))

        overall_score, risk_level = calculate_risk(findings)

        return ScanResponse(
            target=url,
            scan_type="url",
            overall_score=overall_score,
            risk_level=risk_level,
            findings=findings,
            scanned_at=datetime.now(timezone.utc),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(exc)}")
