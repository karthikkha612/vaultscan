import type { Finding } from "@/lib/api";

interface FindingCardProps {
  finding: Finding;
  index?: number;
}

const BORDER_COLORS: Record<string, string> = {
  SAFE: "border-l-accent",
  LOW: "border-l-lime-500",
  MEDIUM: "border-l-yellow-500",
  HIGH: "border-l-orange-500",
  CRITICAL: "border-l-red-500",
};

const BADGE_COLORS: Record<string, string> = {
  SAFE: "bg-accent/20 text-accent",
  LOW: "bg-lime-500/20 text-lime-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  HIGH: "bg-orange-500/20 text-orange-400",
  CRITICAL: "bg-red-500/20 text-red-400",
};

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
  const borderColor = BORDER_COLORS[finding.risk_level] || BORDER_COLORS.MEDIUM;
  const badgeColor = BADGE_COLORS[finding.risk_level] || BADGE_COLORS.MEDIUM;

  return (
    <div
      className={`rounded-xl border border-border bg-panel p-5 border-l-4 ${borderColor} animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-text">{finding.title}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeColor}`}
        >
          {finding.risk_level}
        </span>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-text/70">
        {finding.description}
      </p>
      <div className="rounded-lg bg-charcoal/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-accent/80">
          Recommendation
        </p>
        <p className="mt-1 text-sm text-text/80">{finding.recommendation}</p>
      </div>
    </div>
  );
}
