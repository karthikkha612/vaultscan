import json
import re
from typing import List, Optional, Tuple

import requests

from models.scan_models import Finding

GITHUB_RAW_BASE = "https://raw.githubusercontent.com"
OSV_API_URL = "https://api.osv.dev/v1/query"
REQUEST_TIMEOUT = 30

# Fallback list used only when OSV API is unavailable
VULNERABLE_NPM = {
    "lodash": "4.17.21",
    "axios": "0.21.1",
    "express": "4.17.3",
}

VULNERABLE_PYTHON = {
    "requests": "2.20.0",
    "django": "3.2.0",
    "flask": "1.0",
}


def parse_github_url(repo_url: str) -> Optional[Tuple[str, str, str]]:
    """Extract owner, repo, and default branch hint from GitHub URL."""
    repo_url = repo_url.rstrip("/").replace(".git", "")
    match = re.search(r"github\.com/([^/]+)/([^/]+)(?:/tree/([^/]+))?", repo_url)
    if match:
        branch = match.group(3) or "main"
        return match.group(1), match.group(2), branch
    return None


def _parse_version(version_str: str) -> Tuple[int, ...]:
    cleaned = re.sub(r"[^0-9.]", "", version_str.split(",")[0].strip())
    parts = cleaned.split(".")
    result = []
    for part in parts[:3]:
        try:
            result.append(int(part))
        except ValueError:
            result.append(0)
    while len(result) < 3:
        result.append(0)
    return tuple(result)


def _is_vulnerable(current: str, minimum_safe: str) -> bool:
    return _parse_version(current) < _parse_version(minimum_safe)


def _fetch_raw_file(owner: str, repo: str, branch: str, path: str) -> Optional[str]:
    url = f"{GITHUB_RAW_BASE}/{owner}/{repo}/{branch}/{path}"
    try:
        response = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": "VaultScan/1.0 Security Scanner"},
        )
        if response.status_code == 200:
            return response.text
    except requests.exceptions.RequestException:
        pass
    return None


def _check_osv(package: str, version: str, ecosystem: str) -> Optional[dict]:
    """
    Query the OSV API for known vulnerabilities for a given package + version.
    Returns the first vulnerability found, or None if clean / API unavailable.
    Ecosystem is either 'npm' or 'PyPI'.
    """
    try:
        response = requests.post(
            OSV_API_URL,
            json={
                "package": {"name": package, "ecosystem": ecosystem},
                "version": version,
            },
            timeout=10,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code == 200:
            data = response.json()
            vulns = data.get("vulns", [])
            if vulns:
                return vulns[0]  # return the first/most relevant vuln
    except requests.exceptions.RequestException:
        pass
    return None


def _osv_finding(package: str, version: str, ecosystem: str) -> Optional[Finding]:
    """
    Check a single package via OSV API.
    Returns a Finding if vulnerable, None if clean or API unavailable.
    """
    vuln = _check_osv(package, version, ecosystem)
    if not vuln:
        return None

    # Extract useful info from the OSV response
    vuln_id = vuln.get("id", "UNKNOWN")
    summary = vuln.get("summary", "Known vulnerability detected.")

    # Try to get a fixed version from the affected ranges
    fixed_version = "latest"
    for affected in vuln.get("affected", []):
        for range_item in affected.get("ranges", []):
            for event in range_item.get("events", []):
                if "fixed" in event:
                    fixed_version = event["fixed"]
                    break

    return Finding(
        title=f"Vulnerable Dependency: {package} ({vuln_id})",
        description=(
            f"{package}@{version} is affected by {vuln_id}: {summary}"
        ),
        risk_level="HIGH",
        recommendation=f"Upgrade {package} to version {fixed_version} or later. "
                       f"See https://osv.dev/vulnerability/{vuln_id} for details.",
        points_deducted=10,
    )


def _fallback_finding(
    package: str, version: str, min_version: str, ecosystem: str
) -> Optional[Finding]:
    """
    Hardcoded fallback check used when OSV API is unavailable.
    """
    if not _is_vulnerable(version, min_version):
        return None

    sep = "@" if ecosystem == "npm" else "=="
    return Finding(
        title=f"Vulnerable Dependency: {package}",
        description=(
            f"{package}{sep}{version} has known vulnerabilities. "
            f"Minimum safe version: {min_version}."
        ),
        risk_level="HIGH",
        recommendation=f"Upgrade {package} to version {min_version} or later.",
        points_deducted=10,
    )


def _scan_package_json(content: str, use_osv: bool) -> List[Finding]:
    findings: List[Finding] = []

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return findings

    all_deps = {}
    all_deps.update(data.get("dependencies", {}))
    all_deps.update(data.get("devDependencies", {}))

    for package, raw_version in all_deps.items():
        version = raw_version.lstrip("^~>=< ")
        if not version:
            continue

        if use_osv:
            finding = _osv_finding(package, version, "npm")
        else:
            # fallback: only check packages in our known list
            if package not in VULNERABLE_NPM:
                continue
            finding = _fallback_finding(package, version, VULNERABLE_NPM[package], "npm")

        if finding:
            findings.append(finding)

    return findings


def _scan_requirements_txt(content: str, use_osv: bool) -> List[Finding]:
    findings: List[Finding] = []

    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        match = re.match(r"^([a-zA-Z0-9_-]+)\s*(?:==|>=|<=|~=|!=|<|>)?\s*([\d.]+)?", line)
        if not match:
            continue

        package = match.group(1).lower()
        version = match.group(2) or "0"

        if use_osv:
            finding = _osv_finding(package, version, "PyPI")
        else:
            if package not in VULNERABLE_PYTHON:
                continue
            finding = _fallback_finding(package, version, VULNERABLE_PYTHON[package], "PyPI")

        if finding:
            findings.append(finding)

    return findings


def _osv_available() -> bool:
    """Quick health check to see if OSV API is reachable."""
    try:
        response = requests.post(
            OSV_API_URL,
            json={"package": {"name": "requests", "ecosystem": "PyPI"}, "version": "2.0.0"},
            timeout=5,
        )
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def scan_dependencies(repo_url: str) -> List[Finding]:
    """
    Scan GitHub repository for vulnerable dependencies.
    Uses OSV API (Google's real CVE database) as primary source.
    Falls back to hardcoded list if OSV API is unavailable.
    """
    findings: List[Finding] = []

    parsed = parse_github_url(repo_url)
    if not parsed:
        findings.append(
            Finding(
                title="Invalid GitHub URL",
                description="Could not parse owner and repository from the provided URL.",
                risk_level="MEDIUM",
                recommendation="Provide a valid GitHub repository URL.",
                points_deducted=10,
            )
        )
        return findings

    owner, repo, branch = parsed

    # Check OSV availability once before scanning
    use_osv = _osv_available()

    branches_to_try = [branch, "main", "master"]
    seen = set()

    for try_branch in branches_to_try:
        if try_branch in seen:
            continue
        seen.add(try_branch)

        package_json = _fetch_raw_file(owner, repo, try_branch, "package.json")
        if package_json:
            findings.extend(_scan_package_json(package_json, use_osv))

        requirements = _fetch_raw_file(owner, repo, try_branch, "requirements.txt")
        if requirements:
            findings.extend(_scan_requirements_txt(requirements, use_osv))

        if package_json or requirements:
            break

    return findings