import type { Finding } from "@/lib/api";

interface FindingCardProps {
  finding: Finding;
  index?: number;
}

const ACCENT_COLORS: Record<string, string> = {
  SAFE: "#22c55e",
  LOW: "#84cc16",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
  const accent = ACCENT_COLORS[finding.risk_level] || ACCENT_COLORS.MEDIUM;
  const tag = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        border: "1px solid #1a1a1a",
        borderLeft: `2px solid ${accent}`,
        backgroundColor: "#0a0a0a",
        borderRadius: "4px",
        padding: "20px",
        animation: `fadeUp 0.5s ease forwards`,
        animationDelay: `${index * 80}ms`,
        opacity: 0,
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{
            fontSize: "10px", color: "rgba(229,229,229,0.2)",
            fontFamily: "JetBrains Mono, monospace",
            marginTop: "2px", flexShrink: 0,
          }}>
            [{tag}]
          </span>
          <h3 style={{
            fontSize: "13px", fontWeight: 700,
            color: "#d4f4e1",
            fontFamily: "JetBrains Mono, monospace",
            lineHeight: 1.4,
          }}>
            {finding.title}
          </h3>
        </div>
        <span style={{
          fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.12em", padding: "3px 8px",
          border: `1px solid ${accent}33`,
          color: accent, backgroundColor: `${accent}15`,
          borderRadius: "2px", flexShrink: 0,
          fontFamily: "JetBrains Mono, monospace",
        }}>
          {finding.risk_level}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: "12px", lineHeight: "1.6",
        color: "rgba(212,244,225,0.5)",
        marginBottom: "14px",
        fontFamily: "Inter, sans-serif",
      }}>
        {finding.description}
      </p>

      {/* Recommendation */}
      <div style={{
        border: "1px solid rgba(34,197,94,0.1)",
        backgroundColor: "rgba(34,197,94,0.03)",
        borderRadius: "2px", padding: "12px",
      }}>
        <p style={{
          fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.15em", color: "#22c55e",
          marginBottom: "6px",
          fontFamily: "JetBrains Mono, monospace",
        }}>
          &gt; RECOMMENDATION
        </p>
        <p style={{
          fontSize: "12px", lineHeight: "1.6",
          color: "rgba(212,244,225,0.6)",
          fontFamily: "Inter, sans-serif",
        }}>
          {finding.recommendation}
        </p>
      </div>
    </div>
  );
}