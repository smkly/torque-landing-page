"use client";

import React, { useEffect, useRef } from "react";

interface EpochCycleProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function EpochCycle({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: EpochCycleProps) {
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

    const cx = w / 2;
    const cy = h * 0.42;
    const ringRadius = Math.min(w, h) * 0.22;
    const segmentCount = 7;
    const segmentGap = 0.04; // radians gap between segments
    const segmentArc = (Math.PI * 2) / segmentCount - segmentGap;

    // Pulse particles when a segment completes
    interface Pulse {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      alpha: number;
    }

    const pulses: Pulse[] = [];

    let time = 0;
    let sweepAngle = -Math.PI / 2; // start at top
    let activeSegment = 0;
    let segmentBrightness: number[] = new Array(segmentCount).fill(0);
    let completedSegments: boolean[] = new Array(segmentCount).fill(false);
    let pulseFlash = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Sweep speed — one full revolution in ~6 seconds
      const sweepSpeed = (Math.PI * 2) / 6;
      sweepAngle += sweepSpeed * 0.016 * speedProp;

      // Determine which segment the sweep is in
      const normalizedAngle = ((sweepAngle + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const newActive = Math.floor(normalizedAngle / (Math.PI * 2 / segmentCount));

      // Detect segment completion
      if (newActive !== activeSegment) {
        completedSegments[activeSegment] = true;
        segmentBrightness[activeSegment] = 1.0;

        // Spawn pulse particles at the completed segment
        const segAngle = -Math.PI / 2 + activeSegment * (Math.PI * 2 / segmentCount) + segmentArc / 2;
        const px = cx + Math.cos(segAngle) * ringRadius;
        const py = cy + Math.sin(segAngle) * ringRadius;
        for (let p = 0; p < 6; p++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 0.5 + Math.random() * 1.5;
          pulses.push({
            x: px, y: py,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 1,
            alpha: 0.7,
          });
        }

        pulseFlash = 0.5;
        activeSegment = newActive;

        // Reset all if a full cycle completed
        if (newActive === 0) {
          completedSegments = new Array(segmentCount).fill(false);
        }
      }

      // Decay pulse flash
      pulseFlash *= 0.95;

      // Draw outer subtle ring
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius + 12, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}08`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw inner subtle ring
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius - 12, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}06`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw segments
      for (let i = 0; i < segmentCount; i++) {
        const startAngle = -Math.PI / 2 + i * (Math.PI * 2 / segmentCount) + segmentGap / 2;
        const endAngle = startAngle + segmentArc;

        // Decay brightness
        segmentBrightness[i] *= 0.97;

        const isCompleted = completedSegments[i];
        const isCurrent = i === activeSegment;
        const brightness = segmentBrightness[i];

        // Base segment
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
        if (isCompleted) {
          ctx.strokeStyle = `${color}${hex((0.25 + brightness * 0.5) * 255)}`;
          ctx.lineWidth = 4;
        } else if (isCurrent) {
          ctx.strokeStyle = `${color}${hex(0.15 * 255)}`;
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = `${color}${hex(0.06 * 255)}`;
          ctx.lineWidth = 2;
        }
        ctx.stroke();

        // Glow for completed/pulsing segments
        if (brightness > 0.05) {
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
          ctx.strokeStyle = `${color}${hex(brightness * 0.3 * 255)}`;
          ctx.lineWidth = 10;
          ctx.stroke();
        }

        // Segment tick marks at each boundary
        const tickAngle = startAngle - segmentGap / 2;
        const innerR = ringRadius - 6;
        const outerR = ringRadius + 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAngle) * innerR, cy + Math.sin(tickAngle) * innerR);
        ctx.lineTo(cx + Math.cos(tickAngle) * outerR, cy + Math.sin(tickAngle) * outerR);
        ctx.strokeStyle = `${color}${hex(0.1 * 255)}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Sweep arc (glowing leading edge)
      const sweepLen = 0.3; // radians
      const sweepEnd = sweepAngle;
      const sweepStart = sweepEnd - sweepLen;

      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, sweepStart, sweepEnd);
      ctx.strokeStyle = `${color}${hex(0.6 * 255)}`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Sweep glow
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, sweepStart, sweepEnd);
      ctx.strokeStyle = `${color}${hex(0.15 * 255)}`;
      ctx.lineWidth = 12;
      ctx.stroke();

      // Sweep head dot
      const headX = cx + Math.cos(sweepEnd) * ringRadius;
      const headY = cy + Math.sin(sweepEnd) * ringRadius;
      const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
      headGlow.addColorStop(0, `${color}${hex(0.5 * 255)}`);
      headGlow.addColorStop(1, `${color}00`);
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(headX, headY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `${color}${hex(0.8 * 255)}`;
      ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Center dot with subtle pulse
      const centerPulse = 0.1 + pulseFlash * 0.3 + Math.sin(time * 2) * 0.03;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringRadius * 0.3);
      cg.addColorStop(0, `${color}${hex(centerPulse * 255)}`);
      cg.addColorStop(1, `${color}00`);
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `${color}${hex(0.2 * 255)}`;
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw and update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.x += p.vx * speedProp;
        p.y += p.vy * speedProp;
        p.life -= 0.02 * speedProp;
        p.alpha = p.life;

        if (p.life <= 0) { pulses.splice(i, 1); continue; }

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4);
        pg.addColorStop(0, `${color}${hex(p.alpha * 0.5 * 255)}`);
        pg.addColorStop(1, `${color}00`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(p.alpha * 0.6 * 255)}`;
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
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

export default EpochCycle;
