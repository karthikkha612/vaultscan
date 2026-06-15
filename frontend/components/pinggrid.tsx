"use client";

import { useEffect, useRef } from "react";

export default function PingGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dots: HTMLDivElement[] = [];
    const cols = Math.ceil(window.innerWidth / 40);
    const rows = Math.ceil(window.innerHeight / 40);
    const count = 18;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement("div");
      const x = Math.floor(Math.random() * cols) * 40;
      const y = Math.floor(Math.random() * rows) * 40;
      const dur = 2.5 + Math.random() * 3;
      const delay = Math.random() * 4;

      dot.style.position = "absolute";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.width = "6px";
      dot.style.height = "6px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = "#22c55e";
      dot.style.animation = `ping-pulse ${dur}s ease-in-out infinite`;
      dot.style.animationDelay = `-${delay}s`;
      dot.style.willChange = "opacity, transform";

      container.appendChild(dot);
      dots.push(dot);
    }

    return () => {
      dots.forEach((d) => d.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes ping-pulse {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.7; transform: scale(1.3); box-shadow: 0 0 12px rgba(34,197,94,0.6); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </>
  );
}