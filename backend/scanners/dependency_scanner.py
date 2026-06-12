import json
import re
from typing import List, Optional, Tuple

import requests

from models.scan_models import Finding

GITHUB_RAW_BASE = "https://raw.githubusercontent.com"
REQUEST_TIMEOUT = 30

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


def _scan_package_json(content: str) -> List[Finding]:
    findings: List[Finding] = []

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return findings

    all_deps = {}
    all_deps.update(data.get("dependencies", {}))
    all_deps.update(data.get("devDependencies", {}))

    for package, min_version in VULNERABLE_NPM.items():
        if package in all_deps:
            version = all_deps[package].lstrip("^~>=< ")
            if _is_vulnerable(version, min_version):
                findings.append(
                    Finding(
                        title=f"Vulnerable Dependency: {package}",
                        description=(
                            f"{package}@{version} has known vulnerabilities. "
                            f"Minimum safe version: {min_version}."
                        ),
                        risk_level="HIGH",
                        recommendation=f"Upgrade {package} to version {min_version} or later.",
                        points_deducted=10,
                    )
                )

    return findings


def _scan_requirements_txt(content: str) -> List[Finding]:
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

        if package in VULNERABLE_PYTHON:
            min_version = VULNERABLE_PYTHON[package]
            if _is_vulnerable(version, min_version):
                findings.append(
                    Finding(
                        title=f"Vulnerable Dependency: {package}",
                        description=(
                            f"{package}=={version} has known vulnerabilities. "
                            f"Minimum safe version: {min_version}."
                        ),
                        risk_level="HIGH",
                        recommendation=f"Upgrade {package} to version {min_version} or later.",
                        points_deducted=10,
                    )
                )

    return findings


def scan_dependencies(repo_url: str) -> List[Finding]:
    """Scan GitHub repository for vulnerable dependencies."""
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

    branches_to_try = [branch, "main", "master"]
    seen = set()

    for try_branch in branches_to_try:
        if try_branch in seen:
            continue
        seen.add(try_branch)

        package_json = _fetch_raw_file(owner, repo, try_branch, "package.json")
        if package_json:
            findings.extend(_scan_package_json(package_json))

        requirements = _fetch_raw_file(owner, repo, try_branch, "requirements.txt")
        if requirements:
            findings.extend(_scan_requirements_txt(requirements))

        if package_json or requirements:
            break

    return findings
