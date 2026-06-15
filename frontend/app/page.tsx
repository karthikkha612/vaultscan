"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScanInput from "@/components/ScanInput";
import LoadingScanner from "@/components/LoadingScanner";
import MatrixRain from "@/components/MatrixRain";
import {
  isGithubUrl,
  saveScanResult,
  scanGithub,
  scanURL,
} from "@/lib/api";

const FEATURE_CARDS = [
  {
    title: "SECURITY_HEADERS",
    command: "scan --headers",
    description:
      "Checks for missing CSP, HSTS, X-Frame-Options, and other critical HTTP security headers.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 5V11C4 16 7.5 19.5 12 21C16.5 19.5 20 16 20 11V5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    delay: "0ms",
    speed: 10,
  },
  {
    title: "DEPENDENCIES",
    command: "scan --deps",
    description:
      "Scans package.json and requirements.txt for known vulnerable package versions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L20 6.5V17.5L12 22L4 17.5V6.5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M20 6.5L12 12L4 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 4.25L8 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    delay: "100ms",
    speed: 7,
  },
  {
    title: "XSS_AND_SECRETS",
    command: "scan --xss --secrets",
    description:
      "Tests for reflected XSS payloads and detects exposed API keys, tokens, and credentials.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 8V11L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    delay: "200ms",
    speed: 9,
  },
];

