"use client";

import { useEffect, useState } from "react";
import type { RiskLevel } from "@/lib/api";

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  SAFE: "#22c55e",
  LOW: "#84cc16",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function RiskGauge({ score, riskLevel }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const color = RISK_COLORS[riskLevel];

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div
      className="relative flex flex-col items-center rounded-lg p-6"
      style={{
        border: "1px solid rgba(34,197,94,0.15)",
        backgroundColor: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(6px)",
        boxShadow: `0 20px 50px -15px ${color}33`,
      }}
    >
      <span
        className="mb-3 text-xs font-bold uppercase tracking-widest"
        style={{ color: "rgba(212,244,225,0.4)" }}
      >
        risk_score
      </span>
      <div className="relative">
        <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(34,197,94,0.1)"
            strokeWidth="12"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 8px ${color}aa)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold"
            style={{ color, fontFamily: "JetBrains Mono, monospace" }}
          >
            {animatedScore}
          </span>
          <span
            className="mt-1 text-xs tracking-widest"
            style={{ color: "rgba(212,244,225,0.4)" }}
          >
            / 100
          </span>
        </div>
      </div>
    </div>
  );
}