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
      className="rounded-lg p-5 animate-fade-in"
      style={{
        border: "1px solid #1a2620",
        borderLeft: `3px solid ${accent}`,
        backgroundColor: "#0f1512",
        animationDelay: `${index * 100}ms`,
        boxShadow: `0 15px 40px -20px ${accent}55`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 text-xs tracking-widest"
            style={{ color: "rgba(212,244,225,0.25)" }}
          >
            [{tag}]
          </span>
          <h3
            className="text-base font-bold"
            style={{ color: "#d4f4e1" }}
          >
            {finding.title}
          </h3>
        </div>
        <span
          className="shrink-0 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
          style={{
            color: accent,
            backgroundColor: `${accent}1a`,
            border: `1px solid ${accent}33`,
          }}
        >
          {finding.risk_level}
        </span>
      </div>

      <p
        className="mb-4 text-sm leading-relaxed"
        style={{ color: "rgba(212,244,225,0.6)" }}
      >
        {finding.description}
      </p>

      <div
        className="rounded p-3"
        style={{
          border: "1px solid rgba(34,197,94,0.15)",
          backgroundColor: "rgba(34,197,94,0.04)",
        }}
      >
        <p
          className="mb-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: "#22c55e" }}
        >
          &gt; recommendation
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(212,244,225,0.7)" }}
        >
          {finding.recommendation}
        </p>
      </div>
    </div>
  );
}