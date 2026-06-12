from typing import List
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import requests

from models.scan_models import Finding

XSS_PAYLOADS = [
    "<script>alert(1)</script>",
    '"><img src=x onerror=alert(1)>',
]

REQUEST_TIMEOUT = 30


def _inject_payload(url: str, payload: str) -> str:
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query, keep_blank_values=True)
    query_params["vaultscan"] = [payload]
    new_query = urlencode(query_params, doseq=True)
    return urlunparse(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        )
    )


def scan_xss(url: str) -> List[Finding]:
    """Test for reflected XSS vulnerabilities via URL parameters."""
    findings: List[Finding] = []

    for payload in XSS_PAYLOADS:
        test_url = _inject_payload(url, payload)

        try:
            response = requests.get(
                test_url,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True,
                headers={"User-Agent": "VaultScan/1.0 Security Scanner"},
            )
        except requests.exceptions.RequestException:
            continue

        if payload in response.text:
            findings.append(
                Finding(
                    title="Reflected XSS Vulnerability",
                    description=(
                        f"A potentially malicious payload was reflected in the response body: "
                        f"{payload[:50]}..."
                    ),
                    risk_level="CRITICAL",
                    recommendation=(
                        "Sanitize and encode all user input before rendering. "
                        "Implement Content-Security-Policy and validate output encoding."
                    ),
                    points_deducted=30,
                )
            )
            break

    return findings
