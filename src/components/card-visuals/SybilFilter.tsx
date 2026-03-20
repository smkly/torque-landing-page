"use client";

import React, { useEffect, useRef } from "react";

interface SybilFilterProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function SybilFilter({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: SybilFilterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const pausedRef = useRef(paused);
  const animateFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused && animateFnRef.current) {
      animationRef.current = requestAnimationFrame(animateFnRef.current);
    }
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width; h = rect.height;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();

    const hex = (v: number) => Math.floor(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");

    const gateX = w * 0.5;
    const gateTop = h * 0.2;
    const gateBottom = h * 0.6;
    const gateWidth = 3;

    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      good: boolean;
      size: number;
      alpha: number;
      state: "approaching" | "passing" | "passed" | "deflecting" | "dead";
      flashTimer: number;
    }

    const dots: Dot[] = [];

    // Flash particles for rejected dots
    interface Flash {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      alpha: number;
    }

    const flashes: Flash[] = [];

    let time = 0;
    let spawnTimer = 0;
    let gatePulse = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Spawn dots from the left
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.25 && dots.length < 40) {
        spawnTimer = 0;
        const good = Math.random() < 0.7;
        const yPos = gateTop + Math.random() * (gateBottom - gateTop);
        dots.push({
          x: -5 + Math.random() * w * 0.08,
          y: yPos,
          vx: 0.6 + Math.random() * 0.4,
          vy: (Math.random() - 0.5) * 0.15,
          good,
          size: 2 + Math.random() * 1.5,
          alpha: 0.5 + Math.random() * 0.4,
          state: "approaching",
          flashTimer: 0,
        });
      }

      // Decay gate pulse
      gatePulse *= 0.93;

      // Draw gate structure
      // Gate pillars
      ctx.beginPath();
      ctx.moveTo(gateX, gateTop - 10);
      ctx.lineTo(gateX, gateBottom + 10);
      ctx.strokeStyle = `${color}${hex((0.25 + gatePulse * 0.4) * 255)}`;
      ctx.lineWidth = gateWidth;
      ctx.stroke();

      // Gate glow
      const gateGrad = ctx.createLinearGradient(gateX - 15, 0, gateX + 15, 0);
      gateGrad.addColorStop(0, `${color}00`);
      gateGrad.addColorStop(0.5, `${color}${hex((0.06 + gatePulse * 0.15) * 255)}`);
      gateGrad.addColorStop(1, `${color}00`);
      ctx.fillStyle = gateGrad;
      ctx.fillRect(gateX - 15, gateTop - 10, 30, gateBottom - gateTop + 20);

      // Gate scanning lines (horizontal bars across the gate)
      const scanCount = 5;
      for (let i = 0; i < scanCount; i++) {
        const sy = gateTop + (i + 0.5) * (gateBottom - gateTop) / scanCount;
        const scanOffset = Math.sin(time * 3 + i) * 0.3;
        ctx.beginPath();
        ctx.moveTo(gateX - 8, sy);
        ctx.lineTo(gateX + 8, sy);
        ctx.strokeStyle = `${color}${hex((0.1 + scanOffset * 0.1) * 255)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Gate top/bottom caps
      for (const y of [gateTop - 10, gateBottom + 10]) {
        ctx.beginPath();
        ctx.arc(gateX, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(0.15 * 255)}`;
        ctx.fill();
      }

      // Subtle guide lines (the path)
      ctx.beginPath();
      ctx.moveTo(0, (gateTop + gateBottom) / 2);
      ctx.lineTo(w, (gateTop + gateBottom) / 2);
      ctx.strokeStyle = `${color}04`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Update and draw dots
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];

        if (dot.state === "approaching") {
          dot.x += dot.vx * speedProp;
          dot.y += dot.vy * speedProp;

          // Approaching the gate
          if (dot.x >= gateX - 8) {
            if (dot.good) {
              dot.state = "passing";
            } else {
              dot.state = "deflecting";
              dot.vy = 1.5 + Math.random() * 1;
              dot.vx = -0.3 + Math.random() * 0.3;
              dot.flashTimer = 1;
              gatePulse = Math.min(1, gatePulse + 0.4);

              // Spawn flash particles
              for (let f = 0; f < 4; f++) {
                const a = Math.random() * Math.PI * 2;
                flashes.push({
                  x: dot.x, y: dot.y,
                  vx: Math.cos(a) * (1 + Math.random()),
                  vy: Math.sin(a) * (1 + Math.random()),
                  life: 1,
                  alpha: 0.6,
                });
              }
            }
          }
        } else if (dot.state === "passing") {
          dot.x += dot.vx * speedProp;
          dot.y += dot.vy * speedProp;
          if (dot.x > gateX + 10) {
            dot.state = "passed";
          }
        } else if (dot.state === "passed") {
          dot.x += dot.vx * speedProp;
          dot.y += dot.vy * speedProp;
          // Fade out past right edge
          if (dot.x > w + 10) {
            dot.state = "dead";
          }
        } else if (dot.state === "deflecting") {
          dot.x += dot.vx * speedProp;
          dot.y += dot.vy * speedProp;
          dot.vy += 0.05 * speedProp; // gravity
          dot.alpha -= 0.012 * speedProp;
          dot.flashTimer *= 0.9;
          if (dot.alpha <= 0 || dot.y > h + 10) {
            dot.state = "dead";
          }
        }

        if (dot.state === "dead") {
          dots.splice(i, 1);
          continue;
        }

        // Draw dot
        if (dot.good || dot.state === "approaching") {
          // Good dot or pre-gate dot: use color
          const dotGlow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 3);
          dotGlow.addColorStop(0, `${color}${hex(dot.alpha * 0.25 * 255)}`);
          dotGlow.addColorStop(1, `${color}00`);
          ctx.fillStyle = dotGlow;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = `${color}${hex(dot.alpha * 0.7 * 255)}`;
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rejected dot: red/gray
          const rejColor = "#FF4444";
          const flashAlpha = dot.flashTimer * 0.3;

          if (flashAlpha > 0.01) {
            const rg = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 4);
            rg.addColorStop(0, `${rejColor}${hex(flashAlpha * 255)}`);
            rg.addColorStop(1, `${rejColor}00`);
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.size * 4, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.fillStyle = `#888888${hex(dot.alpha * 0.6 * 255)}`;
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw subtle trail for approaching/passed dots
        if (dot.state === "approaching" || dot.state === "passed" || dot.state === "passing") {
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(dot.x - 8, dot.y);
          const trailColor = dot.good || dot.state === "approaching" ? color : "#888888";
          ctx.strokeStyle = `${trailColor}${hex(dot.alpha * 0.15 * 255)}`;
          ctx.lineWidth = dot.size * 0.6;
          ctx.stroke();
        }
      }

      // Update and draw flash particles
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.x += f.vx * speedProp;
        f.y += f.vy * speedProp;
        f.life -= 0.03 * speedProp;
        f.alpha = f.life;

        if (f.life <= 0) { flashes.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.fillStyle = `#FF4444${hex(f.alpha * 0.5 * 255)}`;
        ctx.arc(f.x, f.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!pausedRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animateFnRef.current = animate;
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color, speedProp]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
}

export default SybilFilter;
