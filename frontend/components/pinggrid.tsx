"use client";

import { useEffect, useRef } from "react";

export default function PacketStream() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const packets: HTMLDivElement[] = [];
    const count = 22;
    const height = window.innerHeight;
    const width = window.innerWidth;

    for (let i = 0; i < count; i++) {
      const packet = document.createElement("div");
      const top = Math.random() * height;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 8;
      const w = 30 + Math.random() * 60;
      const reverse = Math.random() > 0.5;

      packet.style.position = "absolute";
      packet.style.top = `${top}px`;
      packet.style.left = "0";
      packet.style.width = `${w}px`;
      packet.style.height = "2px";
      packet.style.borderRadius = "1px";
      packet.style.backgroundColor = "rgba(34,197,94,0.35)";
      packet.style.boxShadow = "0 0 6px rgba(34,197,94,0.4)";
      packet.style.animation = `${reverse ? "packet-flow-reverse" : "packet-flow"} ${dur}s linear infinite`;
      packet.style.animationDelay = `-${delay}s`;
      packet.style.willChange = "transform";

      container.appendChild(packet);
      packets.push(packet);
    }

    void width;

    return () => {
      packets.forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes packet-flow {
          from { transform: translateX(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes packet-flow-reverse {
          from { transform: translateX(110vw); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          to { transform: translateX(-100px); opacity: 0; }
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