import os
import re
from typing import List, Optional, Tuple

import requests

from models.scan_models import Finding

GITHUB_API_BASE = "https://api.github.com"
REQUEST_TIMEOUT = 30

SECRET_PATTERNS = [
    (r"(?i)(api[_-]?key|secret[_-]?key|password|token|private[_-]?key)\s*[:=]\s*['\"]?[\w\-]{8,}", "Hardcoded credential keyword"),
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"(?i)aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*['\"]?[\w/+=]{40}", "AWS Secret Access Key"),
    (r"(?i)[0-9a-f]{32,64}", "Generic hex secret"),
]

SCAN_FILES = [
    ".env",
    ".env.example",
    "config.py",
    "settings.py",
    "secrets.json",
    "credentials.json",
    "app.config",
    "docker-compose.yml",
    "README.md",
]


def _get_github_headers() -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "VaultScan/1.0 Security Scanner",
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def parse_github_url(repo_url: str) -> Optional[Tuple[str, str]]:
    """Extract owner and repo name from a GitHub URL."""
    repo_url = repo_url.rstrip("/")
    repo_url = repo_url.replace(".git", "")

    patterns = [
        r"github\.com/([^/]+)/([^/]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, repo_url)
        if match:
            return match.group(1), match.group(2)

    return None


def _fetch_file_content(owner: str, repo: str, path: str) -> Optional[str]:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    try:
        response = requests.get(url, headers=_get_github_headers(), timeout=REQUEST_TIMEOUT)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and data.get("encoding") == "base64":
            import base64

            return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
    except requests.exceptions.RequestException:
        return None
    return None


def _scan_content(content: str, filename: str) -> List[Finding]:
    findings: List[Finding] = []

    for pattern, label in SECRET_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            findings.append(
                Finding(
                    title=f"Potential Secret in {filename}",
                    description=f"Detected {label} pattern in {filename}. Found {len(matches)} match(es).",
                    risk_level="CRITICAL",
                    recommendation=(
                        "Remove secrets from source code immediately. "
                        "Rotate compromised credentials and use environment variables or a secrets manager."
                    ),
                    points_deducted=35,
                )
            )
            break

    return findings


def scan_secrets(repo_url: str) -> List[Finding]:
    """Scan GitHub repository files for exposed secrets."""
    findings: List[Finding] = []

    parsed = parse_github_url(repo_url)
    if not parsed:
        findings.append(
            Finding(
                title="Invalid GitHub URL",
                description="Could not parse owner and repository from the provided URL.",
                risk_level="MEDIUM",
                recommendation="Provide a valid GitHub repository URL (e.g., https://github.com/owner/repo).",
                points_deducted=10,
            )
        )
        return findings

    owner, repo = parsed

    for filename in SCAN_FILES:
        content = _fetch_file_content(owner, repo, filename)
        if content:
            findings.extend(_scan_content(content, filename))

    return findings
