import asyncio
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


async def _run_scan_headers(url: str):
    """Run header scanner in a thread so it doesn't block the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, scan_headers, url)


async def _run_scan_xss(url: str):
    """Run XSS scanner in a thread so it doesn't block the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, scan_xss, url)


@router.post("/url", response_model=ScanResponse)
async def scan_url(request: ScanURLRequest):
    try:
        url = _validate_url(request.url)

        # Run both scanners concurrently instead of sequentially
        # This cuts scan time roughly in half since both make independent HTTP requests
        header_findings, xss_findings = await asyncio.gather(
            _run_scan_headers(url),
            _run_scan_xss(url),
        )

        findings = list(header_findings) + list(xss_findings)
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