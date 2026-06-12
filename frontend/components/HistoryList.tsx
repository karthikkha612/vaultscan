"use client";

import { useRouter } from "next/navigation";
import type { ScanResponse } from "@/lib/api";
import { setLatestScan } from "@/lib/api";

interface HistoryListProps {
  scans: ScanResponse[];
}

const BADGE_COLORS: Record<string, string> = {
  SAFE: "bg-accent/20 text-accent",
  LOW: "bg-lime-500/20 text-lime-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  CRITICAL: "bg-red-500/20 text-red-400",
};

export default function HistoryList({ scans }: HistoryListProps) {
  const router = useRouter();

  const handleClick = (scan: ScanResponse) => {
    setLatestScan(scan);
    router.push("/results");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="grid gap-3">
      {scans.map((scan, index) => (
        <button
          key={`${scan.target}-${scan.scanned_at}-${index}`}
          onClick={() => handleClick(scan)}
          className="group flex w-full items-center justify-between rounded-xl border border-border bg-panel p-4 text-left transition-all hover:border-accent/50 hover:bg-panel/80"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text group-hover:text-accent">
              {scan.target}
            </p>
            <p className="mt-1 text-xs text-text/50">
              {formatDate(scan.scanned_at)} · {scan.scan_type.toUpperCase()} scan
            </p>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-text">{scan.overall_score}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                BADGE_COLORS[scan.risk_level] || BADGE_COLORS.MEDIUM
              }`}
            >
              {scan.risk_level}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
