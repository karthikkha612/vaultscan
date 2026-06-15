"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ScanResponse } from "@/lib/api";
import { clearScanHistory, getScanHistory, setLatestScan } from "@/lib/api";

const RISK_COLORS: Record<string, string> = {
  SAFE: "#22c55e",
  LOW: "#84cc16",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScans(getScanHistory());
  }, []);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearScanHistory();
    setScans([]);
    setConfirmClear(false);
  };

  const handleViewScan = (scan: ScanResponse) => {
    setLatestScan(scan);
    router.push("/results");
  };

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleString(); }
    catch { return "Unknown"; }
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#0f0f0f" }}>
        <p style={{ color: "rgba(34,197,94,0.6)", fontSize: "11px", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .history-item {
          animation: fadeUp 0.4s ease forwards;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .history-item:hover {
          border-color: rgba(34,197,94,0.25) !important;
          background-color: rgba(34,197,94,0.03) !important;
        }
      `}</style>

      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          {/* Top label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", color: "rgba(34,197,94,0.4)", letterSpacing: "0.2em", fontFamily: "JetBrains Mono, monospace" }}>
              <span style={{ color: "#22c55e" }}>$</span> SCAN_HISTORY
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{
                fontSize: "28px", fontWeight: 700,
                color: "#e5e5e5", letterSpacing: "-0.02em",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: "6px",
              }}>
                SCAN_HISTORY
              </h1>
              <p style={{
                fontSize: "11px", color: "rgba(229,229,229,0.3)",
                fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em",
              }}>
                {scans.length} RECORD{scans.length !== 1 ? "S" : ""} STORED LOCALLY
              </p>
            </div>

            {scans.length > 0 && (
              <button
                onClick={handleClear}
                style={{
                  padding: "8px 16px",
                  border: confirmClear ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(239,68,68,0.2)",
                  backgroundColor: confirmClear ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.05)",
                  color: "#f87171",
                  fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.15em",
                  borderRadius: "2px",
                  fontFamily: "JetBrains Mono, monospace",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {confirmClear ? "[ CONFIRM_CLEAR? ]" : "[ CLEAR_HISTORY ]"}
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        {scans.length > 0 && (
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px", backgroundColor: "#1a1a1a",
              border: "1px solid #1a1a1a", borderRadius: "4px",
              marginBottom: "24px", overflow: "hidden",
            }}
          >
            {[
              { label: "TOTAL_SCANS", value: scans.length },
              { label: "AVG_SCORE", value: Math.round(scans.reduce((a, s) => a + s.overall_score, 0) / scans.length) },
              { label: "CRITICAL_FOUND", value: scans.filter(s => s.risk_level === "CRITICAL" || s.risk_level === "HIGH").length },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: "#0a0a0a", padding: "16px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "20px", fontWeight: 700,
                  color: "#22c55e", fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "4px",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "9px", color: "rgba(229,229,229,0.3)",
                  letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {scans.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
            <span style={{ fontSize: "9px", color: "rgba(229,229,229,0.2)", letterSpacing: "0.15em", fontFamily: "JetBrains Mono, monospace" }}>
              RECORDS
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#1a1a1a" }} />
          </div>
        )}

        {/* Empty state */}
        {scans.length === 0 ? (
          <div style={{
            border: "1px solid #1a1a1a",
            backgroundColor: "#0a0a0a",
            borderRadius: "4px", padding: "64px 32px",
            textAlign: "center",
          }}>
            <p style={{
              fontSize: "11px", color: "rgba(34,197,94,0.4)",
              letterSpacing: "0.2em", marginBottom: "8px",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              [ NO_RECORDS_FOUND ]
            </p>
            <p style={{
              fontSize: "12px", color: "rgba(229,229,229,0.3)",
              marginBottom: "24px", fontFamily: "Inter, sans-serif",
            }}>
              Run your first scan to see results here.
            </p>
            <Link
              href="/"
              style={{
                padding: "10px 20px",
                backgroundColor: "#22c55e",
                color: "#0a0a0a",
                fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.15em",
                borderRadius: "2px",
                fontFamily: "JetBrains Mono, monospace",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              [ START_SCANNING ]
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {scans.map((scan, index) => {
              const accent = RISK_COLORS[scan.risk_level] || RISK_COLORS.MEDIUM;
              return (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => handleViewScan(scan)}
                  style={{
                    border: "1px solid #1a1a1a",
                    borderLeft: `2px solid ${accent}`,
                    backgroundColor: "#0a0a0a",
                    borderRadius: "2px",
                    padding: "16px 20px",
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div>
                    {/* Index + URL */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "9px", color: "rgba(229,229,229,0.2)",
                        fontFamily: "JetBrains Mono, monospace",
                        flexShrink: 0,
                      }}>
                        [{String(index + 1).padStart(2, "0")}]
                      </span>
                      <span style={{
                        fontSize: "13px", fontWeight: 600,
                        color: "#d4f4e1",
                        fontFamily: "JetBrains Mono, monospace",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {scan.target.length > 50 ? scan.target.slice(0, 50) + "..." : scan.target}
                      </span>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        fontSize: "10px", color: "rgba(229,229,229,0.25)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}>
                        {formatDate(scan.scanned_at)}
                      </span>
                      <span style={{ color: "rgba(229,229,229,0.15)" }}>·</span>
                      <span style={{
                        fontSize: "10px", color: "rgba(229,229,229,0.25)",
                        fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em",
                      }}>
                        {scan.scan_type.toUpperCase()}_SCAN
                      </span>
                    </div>
                  </div>

                  {/* Right side - score + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{
                      fontSize: "18px", fontWeight: 700,
                      color: accent,
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {scan.overall_score}
                    </span>
                    <span style={{
                      fontSize: "9px", fontWeight: 700,
                      letterSpacing: "0.12em", padding: "3px 8px",
                      border: `1px solid ${accent}33`,
                      color: accent, backgroundColor: `${accent}15`,
                      borderRadius: "2px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}>
                      {scan.risk_level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "48px",
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #1a1a1a", paddingTop: "16px",
        }}>
          <Link
            href="/"
            style={{
              fontSize: "10px", color: "rgba(34,197,94,0.4)",
              letterSpacing: "0.1em", fontFamily: "JetBrains Mono, monospace",
              textDecoration: "none",
            }}
          >
            &lt; BACK_TO_SCANNER
          </Link>
          <span style={{ fontSize: "10px", color: "rgba(229,229,229,0.15)", letterSpacing: "0.1em", fontFamily: "JetBrains Mono, monospace" }}>
            VAULTSCAN // DEVLYNIX BUILDATHON 2.0
          </span>
        </div>
      </div>
    </>
  );
}