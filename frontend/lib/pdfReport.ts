"use client";

import type { ScanResponse, Finding } from "@/lib/api";

const RISK_HEX: Record<string, [number, number, number]> = {
  SAFE:     [34,  197, 94],
  LOW:      [132, 204, 22],
  MEDIUM:   [234, 179, 8],
  HIGH:     [249, 115, 22],
  CRITICAL: [239, 68,  68],
};

function riskColor(level: string): [number, number, number] {
  return RISK_HEX[level] || RISK_HEX.MEDIUM;
}

export async function downloadPDFReport(scan: ScanResponse) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── helpers ────────────────────────────────────────────────────────────────

  function checkPageBreak(neededH: number) {
    if (y + neededH > pageH - 24) {
      doc.addPage();
      drawBackground();
      drawFooter();
      y = 24;
    }
  }

  function drawBackground() {
    // Clean dark background — no grid
    doc.setFillColor(10, 14, 12);
    doc.rect(0, 0, pageW, pageH, "F");
  }

  function drawFooter() {
    // Thin green line above footer
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.3);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text("VAULTSCAN // DEVLYNIX BUILDATHON 2.0", margin, pageH - 7);
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.setTextColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text("TRACK_02 // CYBERSECURITY", pageW - margin, pageH - 7, { align: "right" });
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function divider(yPos: number, opacity = 0.12) {
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.3);
    doc.setGState(doc.GState({ opacity }));
    doc.line(margin, yPos, pageW - margin, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function wrappedMono(
    text: string,
    x: number,
    yPos: number,
    maxW: number,
    size = 8,
    r = 255, g = 255, b = 255,
    opacity = 1,
    lineH = 4.5
  ): number {
    doc.setFont("courier", "normal");
    doc.setFontSize(size);
    doc.setTextColor(r, g, b);
    doc.setGState(doc.GState({ opacity }));
    const lines = doc.splitTextToSize(text, maxW) as string[];
    doc.text(lines, x, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
    return lines.length * lineH;
  }

  // ─── page 1 ─────────────────────────────────────────────────────────────────
  drawBackground();
  drawFooter();

  // ─── header ─────────────────────────────────────────────────────────────────
  y = 20;

  // Left green accent bar for header
  doc.setFillColor(34, 197, 94);
  doc.rect(margin, y - 6, 3, 14, "F");

  // VAULTSCAN wordmark
  doc.setFont("courier", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("VAULTSCAN", margin + 7, y + 3);

  // Right labels
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text("SECURITY_REPORT", pageW - margin, y - 1, { align: "right" });
  doc.text("DEVLYNIX BUILDATHON 2.0", pageW - margin, y + 4, { align: "right" });
  doc.setGState(doc.GState({ opacity: 1 }));

  y += 12;
  divider(y, 0.2);
  y += 10;

  // ─── scan meta ──────────────────────────────────────────────────────────────

  // $ SCAN_RESULTS label
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(34, 197, 94);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text("$ SCAN_RESULTS", margin, y);
  doc.setGState(doc.GState({ opacity: 1 }));
  y += 6;

  // Target URL
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const target = scan.target.length > 65 ? scan.target.slice(0, 65) + "..." : scan.target;
  doc.text(target, margin, y);
  y += 7;

  // Date + scan type
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text(`${new Date(scan.scanned_at).toLocaleString()}  ·  ${scan.scan_type.toUpperCase()}_SCAN`, margin, y);
  doc.setGState(doc.GState({ opacity: 1 }));
  y += 8;

  // Risk badge
  const [rr, rg, rb] = riskColor(scan.risk_level);
  const badgeW = scan.risk_level.length * 2.4 + 10;
  doc.setFillColor(rr, rg, rb);
  doc.setGState(doc.GState({ opacity: 0.12 }));
  doc.roundedRect(margin, y - 4, badgeW, 7, 1, 1, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setDrawColor(rr, rg, rb);
  doc.setLineWidth(0.4);
  doc.setGState(doc.GState({ opacity: 0.45 }));
  doc.roundedRect(margin, y - 4, badgeW, 7, 1, 1, "S");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(rr, rg, rb);
  doc.text(scan.risk_level, margin + 5, y + 0.5);
  y += 12;

  divider(y, 0.15);
  y += 10;

  // ─── score section ──────────────────────────────────────────────────────────
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text("RISK_SCORE", margin, y);
  doc.setGState(doc.GState({ opacity: 1 }));
  y += 5;

  // Big score number
  doc.setFont("courier", "bold");
  doc.setFontSize(40);
  doc.setTextColor(rr, rg, rb);
  doc.text(`${scan.overall_score}`, margin, y + 10);

  // / 100
  doc.setFont("courier", "normal");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text("/ 100", margin + 26, y + 10);
  doc.setGState(doc.GState({ opacity: 1 }));

  // Score bar — clean, no labels cluttering
  const barX = margin + 55;
  const barY = y + 5;
  const barW = contentW - 58;
  const barH = 5;
  // Track
  doc.setFillColor(34, 197, 94);
  doc.setGState(doc.GState({ opacity: 0.07 }));
  doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  // Fill
  doc.setFillColor(rr, rg, rb);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.roundedRect(barX, barY, Math.max((scan.overall_score / 100) * barW, 2), barH, 1.5, 1.5, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  // Min/max labels
  doc.setFont("courier", "normal");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.text("0", barX, barY + 10);
  doc.text("100", barX + barW - 5, barY + 10);
  doc.setGState(doc.GState({ opacity: 1 }));

  y += 20;
  divider(y, 0.15);
  y += 10;

  // ─── findings header ────────────────────────────────────────────────────────
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 197, 94);
  doc.text(`> FINDINGS (${scan.findings.length})`, margin, y);

  // Severity summary on same line
  const counts: Record<string, number> = {};
  scan.findings.forEach(f => { counts[f.risk_level] = (counts[f.risk_level] || 0) + 1; });
  let summaryX = margin + 40;
  ["CRITICAL", "HIGH", "MEDIUM", "LOW"].forEach(level => {
    if (counts[level]) {
      const [lr, lg, lb] = riskColor(level);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(lr, lg, lb);
      doc.text(`${level}: ${counts[level]}`, summaryX, y);
      summaryX += level.length * 2.2 + 10;
    }
  });

  y += 10;

  // ─── finding cards ──────────────────────────────────────────────────────────
  if (scan.findings.length === 0) {
    checkPageBreak(16);
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text("[ NO_VULNERABILITIES_DETECTED ]", pageW / 2, y + 6, { align: "center" });
    y += 16;
  }

  scan.findings.forEach((finding: Finding, index: number) => {
    // Estimate card height
    const descLines = doc.splitTextToSize(finding.description, contentW - 12) as string[];
    const recLines = doc.splitTextToSize(finding.recommendation, contentW - 16) as string[];
    const cardH = 14 + descLines.length * 4.5 + 8 + recLines.length * 4.5 + 8;

    checkPageBreak(cardH + 6);

    const [fr, fg, fb] = riskColor(finding.risk_level);
    const tag = String(index + 1).padStart(2, "0");

    // Card background
    doc.setFillColor(15, 21, 18);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.roundedRect(margin, y, contentW, cardH, 2, 2, "F");

    // Left accent bar (severity color)
    doc.setFillColor(fr, fg, fb);
    doc.roundedRect(margin, y, 2.5, cardH, 1, 1, "F");

    // Card border
    doc.setDrawColor(26, 38, 32);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, cardH, 2, 2, "S");

    // Index tag
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text(`[${tag}]`, margin + 6, y + 8);
    doc.setGState(doc.GState({ opacity: 1 }));

    // Title
    doc.setFont("courier", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(finding.title, margin + 16, y + 8);

    // Severity badge — top right
    const bw = finding.risk_level.length * 2.2 + 8;
    doc.setFillColor(fr, fg, fb);
    doc.setGState(doc.GState({ opacity: 0.12 }));
    doc.roundedRect(pageW - margin - bw - 2, y + 2.5, bw, 6, 1, 1, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setDrawColor(fr, fg, fb);
    doc.setLineWidth(0.3);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.roundedRect(pageW - margin - bw - 2, y + 2.5, bw, 6, 1, 1, "S");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(fr, fg, fb);
    doc.text(finding.risk_level, pageW - margin - bw + 1, y + 7);

    // Thin divider under title
    doc.setDrawColor(26, 38, 32);
    doc.setLineWidth(0.2);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.line(margin + 5, y + 11, pageW - margin - 5, y + 11);
    doc.setGState(doc.GState({ opacity: 1 }));

    // Description
    let innerY = y + 16;
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text(descLines, margin + 6, innerY);
    doc.setGState(doc.GState({ opacity: 1 }));
    innerY += descLines.length * 4.5 + 5;

    // Recommendation box
    const recBoxH = recLines.length * 4.5 + 9;
    doc.setFillColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 0.04 }));
    doc.roundedRect(margin + 5, innerY - 3, contentW - 10, recBoxH, 1, 1, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.2);
    doc.setGState(doc.GState({ opacity: 0.12 }));
    doc.roundedRect(margin + 5, innerY - 3, contentW - 10, recBoxH, 1, 1, "S");
    doc.setGState(doc.GState({ opacity: 1 }));

    // > RECOMMENDATION label
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text("> RECOMMENDATION", margin + 9, innerY + 3);
    doc.setGState(doc.GState({ opacity: 1 }));
    innerY += 7;

    // Recommendation text
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text(recLines, margin + 9, innerY);
    doc.setGState(doc.GState({ opacity: 1 }));

    y += cardH + 5;
  });

  // ─── page numbers ───────────────────────────────────────────────────────────
  const total = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.text(`${p} / ${total}`, pageW / 2, pageH - 7, { align: "center" });
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  // ─── save ───────────────────────────────────────────────────────────────────
  doc.save(`vaultscan-report-${Date.now()}.pdf`);
}