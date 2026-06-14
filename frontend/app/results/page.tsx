"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import FindingCard from "@/components/FindingCard";
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

  useEffect(() => {
    setMounted(true);
    const result = getLatestScan();
    if (!result) {
      router.push("/");
      return;
    }
    setScan(result);
  }, [router]);

  if (!mounted || !scan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#22c55e", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "Unknown date";
    }
  };

  const accent = RISK_COLORS[scan.risk_level] || RISK_COLORS.MEDIUM;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header / scan info card */}
      <div
        className="mb-8 grid gap-6 rounded-lg p-6 lg:grid-cols-[1fr_auto] lg:items-center"
        style={{
          border: "1px solid rgba(34,197,94,0.15)",
          backgroundColor: "rgba(255,255,255,0.015)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div>
          <p
            className="mb-1 text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(34,197,94,0.6)" }}
          >
            <span style={{ color: "#22c55e" }}>$</span> scan_results
          </p>
          <h1
            className="mb-2 break-all text-xl font-bold sm:text-2xl"
            style={{ color: "#d4f4e1" }}
          >
            {scan.target}
          </h1>
          <div
            className="flex flex-wrap items-center gap-3 text-xs"
            style={{ color: "rgba(212,244,225,0.45)" }}
          >
            <span>{formatDate(scan.scanned_at)}</span>
            <span style={{ color: "rgba(212,244,225,0.2)" }}>·</span>
            <span className="uppercase tracking-wide">{scan.scan_type}_scan</span>
            <span
              className="rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
              style={{
                color: accent,
                backgroundColor: `${accent}1a`,
                border: `1px solid ${accent}33`,
              }}
            >
              {scan.risk_level}
            </span>
          </div>
        </div>
        <RiskGauge score={scan.overall_score} riskLevel={scan.risk_level} />
      </div>

      {/* Findings */}
      <section className="mb-8">
        <h2
          className="mb-4 text-sm font-bold uppercase tracking-widest"
          style={{ color: "#22c55e" }}
        >
          <span style={{ color: "rgba(34,197,94,0.6)" }}>&gt;</span> findings ({scan.findings.length})
        </h2>
        {scan.findings.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              border: "1px solid rgba(34,197,94,0.15)",
              backgroundColor: "rgba(34,197,94,0.04)",
            }}
          >
            <p className="text-lg font-bold" style={{ color: "#22c55e" }}>
              [ NO VULNERABILITIES DETECTED ]
            </p>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgba(212,244,225,0.5)" }}
            >
              The scan completed without finding any security issues.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all"
          style={{
            backgroundColor: "#22c55e",
            color: "#0a0e0c",
            boxShadow: "0 10px 30px -10px rgba(34,197,94,0.5)",
          }}
        >
          [ scan_another ]
        </Link>
        <Link
          href="/history"
          className="rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all"
          style={{
            border: "1px solid rgba(34,197,94,0.25)",
            backgroundColor: "rgba(34,197,94,0.04)",
            color: "#d4f4e1",
          }}
        >
          [ view_history ]
        </Link>
      </div>
    </div>
  );
}