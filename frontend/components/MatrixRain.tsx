"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars =
      "01ABCDEFアイウエオカキクケコサシスセソタチツテト$#@&%{}[]<>/\\";
    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () =>
        Math.floor((Math.random() * canvas.height) / fontSize)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    let animationId: number;
    let lastTime = 0;
    const interval = 60; // ms between frames - slows the fall speed

    const draw = (time: number) => {
      animationId = requestAnimationFrame(draw);
      if (time - lastTime < interval) return;
      lastTime = time;

      ctx.fillStyle = "rgba(10, 14, 12, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // brighter "head" character occasionally
        ctx.fillStyle =
          Math.random() > 0.96
            ? "rgba(180, 255, 200, 0.5)"
            : "rgba(34, 197, 94, 0.18)";
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.5,
        zIndex: 0,
      }}
    />
  );
}