const STATS = [
  { value: "6", label: "CHECK_TYPES" },
  { value: "100", label: "RISK_SCORE" },
  { value: "0x1", label: "REALTIME" },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const t1 = setTimeout(() => setTitleVisible(true), 100);
    const t2 = setTimeout(() => setSubtitleVisible(true), 400);
    const t3 = setTimeout(() => setInputVisible(true), 600);
    const t4 = setTimeout(() => setCardsVisible(true), 900);
    const t5 = setTimeout(() => setStatsVisible(true), 1100);

    const handle = (e: MouseEvent) => {
      if (window.innerWidth < 768) {
        setMouse({ x: 0, y: 0 });
        return;
      }
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handle);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener("mousemove", handle);
    };
  }, []);

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

  if (!mounted) return null;

  return (
    <>
      {isLoading && <LoadingScanner />}

      {/* Matrix rain background */}
      <MatrixRain />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            transform: `translate(${mouse.x * 5}px, ${mouse.y * 5}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        {/* Mouse spotlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(600px circle at ${50 + mouse.x * 25}% ${50 + mouse.y * 25}%, rgba(34,197,94,0.06), transparent 70%)`,
            transition: "background 0.3s ease-out",
          }}
        />
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(34,197,94,0.025) 0px, rgba(34,197,94,0.025) 1px, transparent 1px, transparent 3px)",
            mixBlendMode: "overlay",
          }}
        />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "3px",
              height: "3px",
              backgroundColor: "#22c55e",
              opacity: 0.3,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              transform: `translate(${mouse.x * (i + 1) * 3}px, ${mouse.y * (i + 1) * 3}px)`,
              transition: "transform 0.4s ease-out",
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); opacity: 0.2; }
          to { transform: translateY(-20px); opacity: 0.5; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 20px rgba(34,197,94,0.7); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .cursor-blink {
          animation: blink 1s step-end infinite;
        }
        .card-hover:hover {
          border-color: rgba(34,197,94,0.5) !important;
          box-shadow: 0 0 25px rgba(34,197,94,0.15);
        }
        .card-hover:nth-child(1):hover {
          transform: translate(${mouse.x * FEATURE_CARDS[0].speed}px, ${mouse.y * FEATURE_CARDS[0].speed}px) rotateX(2deg) rotateY(-2deg) !important;
        }
        .card-hover:nth-child(2):hover {
          transform: translate(${mouse.x * FEATURE_CARDS[1].speed}px, ${mouse.y * FEATURE_CARDS[1].speed}px) rotateX(-1.5deg) rotateY(2deg) !important;
        }
        .card-hover:nth-child(3):hover {
          transform: translate(${mouse.x * FEATURE_CARDS[2].speed}px, ${mouse.y * FEATURE_CARDS[2].speed}px) rotateX(2deg) rotateY(1.5deg) !important;
        }
        .card-hover:hover .card-icon {
          color: #22c55e !important;
        }
        .fade-up {
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.visible {
          opacity: 1;
        }
        .fade-in {
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .fade-in.visible {
          opacity: 1;
        }
      `}</style>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20" style={{ zIndex: 2 }}>

        {/* Hero */}
        <section className="mb-16 text-center">

          {/* Title - moves OPPOSITE to mouse */}
          <div
            className={`fade-up ${titleVisible ? "visible" : ""}`}
            style={{
              transform: `translate(${-mouse.x * 8}px, ${-mouse.y * 8}px)`,
              transition: "transform 0.4s ease-out, opacity 0.6s ease",
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "3rem", height: "3rem", color: "#22c55e" }}
              >
                <path d="M12 2L4 5V11C4 16 7.5 19.5 12 21C16.5 19.5 20 16 20 11V5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1
                className="text-4xl font-extrabold tracking-tight sm:text-6xl"
                style={{ color: "#22c55e", letterSpacing: "0.05em" }}
              >
                VAULTSCAN
              </h1>
            </div>
          </div>

          {/* Subtitle - moves SAME as mouse */}
          <div
            className={`fade-in ${subtitleVisible ? "visible" : ""}`}
            style={{
              transform: `translate(${mouse.x * 5}px, ${mouse.y * 5}px)`,
              transition: "transform 0.5s ease-out, opacity 0.6s ease",
            }}
          >
            <p
              className="mx-auto mb-3 max-w-xl text-base sm:text-lg"
              style={{ color: "rgba(212,244,225,0.65)" }}
            >
              <span style={{ color: "#22c55e" }}>$</span> scan --target [url | github_repo] --deep
            </p>
            <div className="flex items-center justify-center gap-2 mb-10">
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#22c55e",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "rgba(34,197,94,0.85)" }}
              >
                [ SCANNER ONLINE ]
              </span>
              <span className="cursor-blink" style={{ color: "#22c55e" }}>_</span>
            </div>
          </div>

          {/* Input - very subtle move */}
          <div
            className={`fade-up ${inputVisible ? "visible" : ""} flex flex-col items-center`}
            style={{
              transform: `translate(${mouse.x * 3}px, ${mouse.y * 3}px)`,
              transition: "transform 0.6s ease-out, opacity 0.6s ease",
            }}
          >
            <ScanInput onScan={handleScan} isLoading={isLoading} />
            {error && (
              <div
                className="mt-4 max-w-2xl rounded px-4 py-3 text-sm text-left"
                style={{
                  border: "1px solid rgba(239,68,68,0.3)",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                }}
              >
                <span style={{ color: "#ef4444" }}>[ERROR]</span> {error}
              </div>
            )}
          </div>
        </section>

        {/* Stats Bar */}
        <div
          className={`fade-up ${statsVisible ? "visible" : ""} mb-12`}
          style={{
            transform: `translate(${mouse.x * 4}px, ${mouse.y * 4}px)`,
            transition: "transform 0.5s ease-out, opacity 0.6s ease",
          }}
        >
          <div
            className="rounded p-4"
            style={{
              border: "1px solid rgba(34,197,94,0.2)",
              backgroundColor: "rgba(34,197,94,0.04)",
            }}
          >
            <div
              className="mb-3 pb-2 text-xs uppercase tracking-widest"
              style={{
                color: "rgba(34,197,94,0.5)",
                borderBottom: "1px solid rgba(34,197,94,0.12)",
              }}
            >
              root@vaultscan:~$ status --verbose
            </div>
            <div className="grid grid-cols-3">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center py-2">
                  <div
                    className="text-2xl font-bold sm:text-3xl"
                    style={{ color: "#22c55e", fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1 text-xs tracking-widest"
                    style={{ color: "rgba(212,244,225,0.45)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards - each at different speed */}
        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className={`card-hover fade-up ${cardsVisible ? "visible" : ""} rounded-lg p-6`}
              style={{
                border: "1px solid #1a2620",
                backgroundColor: "#0f1512",
                transform: `translate(${mouse.x * card.speed}px, ${mouse.y * card.speed}px)`,
                transition: `transform 0.4s ease-out, opacity 0.6s ease ${card.delay}, border-color 0.3s ease, box-shadow 0.3s ease`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="card-icon block"
                  style={{ width: "28px", height: "28px", color: "rgba(34,197,94,0.7)", transition: "color 0.3s ease" }}
                >
                  {card.icon}
                </span>
                <span
                  className="text-xs tracking-widest"
                  style={{ color: "rgba(212,244,225,0.25)" }}
                >
                  [{card.delay === "0ms" ? "01" : card.delay === "100ms" ? "02" : "03"}]
                </span>
              </div>
              <h3
                className="mb-1 text-sm font-bold tracking-widest"
                style={{ color: "#22c55e" }}
              >
                {card.title}
              </h3>
              <div
                className="mb-3 text-xs"
                style={{ color: "rgba(212,244,225,0.35)" }}
              >
                <span style={{ color: "rgba(34,197,94,0.6)" }}>&gt;</span> {card.command}
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(212,244,225,0.6)" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <div
          className="mt-16 text-center text-xs tracking-widest"
          style={{ color: "rgba(212,244,225,0.25)" }}
        >
          [ VAULTSCAN ] // BUILT_FOR_DEVLYNIX_BUILDATHON_2.0
        </div>
      </div>
    </>
  );
}
