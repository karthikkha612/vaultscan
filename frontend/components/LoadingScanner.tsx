"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Checking security headers...",
  "Testing XSS vulnerabilities...",
  "Scanning dependencies...",
  "Analyzing secrets exposure...",
];

export default function LoadingScanner() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? prev : prev + Math.random() * 8));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-panel p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <svg
            className="h-16 w-16 animate-spin-slow text-accent"
            viewBox="0 0 50 50"
            fill="none"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80 40"
              className="opacity-30"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80 40"
              strokeDashoffset="60"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-text">
          Scanning Target
        </h2>
        <p className="mb-6 h-6 text-sm text-accent transition-all duration-500">
          {MESSAGES[messageIndex]}
        </p>

        <div className="h-2 overflow-hidden rounded-full bg-charcoal">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-text/40">
          This may take up to 30 seconds
        </p>
      </div>
    </div>
  );
}
