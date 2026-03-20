"use client";

import React, { useEffect, useRef } from "react";

interface ChurnCliffProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function ChurnCliff({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: ChurnCliffProps) {
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

    // Layout
    const pathY = h * 0.38;
    const cliffX = w * 0.52;
    const cliffDropY = h * 0.75;
    const netY = pathY + (cliffDropY - pathY) * 0.55;
    const netLeftX = cliffX - 5;
    const netRightX = cliffX + w * 0.2;
    const continuePathY = pathY; // saved dots bounce back to same level

    type DotState = "walking" | "atEdge" | "falling" | "caught" | "bouncing" | "continuing" | "dead";

    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      state: DotState;
      size: number;
      alpha: number;
      saved: boolean;
      edgeTimer: number;
      bounceProgress: number;
      bounceStartX: number;
      bounceStartY: number;
    }

    const dots: Dot[] = [];

    // Net glow particles
    interface NetParticle {
      x: number;
      y: number;
      life: number;
      alpha: number;
    }

    const netParticles: NetParticle[] = [];

    let time = 0;
    let spawnTimer = 0;
    let netPulse = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Spawn walking dots from left
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.45 && dots.length < 30) {
        spawnTimer = 0;
        const saved = Math.random() < 0.5;
        dots.push({
          x: -5 + Math.random() * w * 0.05,
          y: pathY + (Math.random() - 0.5) * 2,
          vx: 0.5 + Math.random() * 0.3,
          vy: 0,
          state: "walking",
          size: 2 + Math.random() * 1.5,
          alpha: 0.5 + Math.random() * 0.4,
          saved,
          edgeTimer: 0,
          bounceProgress: 0,
          bounceStartX: 0,
          bounceStartY: 0,
        });
      }

      // Decay net pulse
      netPulse *= 0.94;

      // Draw walking path (left side)
      ctx.beginPath();
      ctx.moveTo(0, pathY);
      ctx.lineTo(cliffX, pathY);
      ctx.strokeStyle = `${color}${hex(0.12 * 255)}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw cliff edge (vertical drop)
      ctx.beginPath();
      ctx.moveTo(cliffX, pathY);
      ctx.lineTo(cliffX, cliffDropY);
      ctx.strokeStyle = `${color}${hex(0.06 * 255)}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cliff edge marker
      ctx.beginPath();
      ctx.arc(cliffX, pathY, 3, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${hex(0.2 * 255)}`;
      ctx.fill();

      // Draw the safety net — a curved glowing line
      ctx.beginPath();
      ctx.moveTo(netLeftX, netY - 8);
      const netMidX = (netLeftX + netRightX) / 2;
      const netSag = 12; // how much the net sags
      ctx.quadraticCurveTo(netMidX, netY + netSag, netRightX, netY - 8);
      ctx.strokeStyle = `${color}${hex((0.25 + netPulse * 0.3) * 255)}`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Net glow
      ctx.beginPath();
      ctx.moveTo(netLeftX, netY - 8);
      ctx.quadraticCurveTo(netMidX, netY + netSag, netRightX, netY - 8);
      ctx.strokeStyle = `${color}${hex((0.06 + netPulse * 0.12) * 255)}`;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Net cross-hatches
      const netSegments = 6;
      for (let n = 1; n < netSegments; n++) {
        const t = n / netSegments;
        const mt = 1 - t;
        const nx = mt * mt * netLeftX + 2 * mt * t * netMidX + t * t * netRightX;
        const ny = mt * mt * (netY - 8) + 2 * mt * t * (netY + netSag) + t * t * (netY - 8);

        ctx.beginPath();
        ctx.moveTo(nx, ny - 3);
        ctx.lineTo(nx, ny + 3);
        ctx.strokeStyle = `${color}${hex(0.12 * 255)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw continuation path (right side, above)
      ctx.beginPath();
      ctx.moveTo(cliffX + w * 0.12, continuePathY);
      ctx.lineTo(w, continuePathY);
      ctx.strokeStyle = `${color}${hex(0.12 * 255)}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Update and draw dots
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];

        if (dot.state === "walking") {
          dot.x += dot.vx * speedProp;
          dot.y += Math.sin(time * 5 + i) * 0.1 * speedProp; // subtle bobble

          if (dot.x >= cliffX - 2) {
            dot.state = "atEdge";
            dot.edgeTimer = 0.15 + Math.random() * 0.15;
          }
        } else if (dot.state === "atEdge") {
          // Brief pause at edge
          dot.edgeTimer -= 0.016 * speedProp;
          if (dot.edgeTimer <= 0) {
            dot.state = "falling";
            dot.vx = 0.2 + Math.random() * 0.3;
            dot.vy = 0;
          }
        } else if (dot.state === "falling") {
          dot.vy += 0.08 * speedProp; // gravity
          dot.x += dot.vx * speedProp;
          dot.y += dot.vy * speedProp;

          if (dot.saved) {
            // Check if hit the net
            const netProgress = (dot.x - netLeftX) / (netRightX - netLeftX);
            if (netProgress >= 0 && netProgress <= 1) {
              const t = netProgress;
              const mt = 1 - t;
              const netAtX = mt * mt * (netY - 8) + 2 * mt * t * (netY + netSag) + t * t * (netY - 8);
              if (dot.y >= netAtX - 2) {
                dot.state = "caught";
                dot.y = netAtX - 2;
                dot.bounceStartX = dot.x;
                dot.bounceStartY = dot.y;
                dot.bounceProgress = 0;
                netPulse = Math.min(1, netPulse + 0.4);

                // Net catch particles
                for (let p = 0; p < 5; p++) {
                  netParticles.push({
                    x: dot.x + (Math.random() - 0.5) * 8,
                    y: dot.y + (Math.random() - 0.5) * 4,
                    life: 1,
                    alpha: 0.5,
                  });
                }
              }
            }
          } else {
            // Fading out as falling
            dot.alpha -= 0.006 * speedProp;
            if (dot.y > h + 10 || dot.alpha <= 0) {
              dot.state = "dead";
            }
          }
        } else if (dot.state === "caught") {
          // Brief bounce pause
          dot.bounceProgress += 0.03 * speedProp;
          if (dot.bounceProgress >= 1) {
            dot.state = "bouncing";
            dot.bounceProgress = 0;
          }
        } else if (dot.state === "bouncing") {
          // Arc upward to continuation path
          dot.bounceProgress += 0.015 * speedProp;
          if (dot.bounceProgress >= 1) {
            dot.state = "continuing";
            dot.x = cliffX + w * 0.13;
            dot.y = continuePathY;
            dot.vx = 0.5 + Math.random() * 0.3;
            dot.vy = 0;
          } else {
            const t = dot.bounceProgress;
            const targetX = cliffX + w * 0.13;
            const targetY = continuePathY;
            // Parabolic arc
            dot.x = dot.bounceStartX + t * (targetX - dot.bounceStartX);
            const arcHeight = -40;
            dot.y = dot.bounceStartY + t * (targetY - dot.bounceStartY) + arcHeight * Math.sin(t * Math.PI);
          }
        } else if (dot.state === "continuing") {
          dot.x += dot.vx * speedProp;
          dot.y += Math.sin(time * 5 + i) * 0.08 * speedProp;

          if (dot.x > w + 10) {
            dot.state = "dead";
          }
        }

        if (dot.state === "dead") {
          dots.splice(i, 1);
          continue;
        }

        // Draw dot
        const dotColor = dot.saved || dot.state === "walking" || dot.state === "atEdge" ? color : "#666666";
        const glowRadius = dot.state === "bouncing" || dot.state === "caught" ? dot.size * 5 : dot.size * 3;

        // Glow
        const dg = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, glowRadius);
        dg.addColorStop(0, `${dotColor}${hex(dot.alpha * 0.2 * 255)}`);
        dg.addColorStop(1, `${dotColor}00`);
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `${dotColor}${hex(dot.alpha * 0.7 * 255)}`;
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail for walking/continuing dots
        if (dot.state === "walking" || dot.state === "continuing") {
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(dot.x - 6, dot.y);
          ctx.strokeStyle = `${dotColor}${hex(dot.alpha * 0.1 * 255)}`;
          ctx.lineWidth = dot.size * 0.5;
          ctx.stroke();
        }
      }

      // Draw and update net particles
      for (let i = netParticles.length - 1; i >= 0; i--) {
        const np = netParticles[i];
        np.life -= 0.02 * speedProp;
        np.alpha = np.life;
        np.y -= 0.3 * speedProp;

        if (np.life <= 0) { netParticles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(np.alpha * 0.4 * 255)}`;
        ctx.arc(np.x, np.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label indicators — subtle text-like dots
      // "D3" area marker on the left path
      const d3X = w * 0.15;
      ctx.beginPath();
      ctx.arc(d3X, pathY - 12, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${hex(0.15 * 255)}`;
      ctx.fill();

      // "D7" area marker near cliff
      const d7X = cliffX - 15;
      ctx.beginPath();
      ctx.arc(d7X, pathY - 12, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${hex(0.15 * 255)}`;
      ctx.fill();

      // Small tick marks along path for day markers
      for (let d = 0; d < 5; d++) {
        const dx = w * 0.1 + d * (cliffX - w * 0.1) / 5;
        ctx.beginPath();
        ctx.moveTo(dx, pathY - 3);
        ctx.lineTo(dx, pathY + 3);
        ctx.strokeStyle = `${color}${hex(0.06 * 255)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
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

export default ChurnCliff;
