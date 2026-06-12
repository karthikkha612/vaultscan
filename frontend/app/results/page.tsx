"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import FindingCard from "@/components/FindingCard";
import type { ScanResponse } from "@/lib/api";
import { getLatestScan } from "@/lib/api";

const BADGE_COLORS: Record<string, string> = {
  SAFE: "bg-accent/20 text-accent border-accent/30",
  LOW: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="mb-1 text-sm uppercase tracking-wide text-text/50">
            Scan Results
          </p>
          <h1 className="mb-2 break-all text-2xl font-bold text-text sm:text-3xl">
            {scan.target}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text/60">
            <span>{formatDate(scan.scanned_at)}</span>
            <span>·</span>
            <span className="capitalize">{scan.scan_type} scan</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                BADGE_COLORS[scan.risk_level] || BADGE_COLORS.MEDIUM
              }`}
            >
              {scan.risk_level}
            </span>
          </div>
        </div>
        <RiskGauge score={scan.overall_score} riskLevel={scan.risk_level} />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-text">
          Findings ({scan.findings.length})
        </h2>
        {scan.findings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-panel p-8 text-center">
            <p className="text-lg font-medium text-accent">
              No vulnerabilities detected
            </p>
            <p className="mt-2 text-sm text-text/60">
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

      <div className="flex flex-wrap gap-4">
        <Link
          href="/"
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-charcoal transition-all hover:bg-accent/90"
        >
          Scan Another
        </Link>
        <Link
          href="/history"
          className="rounded-xl border border-border bg-panel px-6 py-3 font-semibold text-text transition-all hover:border-accent/50 hover:text-accent"
        >
          View History
        </Link>
      </div>
    </div>
  );
}
