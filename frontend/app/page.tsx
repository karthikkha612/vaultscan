"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScanInput from "@/components/ScanInput";
import LoadingScanner from "@/components/LoadingScanner";
import {
  isGithubUrl,
  saveScanResult,
  scanGithub,
  scanURL,
} from "@/lib/api";

const FEATURE_CARDS = [
  {
    title: "Security Headers",
    description:
      "Checks for missing CSP, HSTS, X-Frame-Options, and other critical HTTP security headers.",
    icon: "🛡️",
  },
  {
    title: "Dependencies",
    description:
      "Scans package.json and requirements.txt for known vulnerable package versions.",
    icon: "📦",
  },
  {
    title: "XSS & Secrets",
    description:
      "Tests for reflected XSS payloads and detects exposed API keys, tokens, and credentials.",
    icon: "🔍",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (input: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = isGithubUrl(input)
        ? await scanGithub(input)
        : await scanURL(input);

      saveScanResult(result);
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingScanner />}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-accent sm:text-6xl">
            VaultScan
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-text/70">
            Scan any website or GitHub repo for vulnerabilities
          </p>

          <div className="flex flex-col items-center">
            <ScanInput onScan={handleScan} isLoading={isLoading} />
            {error && (
              <div className="mt-4 max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-border bg-panel p-6 transition-colors hover:border-accent/30"
            >
              <span className="mb-4 block text-3xl">{card.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-text">
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed text-text/60">
                {card.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
