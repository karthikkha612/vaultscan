"use client";

import type { ScanResponse, Finding } from "@/lib/api";

// Risk colors matching the UI
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
  // Dynamically import jsPDF so it's only loaded when needed
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── helpers ────────────────────────────────────────────────────────────────

  function checkPageBreak(neededH: number) {
    if (y + neededH > pageH - 20) {
      doc.addPage();
      drawPageBackground();
      y = 20;
    }
  }

  function drawPageBackground() {
    // Dark background
    doc.setFillColor(10, 14, 12);
    doc.rect(0, 0, pageW, pageH, "F");

    // Subtle green grid lines
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.08);
    doc.setGState(doc.GState({ opacity: 0.08 }));
    for (let gx = 0; gx < pageW; gx += 10) {
      doc.line(gx, 0, gx, pageH);
    }
    for (let gy = 0; gy < pageH; gy += 10) {
      doc.line(0, gy, pageW, gy);
    }
    doc.setGState(doc.GState({ opacity: 1 }));

    // Corner accents top-left
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.4);
    doc.setGState(doc.GState({ opacity: 0.3 }));
    doc.line(margin - 4, 8, margin - 4, 22);
    doc.line(margin - 4, 8, margin + 10, 8);
    // Corner accents bottom-right
    doc.line(pageW - margin + 4, pageH - 8, pageW - margin + 4, pageH - 22);
    doc.line(pageW - margin + 4, pageH - 8, pageW - margin - 10, pageH - 8);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function monoLabel(text: string, x: number, yPos: number, size = 7, alpha = 0.4) {
    doc.setFont("courier", "bold");
    doc.setFontSize(size);
    doc.setTextColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: alpha }));
    doc.text(text, x, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function monoText(text: string, x: number, yPos: number, size = 9, r = 212, g = 244, b = 225, alpha = 1) {
    doc.setFont("courier", "normal");
    doc.setFontSize(size);
    doc.setTextColor(r, g, b);
    doc.setGState(doc.GState({ opacity: alpha }));
    doc.text(text, x, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function divider(yPos: number, alpha = 0.15) {
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.3);
    doc.setGState(doc.GState({ opacity: alpha }));
    doc.line(margin, yPos, pageW - margin, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  function wrappedText(
    text: string,
    x: number,
    yPos: number,
    maxW: number,
    size = 8,
    r = 212, g = 244, b = 225,
    alpha = 0.6,
    lineH = 4.5
  ): number {
    doc.setFont("courier", "normal");
    doc.setFontSize(size);
    doc.setTextColor(r, g, b);
    doc.setGState(doc.GState({ opacity: alpha }));
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, x, yPos);
    doc.setGState(doc.GState({ opacity: 1 }));
    return lines.length * lineH;
  }

  // ─── page 1 background ──────────────────────────────────────────────────────
  drawPageBackground();

  // ─── header bar ─────────────────────────────────────────────────────────────
  y = 16;
  doc.setFillColor(34, 197, 94);
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.rect(margin, y - 6, contentW, 18, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // Shield icon (simple polygon)
  doc.setFillColor(34, 197, 94);
  doc.setGState(doc.GState({ opacity: 0.9 }));
  doc.triangle(margin + 2, y + 2, margin + 7, y - 4, margin + 12, y + 2, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // VAULTSCAN title
  doc.setFont("courier", "bold");
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94);
  doc.text("VAULTSCAN", margin + 16, y + 4);

  // Right-side label
  monoLabel("SECURITY_REPORT", pageW - margin - 36, y + 1, 7, 0.5);
  monoLabel("DEVLYNIX BUILDATHON 2.0", pageW - margin - 36, y + 6, 6, 0.3);

  y += 18;
  divider(y);
  y += 8;

  // ─── scan meta block ────────────────────────────────────────────────────────
  monoLabel("$ SCAN_RESULTS", margin, y, 7, 0.6);
  y += 6;

  // Target URL
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(212, 244, 225);
  const targetDisplay = scan.target.length > 70 ? scan.target.slice(0, 70) + "..." : scan.target;
  doc.text(targetDisplay, margin, y);
  y += 6;

  // Meta row
  const dateStr = new Date(scan.scanned_at).toLocaleString();
  monoText(`${dateStr}  ·  ${scan.scan_type.toUpperCase()}_SCAN`, margin, y, 8, 212, 244, 225, 0.4);
  y += 8;

  // Risk badge
  const [rr, rg, rb] = riskColor(scan.risk_level);
  doc.setFillColor(rr, rg, rb);
  doc.setGState(doc.GState({ opacity: 0.15 }));
  doc.roundedRect(margin, y - 4, 28, 7, 1, 1, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setDrawColor(rr, rg, rb);
  doc.setLineWidth(0.3);
  doc.setGState(doc.GState({ opacity: 0.4 }));
  doc.roundedRect(margin, y - 4, 28, 7, 1, 1, "S");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(rr, rg, rb);
  doc.text(scan.risk_level, margin + 4, y + 0.5);

  y += 12;
  divider(y);
  y += 8;

  // ─── score gauge (text-based) ───────────────────────────────────────────────
  monoLabel("RISK_SCORE", margin, y, 7, 0.5);
  y += 5;

  doc.setFont("courier", "bold");
  doc.setFontSize(36);
  doc.setTextColor(rr, rg, rb);
  doc.text(`${scan.overall_score}`, margin, y + 8);

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(212, 244, 225);
  doc.setGState(doc.GState({ opacity: 0.4 }));
  doc.text("/ 100", margin + 22, y + 8);
  doc.setGState(doc.GState({ opacity: 1 }));

  // Score bar
  const barX = margin + 45;
  const barY = y + 4;
  const barW = contentW - 48;
  const barH = 6;
  doc.setFillColor(34, 197, 94);
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.roundedRect(barX, barY, barW, barH, 2, 2, "F");
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setFillColor(rr, rg, rb);
  doc.setGState(doc.GState({ opacity: 0.8 }));
  doc.roundedRect(barX, barY, (scan.overall_score / 100) * barW, barH, 2, 2, "F");
  doc.setGState(doc.GState({ opacity: 1 }));

  // Score labels
  monoText("0", barX, barY + 11, 6, 212, 244, 225, 0.3);
  monoText("50", barX + barW / 2 - 3, barY + 11, 6, 212, 244, 225, 0.3);
  monoText("100", barX + barW - 8, barY + 11, 6, 212, 244, 225, 0.3);

  y += 22;
  divider(y);
  y += 8;

  // ─── findings count summary ──────────────────────────────────────────────────
  const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, SAFE: 0 };
  scan.findings.forEach(f => { counts[f.risk_level] = (counts[f.risk_level] || 0) + 1; });

  monoLabel(`> FINDINGS (${scan.findings.length})`, margin, y, 8, 0.7);
  y += 6;

  // Summary pills
  let pillX = margin;
  ["CRITICAL", "HIGH", "MEDIUM", "LOW"].forEach(level => {
    if (counts[level] > 0) {
      const [pr, pg, pb] = riskColor(level);
      const pillW = level.length * 2.2 + 14;
      doc.setFillColor(pr, pg, pb);
      doc.setGState(doc.GState({ opacity: 0.12 }));
      doc.roundedRect(pillX, y - 3.5, pillW, 6, 1, 1, "F");
      doc.setGState(doc.GState({ opacity: 1 }));
      doc.setFont("courier", "bold");
      doc.setFontSize(7);
      doc.setTextColor(pr, pg, pb);
      doc.text(`${level}: ${counts[level]}`, pillX + 2, y + 0.5);
      pillX += pillW + 3;
    }
  });

  y += 10;

  // ─── finding cards ──────────────────────────────────────────────────────────
  scan.findings.forEach((finding: Finding, index: number) => {
    const cardH = 42 + Math.ceil(finding.description.length / 80) * 4.5 + Math.ceil(finding.recommendation.length / 80) * 4.5;
    checkPageBreak(cardH);

    const [fr, fg, fb] = riskColor(finding.risk_level);
    const tag = String(index + 1).padStart(2, "0");

    // Card background
    doc.setFillColor(15, 21, 18);
    doc.setGState(doc.GState({ opacity: 0.9 }));
    doc.roundedRect(margin, y, contentW, cardH, 2, 2, "F");
    doc.setGState(doc.GState({ opacity: 1 }));

    // Left accent bar
    doc.setFillColor(fr, fg, fb);
    doc.roundedRect(margin, y, 2, cardH, 1, 1, "F");

    // Card border
    doc.setDrawColor(26, 38, 32);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, cardH, 2, 2, "S");

    // Index tag
    monoText(`[${tag}]`, margin + 5, y + 7, 7, 212, 244, 225, 0.25);

    // Title
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(212, 244, 225);
    doc.text(finding.title, margin + 16, y + 7);

    // Severity badge
    doc.setFillColor(fr, fg, fb);
    doc.setGState(doc.GState({ opacity: 0.15 }));
    const badgeW = finding.risk_level.length * 2.2 + 8;
    doc.roundedRect(pageW - margin - badgeW - 2, y + 2, badgeW, 6, 1, 1, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(fr, fg, fb);
    doc.text(finding.risk_level, pageW - margin - badgeW + 1, y + 6.5);

    // Divider under title
    doc.setDrawColor(26, 38, 32);
    doc.setLineWidth(0.2);
    doc.setGState(doc.GState({ opacity: 0.5 }));
    doc.line(margin + 4, y + 10, pageW - margin - 4, y + 10);
    doc.setGState(doc.GState({ opacity: 1 }));

    // Description
    const descH = wrappedText(finding.description, margin + 5, y + 16, contentW - 10, 8, 212, 244, 225, 0.55);

    // Recommendation box
    const recY = y + 16 + descH + 2;
    doc.setFillColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 0.04 }));
    doc.roundedRect(margin + 4, recY - 4, contentW - 8, cardH - (recY - y) - 2, 1, 1, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.2);
    doc.setGState(doc.GState({ opacity: 0.15 }));
    doc.roundedRect(margin + 4, recY - 4, contentW - 8, cardH - (recY - y) - 2, 1, 1, "S");
    doc.setGState(doc.GState({ opacity: 1 }));

    monoText("> RECOMMENDATION", margin + 7, recY + 1, 7, 34, 197, 94, 0.8);
    wrappedText(finding.recommendation, margin + 7, recY + 6, contentW - 14, 7.5, 212, 244, 225, 0.65);

    y += cardH + 5;
  });

  // ─── empty state ────────────────────────────────────────────────────────────
  if (scan.findings.length === 0) {
    checkPageBreak(20);
    doc.setFillColor(34, 197, 94);
    doc.setGState(doc.GState({ opacity: 0.04 }));
    doc.roundedRect(margin, y, contentW, 16, 2, 2, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text("[ NO_VULNERABILITIES_DETECTED ]", margin + contentW / 2, y + 9, { align: "center" });
    y += 20;
  }

  // ─── footer on last page ────────────────────────────────────────────────────
  checkPageBreak(16);
  divider(pageH - 14);
  monoText("VAULTSCAN // DEVLYNIX BUILDATHON 2.0", margin, pageH - 8, 7, 229, 229, 229, 0.2);
  monoText("TRACK_02 // CYBERSECURITY", pageW - margin, pageH - 8, 7, 34, 197, 94, 0.3);

  // ─── page numbers ───────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    monoText(`${p} / ${totalPages}`, pageW / 2, pageH - 6, 6, 212, 244, 225, 0.2);
  }

  // ─── save ───────────────────────────────────────────────────────────────────
  const filename = `vaultscan-report-${Date.now()}.pdf`;
  doc.save(filename);
}