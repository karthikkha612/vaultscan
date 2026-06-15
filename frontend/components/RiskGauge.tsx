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

  const radius = 70;
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
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div style={{
      border: "1px solid rgba(34,197,94,0.12)",
      backgroundColor: "#0a0a0a",
      borderRadius: "4px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "180px",
    }}>
      {/* Label */}
      <span style={{
        fontSize: "9px", letterSpacing: "0.2em",
        color: "rgba(212,244,225,0.3)", marginBottom: "12px",
        fontFamily: "JetBrains Mono, monospace",
      }}>
        RISK_SCORE
      </span>

      {/* Gauge */}
      <div style={{ position: "relative" }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="rgba(34,197,94,0.06)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.1s ease",
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
          {/* Corner tick marks */}
          {[0, 25, 50, 75].map((pct) => {
            const angle = (pct / 100) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 80 + (radius - 10) * Math.cos(rad);
            const y1 = 80 + (radius - 10) * Math.sin(rad);
            const x2 = 80 + (radius + 2) * Math.cos(rad);
            const y2 = 80 + (radius + 2) * Math.sin(rad);
            return (
              <line
                key={pct}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(34,197,94,0.2)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Score in center */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: "36px", fontWeight: 700,
            color: color, lineHeight: 1,
            fontFamily: "JetBrains Mono, monospace",
            filter: `drop-shadow(0 0 8px ${color}66)`,
          }}>
            {animatedScore}
          </span>
          <span style={{
            fontSize: "10px", color: "rgba(212,244,225,0.3)",
            letterSpacing: "0.1em", marginTop: "4px",
            fontFamily: "JetBrains Mono, monospace",
          }}>
            / 100
          </span>
        </div>
      </div>

      {/* Risk level label */}
      <div style={{
        marginTop: "12px",
        fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.15em",
        color: color,
        border: `1px solid ${color}33`,
        backgroundColor: `${color}10`,
        padding: "4px 12px",
        borderRadius: "2px",
        fontFamily: "JetBrains Mono, monospace",
      }}>
        {riskLevel}
      </div>
    </div>
  );
}