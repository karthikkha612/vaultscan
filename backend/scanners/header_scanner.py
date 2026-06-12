from typing import List
from urllib.parse import urlparse

import requests

from models.scan_models import Finding

HEADER_CHECKS = [
    {
        "header": "Content-Security-Policy",
        "risk_level": "HIGH",
        "points": 15,
        "recommendation": "Add a Content-Security-Policy header to restrict resource loading and mitigate XSS attacks.",
    },
    {
        "header": "Strict-Transport-Security",
        "risk_level": "HIGH",
        "points": 15,
        "recommendation": "Add Strict-Transport-Security (HSTS) to enforce HTTPS connections.",
    },
    {
        "header": "X-Frame-Options",
        "risk_level": "MEDIUM",
        "points": 10,
        "recommendation": "Add X-Frame-Options or frame-ancestors in CSP to prevent clickjacking.",
    },
    {
        "header": "X-Content-Type-Options",
        "risk_level": "MEDIUM",
        "points": 10,
        "recommendation": "Add X-Content-Type-Options: nosniff to prevent MIME-type sniffing.",
    },
    {
        "header": "Referrer-Policy",
        "risk_level": "LOW",
        "points": 5,
        "recommendation": "Add Referrer-Policy to control how much referrer information is sent.",
    },
    {
        "header": "Permissions-Policy",
        "risk_level": "LOW",
        "points": 5,
        "recommendation": "Add Permissions-Policy to restrict browser feature access.",
    },
]

REQUEST_TIMEOUT = 30


def _normalize_headers(response: requests.Response) -> dict:
    return {key.lower(): value for key, value in response.headers.items()}


def scan_headers(url: str) -> List[Finding]:
    """Scan HTTP response headers for security misconfigurations."""
    findings: List[Finding] = []

    parsed = urlparse(url)
    if parsed.scheme != "https":
        findings.append(
            Finding(
                title="No HTTPS",
                description="The target URL does not use HTTPS, exposing traffic to interception.",
                risk_level="CRITICAL",
                recommendation="Enable HTTPS with a valid TLS certificate and redirect HTTP to HTTPS.",
                points_deducted=25,
            )
        )

    try:
        response = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
            headers={"User-Agent": "VaultScan/1.0 Security Scanner"},
        )
    except requests.exceptions.Timeout:
        findings.append(
            Finding(
                title="Target Unreachable",
                description="The target URL did not respond within the timeout period.",
                risk_level="MEDIUM",
                recommendation="Verify the URL is correct and the server is online.",
                points_deducted=10,
            )
        )
        return findings
    except requests.exceptions.RequestException as exc:
        findings.append(
            Finding(
                title="Target Unreachable",
                description=f"Could not connect to the target URL: {str(exc)}",
                risk_level="MEDIUM",
                recommendation="Verify the URL is correct and the server is online.",
                points_deducted=10,
            )
        )
        return findings

    normalized = _normalize_headers(response)

    for check in HEADER_CHECKS:
        header_key = check["header"].lower()
        if header_key not in normalized:
            findings.append(
                Finding(
                    title=f"Missing {check['header']}",
                    description=f"The {check['header']} security header is not present in the response.",
                    risk_level=check["risk_level"],
                    recommendation=check["recommendation"],
                    points_deducted=check["points"],
                )
            )

    return findings
