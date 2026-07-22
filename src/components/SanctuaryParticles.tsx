import React, { useEffect, useRef } from "react";

interface SanctuaryParticlesProps {
  themePreset?: "athenian" | "starry" | "wanderer" | "monet";
}

export default function SanctuaryParticles({ themePreset = "athenian" }: SanctuaryParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Color palettes per masterpiece theme
    const getParticleColor = () => {
      switch (themePreset) {
        case "starry":
          return Math.random() > 0.5 ? "rgba(243, 208, 104, " : "rgba(147, 197, 253, ";
        case "wanderer":
          return Math.random() > 0.5 ? "rgba(200, 211, 220, " : "rgba(148, 163, 184, ";
        case "monet":
          return Math.random() > 0.5 ? "rgba(189, 178, 255, " : "rgba(110, 231, 183, ";
        case "athenian":
        default:
          return Math.random() > 0.5 ? "rgba(212, 175, 55, " : "rgba(234, 179, 8, ";
      }
    };

    // Create 36 subtle drifting embers
    const numParticles = 36;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      colorPrefix: getParticleColor(),
      alpha: Math.random() * 0.4 + 0.1,
      speedY: -(Math.random() * 0.35 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      pulse: Math.random() * 0.02,
      pulseDirection: 1
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move particle
        p.y += p.speedY;
        p.x += p.speedX;

        // Pulse alpha gently
        p.alpha += p.pulse * p.pulseDirection;
        if (p.alpha > 0.45 || p.alpha < 0.05) {
          p.pulseDirection *= -1;
        }

        // Reset if off top or sides
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw ember particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.colorPrefix + "0.6)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themePreset]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-700"
    />
  );
}
