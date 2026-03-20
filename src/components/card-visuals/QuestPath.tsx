"use client";

import React, { useEffect, useRef } from "react";

interface QuestPathProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function QuestPath({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: QuestPathProps) {
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

    // Build an S-curve path with checkpoints
    const numCheckpoints = 6;
    const marginX = w * 0.15;
    const marginY = h * 0.12;
    const pathWidth = w - marginX * 2;
    const pathHeight = h - marginY * 2;

    // Generate S-curve control points
    const getPathPoint = (t: number): { x: number; y: number } => {
      const y = marginY + t * pathHeight;
      const amplitude = pathWidth * 0.35;
      const x = w / 2 + Math.sin(t * Math.PI * 2.5) * amplitude;
      return { x, y };
    };

    // Checkpoint positions along the path
    interface Checkpoint {
      t: number;
      x: number;
      y: number;
      lit: boolean;
      pulseAlpha: number;
      pulseRadius: number;
    }

    const checkpoints: Checkpoint[] = [];
    for (let i = 0; i < numCheckpoints; i++) {
      const t = (i + 0.5) / numCheckpoints;
      const pos = getPathPoint(t);
      checkpoints.push({
        t,
        x: pos.x,
        y: pos.y,
        lit: false,
        pulseAlpha: 0,
        pulseRadius: 0,
      });
    }

    // Dot traveling the path
    let dotT = 0;
    const dotSpeed = 0.003;

    // Trail behind the dot
    interface TrailPoint {
      x: number;
      y: number;
      alpha: number;
    }

    const trail: TrailPoint[] = [];

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Draw the full path (faint)
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.005) {
        const p = getPathPoint(t);
        if (t === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `${color}${hex(20)}`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw faint dashed guidelines along the path
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.005) {
        const p = getPathPoint(t);
        if (t === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `${color}${hex(10)}`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Move dot along path
      dotT += dotSpeed * speedProp;

      // Check if dot has passed checkpoints
      for (const cp of checkpoints) {
        if (dotT >= cp.t && !cp.lit) {
          cp.lit = true;
          cp.pulseAlpha = 0.6;
          cp.pulseRadius = 6;
        }
      }

      // Reset when dot completes the path
      if (dotT >= 1) {
        dotT = 0;
        trail.length = 0;
        for (const cp of checkpoints) {
          cp.lit = false;
          cp.pulseAlpha = 0;
          cp.pulseRadius = 0;
        }
      }

      // Add trail point
      const dotPos = getPathPoint(dotT);
      trail.push({ x: dotPos.x, y: dotPos.y, alpha: 0.5 });

      // Fade and trim trail
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].alpha -= 0.008 * speedProp;
        if (trail[i].alpha <= 0) {
          trail.splice(0, i + 1);
          break;
        }
      }

      // Draw trail
      for (const tp of trail) {
        const glow = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, 4);
        glow.addColorStop(0, `${color}${hex(tp.alpha * 80)}`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw lit path segment (brighter, from start to dot position)
      if (dotT > 0) {
        ctx.beginPath();
        for (let t = 0; t <= dotT; t += 0.005) {
          const p = getPathPoint(t);
          if (t === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `${color}${hex(50)}`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Draw checkpoints
      for (const cp of checkpoints) {
        // Outer ring
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = cp.lit ? `${color}${hex(120)}` : `${color}${hex(30)}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner fill
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = cp.lit ? `${color}${hex(180)}` : `${color}${hex(15)}`;
        ctx.fill();

        // Pulse ring when lit
        if (cp.pulseAlpha > 0) {
          cp.pulseRadius += 0.6 * speedProp;
          cp.pulseAlpha -= 0.008 * speedProp;

          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}${hex(cp.pulseAlpha * 255)}`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Secondary pulse
          if (cp.pulseRadius > 10) {
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, cp.pulseRadius * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = `${color}${hex(cp.pulseAlpha * 0.5 * 255)}`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw traveling dot
      const dg = ctx.createRadialGradient(dotPos.x, dotPos.y, 0, dotPos.x, dotPos.y, 12);
      dg.addColorStop(0, `${color}${hex(100)}`);
      dg.addColorStop(0.4, `${color}${hex(30)}`);
      dg.addColorStop(1, `${color}00`);
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(dotPos.x, dotPos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dot core
      ctx.beginPath();
      ctx.arc(dotPos.x, dotPos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${hex(220)}`;
      ctx.fill();

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

export default QuestPath;
