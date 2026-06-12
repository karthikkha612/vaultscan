"use client";

import { useState } from "react";
import { isValidUrl } from "@/lib/api";

interface ScanInputProps {
  onScan: (input: string) => void;
  isLoading: boolean;
}

export default function ScanInput({ onScan, isLoading }: ScanInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!input.trim()) {
      setError("Please enter a URL or GitHub repository link");
      return;
    }

    if (!isValidUrl(input)) {
      setError("Invalid URL format. Enter a valid website URL or GitHub repo link.");
      return;
    }

    onScan(input.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter URL or GitHub repo link..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-border bg-panel px-5 py-4 text-text placeholder:text-text/40 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-accent px-8 py-4 font-semibold text-charcoal transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[140px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Scanning
            </span>
          ) : (
            "Scan Now"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400 animate-fade-in">{error}</p>
      )}
    </form>
  );
}
