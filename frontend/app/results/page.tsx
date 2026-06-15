"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import FindingCard from "@/components/FindingCard";
import MatrixRain from "@/components/MatrixRain";
import type { ScanResponse } from "@/lib/api";
import { getLatestScan } from "@/lib/api";

const RISK_COLORS: Record<string, string> = {
  SAFE: "#22c55e",
  LOW: "#84cc16",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function ResultsPage() {
  const router = useRouter();
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const result = getLatestScan();
    if (!result) {
      router.push("/");
      return;
    }
    setScan(result);

    const handleMouse = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [router]);

  if (!mounted || !scan) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#0f0f0f" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", border: "1px solid #22c55e",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "rgba(34,197,94,0.6)", fontSize: "11px", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
            LOADING_RESULTS...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleString(); }
    catch { return "Unknown date"; }
  };

  const accent = RISK_COLORS[scan.risk_level] || RISK_COLORS.MEDIUM;

  const criticalCount = scan.findings.filter(f => f.risk_level === "CRITICAL").length;
  const highCount = scan.findings.filter(f => f.risk_level === "HIGH").length;
  const mediumCount = scan.findings.filter(f => f.risk_level === "MEDIUM").length;
  const lowCount = scan.findings.filter(f => f.risk_level === "LOW").length;

  return (
    <>
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Grid + spotlight + corner accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `translate(${mouse.x * 4}px, ${mouse.y * 4}px)`,
          transition: "transform 0.6s ease-out",
        }} />
        {/* Spotlight */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(700px circle at ${50 + mouse.x * 20}% ${50 + mouse.y * 20}%, rgba(34,197,94,0.06), transparent 65%)`,
          transition: "background 0.4s ease-out",
        }} />
        {/* Scanline overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(34,197,94,0.025) 0px, rgba(34,197,94,0.025) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay",
        }} />
        {/* Corner accents */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: "200px", height: "200px",
          borderTop: "1px solid rgba(34,197,94,0.15)",
          borderLeft: "1px solid rgba(34,197,94,0.15)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: "200px", height: "200px",
          borderBottom: "1px solid rgba(34,197,94,0.15)",
          borderRight: "1px solid rgba(34,197,94,0.15)",
        }} />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-card {
          animation: fadeUp 0.5s ease forwards;
        }
      `}</style>

      <div className="relative mx-auto max-w-6xl px-6 py-12" style={{ zIndex: 2 }}>

        {/* Top label */}
        <div className="flex items-center gap-3 mb-8">
          <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
          <span style={{ fontSize: "10px", color: "rgba(34,197,94,0.4)", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace" }}>
            SCAN_COMPLETE
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
        </div>

        {/* Header card */}
        <div
          className="result-card mb-6 rounded"
          style={{
            border: "1px solid rgba(34,197,94,0.12)",
            backgroundColor: "rgba(10,10,10,0.8)",
            backdropFilter: "blur(10px)",
            padding: "24px",
          }}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              {/* Label */}
              <p style={{
                fontSize: "10px", letterSpacing: "0.2em",
                color: "rgba(34,197,94,0.5)", marginBottom: "8px",
                fontFamily: "JetBrains Mono, monospace",
              }}>
                <span style={{ color: "#22c55e" }}>$</span> SCAN_RESULTS
              </p>

              {/* Target URL */}
              <h1 style={{
                fontSize: "clamp(14px, 2vw, 20px)",
                fontWeight: 700,
                color: "#d4f4e1",
                wordBreak: "break-all",
                marginBottom: "12px",
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 1.4,
              }}>
                {scan.target.length > 60 ? scan.target.slice(0, 60) + "..." : scan.target}
              </h1>

              {/* Meta */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "11px", color: "rgba(212,244,225,0.35)", fontFamily: "JetBrains Mono, monospace" }}>
                  {formatDate(scan.scanned_at)}
                </span>
                <span style={{ color: "rgba(212,244,225,0.15)" }}>·</span>
                <span style={{ fontSize: "11px", color: "rgba(212,244,225,0.35)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
                  {scan.scan_type.toUpperCase()}_SCAN
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.15em", padding: "3px 10px",
                  borderRadius: "2px", border: `1px solid ${accent}33`,
                  color: accent, backgroundColor: `${accent}15`,
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                  {scan.risk_level}
                </span>
              </div>

              {/* Finding counts */}
              {scan.findings.length > 0 && (
                <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
                  {criticalCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#ef4444", fontFamily: "JetBrains Mono, monospace" }}>
                      CRITICAL: {criticalCount}
                    </span>
                  )}
                  {highCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#f97316", fontFamily: "JetBrains Mono, monospace" }}>
                      HIGH: {highCount}
                    </span>
                  )}
                  {mediumCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#eab308", fontFamily: "JetBrains Mono, monospace" }}>
                      MEDIUM: {mediumCount}
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span style={{ fontSize: "11px", color: "#84cc16", fontFamily: "JetBrains Mono, monospace" }}>
                      LOW: {lowCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Gauge */}
            <RiskGauge score={scan.overall_score} riskLevel={scan.risk_level} />
          </div>
        </div>

        {/* Findings */}
        <section className="mb-8">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <h2 style={{
              fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.2em", color: "#22c55e",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              <span style={{ color: "rgba(34,197,94,0.5)" }}>&gt;</span> FINDINGS ({scan.findings.length})
            </h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
          </div>

          {scan.findings.length === 0 ? (
            <div style={{
              border: "1px solid rgba(34,197,94,0.12)",
              backgroundColor: "rgba(34,197,94,0.03)",
              borderRadius: "4px", padding: "48px",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: "14px", fontWeight: 700,
                color: "#22c55e", letterSpacing: "0.1em",
                fontFamily: "JetBrains Mono, monospace",
              }}>
                [ NO_VULNERABILITIES_DETECTED ]
              </p>
              <p style={{
                marginTop: "8px", fontSize: "12px",
                color: "rgba(212,244,225,0.4)",
                fontFamily: "Inter, sans-serif",
              }}>
                The scan completed without finding any security issues.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {scan.findings.map((finding, index) => (
                <FindingCard
                  key={`${finding.title}-${index}`}
                  finding={finding}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "32px" }}>
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              backgroundColor: "#22c55e",
              color: "#0a0a0a",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              borderRadius: "2px",
              fontFamily: "JetBrains Mono, monospace",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            [ SCAN_ANOTHER ]
          </Link>
          <Link
            href="/history"
            style={{
              padding: "12px 24px",
              border: "1px solid rgba(34,197,94,0.2)",
              backgroundColor: "rgba(34,197,94,0.04)",
              color: "#d4f4e1",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              borderRadius: "2px",
              fontFamily: "JetBrains Mono, monospace",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            [ VIEW_HISTORY ]
          </Link>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "48px",
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #1a1a1a", paddingTop: "16px",
        }}>
          <span style={{ fontSize: "10px", color: "rgba(229,229,229,0.2)", letterSpacing: "0.1em", fontFamily: "JetBrains Mono, monospace" }}>
            VAULTSCAN // DEVLYNIX BUILDATHON 2.0
          </span>
          <span style={{ fontSize: "10px", color: "rgba(34,197,94,0.3)", letterSpacing: "0.1em", fontFamily: "JetBrains Mono, monospace" }}>
            TRACK_02 // CYBERSECURITY
          </span>
        </div>
      </div>
    </>
  );
}