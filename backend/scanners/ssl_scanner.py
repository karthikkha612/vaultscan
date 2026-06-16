import ssl
import socket
from datetime import datetime, timezone
from typing import List
from urllib.parse import urlparse

from models.scan_models import Finding

REQUEST_TIMEOUT = 10
EXPIRY_WARNING_DAYS = 30


def _get_cert(hostname: str, port: int = 443) -> dict | None:
    """Fetch SSL certificate from the host."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=REQUEST_TIMEOUT) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                return ssock.getpeercert()
    except ssl.CertificateError:
        return None
    except Exception:
        return None


def _get_cert_unverified(hostname: str, port: int = 443) -> dict | None:
    """Fetch SSL certificate without verifying — used to inspect expired/mismatched certs."""
    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        with socket.create_connection((hostname, port), timeout=REQUEST_TIMEOUT) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                return ssock.getpeercert(binary_form=False)
    except Exception:
        return None


def scan_ssl(url: str) -> List[Finding]:
    """
    Scan SSL/TLS certificate for:
    - Expired certificate (CRITICAL)
    - Certificate expiring within 30 days (MEDIUM)
    - Hostname mismatch (HIGH)
    - No SSL at all (CRITICAL)
    """
    findings: List[Finding] = []

    parsed = urlparse(url)
    hostname = parsed.hostname

    # Not HTTPS — already caught by header_scanner but flag here too for completeness
    if parsed.scheme != "https":
        return findings  # header_scanner already flags this as CRITICAL

    if not hostname:
        return findings

    port = parsed.port or 443

    # Try verified connection first
    cert = _get_cert(hostname, port)

    if cert is None:
        # Verified connection failed — try unverified to inspect the cert
        cert_unverified = _get_cert_unverified(hostname, port)

        if cert_unverified is None:
            # Can't connect at all on SSL
            findings.append(Finding(
                title="SSL Certificate Missing or Unreachable",
                description=f"Could not establish an SSL/TLS connection to {hostname}. "
                            f"The server may not support HTTPS or the certificate is invalid.",
                risk_level="CRITICAL",
                recommendation="Ensure the server has a valid SSL/TLS certificate installed. "
                               "Use a trusted CA like Let's Encrypt (free) to issue one.",
                points_deducted=30,
            ))
            return findings

        # We got a cert but verified connection failed — likely expired or hostname mismatch
        # Check expiry
        not_after = cert_unverified.get("notAfter")
        if not_after:
            try:
                expiry = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                if expiry < now:
                    days_expired = (now - expiry).days
                    findings.append(Finding(
                        title="SSL Certificate Expired",
                        description=f"The SSL certificate for {hostname} expired {days_expired} day(s) ago "
                                    f"(expired on {expiry.strftime('%Y-%m-%d')}). "
                                    f"Browsers will show security warnings to all visitors.",
                        risk_level="CRITICAL",
                        recommendation="Renew the SSL certificate immediately. "
                                       "Use Let's Encrypt for a free, auto-renewing certificate. "
                                       "Consider setting up auto-renewal to prevent future expiry.",
                        points_deducted=30,
                    ))
            except ValueError:
                pass

        # Check hostname mismatch
        subject = cert_unverified.get("subject", ())
        san = cert_unverified.get("subjectAltName", ())
        cert_hostnames = [v for _, v in san if _ == "DNS"]
        if not cert_hostnames:
            for field in subject:
                for k, v in field:
                    if k == "commonName":
                        cert_hostnames.append(v)

        hostname_matched = any(
            hostname == ch or (ch.startswith("*.") and hostname.endswith(ch[1:]))
            for ch in cert_hostnames
        )

        if not hostname_matched and cert_hostnames:
            findings.append(Finding(
                title="SSL Certificate Hostname Mismatch",
                description=f"The SSL certificate is issued for {', '.join(cert_hostnames[:3])} "
                            f"but the request is for {hostname}. "
                            f"This can indicate a misconfiguration or a man-in-the-middle attack.",
                risk_level="HIGH",
                recommendation="Ensure the SSL certificate is issued for the correct domain. "
                               "If using a CDN or reverse proxy, make sure the certificate covers "
                               "all hostnames being served.",
                points_deducted=20,
            ))

        return findings

    # Verified connection succeeded — check expiry from valid cert
    not_after = cert.get("notAfter")
    if not_after:
        try:
            expiry = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_remaining = (expiry - now).days

            if days_remaining < 0:
                # Shouldn't happen if verified connection succeeded, but guard anyway
                findings.append(Finding(
                    title="SSL Certificate Expired",
                    description=f"The SSL certificate for {hostname} has expired.",
                    risk_level="CRITICAL",
                    recommendation="Renew the SSL certificate immediately using Let's Encrypt or your CA.",
                    points_deducted=30,
                ))
            elif days_remaining <= EXPIRY_WARNING_DAYS:
                findings.append(Finding(
                    title=f"SSL Certificate Expiring Soon ({days_remaining} days)",
                    description=f"The SSL certificate for {hostname} expires on "
                                f"{expiry.strftime('%Y-%m-%d')} — in {days_remaining} day(s). "
                                f"After expiry, browsers will block visitors with security warnings.",
                    risk_level="MEDIUM",
                    recommendation="Renew the SSL certificate before it expires. "
                                   "If using Let's Encrypt, enable auto-renewal with certbot. "
                                   "Most CAs send reminder emails — check your inbox.",
                    points_deducted=10,
                ))
            # else: cert is valid and not expiring soon — no finding needed

        except ValueError:
            pass

    return findings