"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HistoryList from "@/components/HistoryList";
import type { ScanResponse } from "@/lib/api";
import { clearScanHistory, getScanHistory } from "@/lib/api";

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setScans(getScanHistory());
  }, []);

  const handleClear = () => {
    clearScanHistory();
    setScans([]);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Scan History</h1>
          <p className="mt-1 text-sm text-text/60">
            {scans.length} scan{scans.length !== 1 ? "s" : ""} stored locally
          </p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Clear History
          </button>
        )}
      </div>

      {scans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-12 text-center">
          <p className="mb-2 text-4xl">📋</p>
          <h2 className="mb-2 text-xl font-semibold text-text">
            No scans yet
          </h2>
          <p className="mb-6 text-sm text-text/60">
            Run your first vulnerability scan to see results here.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-charcoal transition-all hover:bg-accent/90"
          >
            Start Scanning
          </Link>
        </div>
      ) : (
        <HistoryList scans={scans} />
      )}
    </div>
  );
}
