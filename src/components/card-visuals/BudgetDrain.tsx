"use client";

import React, { useEffect, useRef } from "react";

interface BudgetDrainProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function BudgetDrain({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: BudgetDrainProps) {
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
    const poolTop = h * 0.12;
    const poolHeight = h * 0.14;
    const poolLeft = w * 0.15;
    const poolRight = w * 0.85;
    const poolWidth = poolRight - poolLeft;

    const channelCount = 4;
    const recipientTop = h * 0.7;
    const recipientHeight = h * 0.1;
    const recipientWidth = poolWidth / (channelCount * 1.8);

    // Channel proportions (must sum to 1)
    const proportions = [0.35, 0.25, 0.22, 0.18];

    interface Channel {
      topX: number;
      bottomX: number;
      bottomY: number;
      proportion: number;
      fillLevel: number;
    }

    const channels: Channel[] = [];
    for (let i = 0; i < channelCount; i++) {
      const spacing = poolWidth / (channelCount + 1);
      const topX = poolLeft + spacing * (i + 1);
      const bottomSpacing = (poolRight - poolLeft) / (channelCount + 1);
      const bottomX = poolLeft + bottomSpacing * (i + 1);
      channels.push({
        topX,
        bottomX,
        bottomY: recipientTop,
        proportion: proportions[i],
        fillLevel: 0,
      });
    }

    // Flow particles
    interface FlowDot {
      x: number;
      y: number;
      channelIdx: number;
      progress: number; // 0 at top pool, 1 at recipient
      speed: number;
      alpha: number;
      size: number;
    }

    const flowDots: FlowDot[] = [];

    let time = 0;
    let topFillLevel = 0.7; // 0 to 1
    let spawnTimer = 0;
    let refillTimer = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Slowly refill top pool
      refillTimer += 0.016 * speedProp;
      topFillLevel = 0.4 + Math.sin(time * 0.5) * 0.25 + 0.05;

      // Spawn flow dots
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.08 && flowDots.length < 60) {
        spawnTimer = 0;
        // Weighted random channel selection
        const r = Math.random();
        let cumulative = 0;
        let selectedChannel = 0;
        for (let c = 0; c < channelCount; c++) {
          cumulative += proportions[c];
          if (r < cumulative) { selectedChannel = c; break; }
        }

        const ch = channels[selectedChannel];
        flowDots.push({
          x: ch.topX + (Math.random() - 0.5) * 4,
          y: poolTop + poolHeight,
          channelIdx: selectedChannel,
          progress: 0,
          speed: 0.008 + Math.random() * 0.005,
          alpha: 0.4 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 1.5,
        });
      }

      // Update recipient fill levels
      for (const ch of channels) {
        ch.fillLevel = Math.min(1, ch.fillLevel + 0.001 * ch.proportion * speedProp);
        ch.fillLevel *= 0.9995; // slow drain to keep it dynamic
      }

      // Draw top reservoir
      // Container outline
      ctx.beginPath();
      ctx.rect(poolLeft, poolTop, poolWidth, poolHeight);
      ctx.strokeStyle = `${color}${hex(0.15 * 255)}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Fill level
      const fillH = poolHeight * topFillLevel;
      const fillY = poolTop + poolHeight - fillH;
      const fillGrad = ctx.createLinearGradient(0, fillY, 0, poolTop + poolHeight);
      fillGrad.addColorStop(0, `${color}${hex(0.08 * 255)}`);
      fillGrad.addColorStop(1, `${color}${hex(0.18 * 255)}`);
      ctx.fillStyle = fillGrad;
      ctx.fillRect(poolLeft + 1, fillY, poolWidth - 2, fillH - 1);

      // Shimmer on surface
      const shimmerY = fillY;
      ctx.beginPath();
      ctx.moveTo(poolLeft + 2, shimmerY);
      ctx.lineTo(poolRight - 2, shimmerY);
      ctx.strokeStyle = `${color}${hex((0.2 + Math.sin(time * 2) * 0.1) * 255)}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw channels
      for (let i = 0; i < channelCount; i++) {
        const ch = channels[i];

        // Channel line from top pool to recipient
        ctx.beginPath();
        ctx.moveTo(ch.topX, poolTop + poolHeight);
        // Slight curve
        const midY = (poolTop + poolHeight + ch.bottomY) / 2;
        ctx.quadraticCurveTo(
          (ch.topX + ch.bottomX) / 2, midY,
          ch.bottomX, ch.bottomY
        );
        ctx.strokeStyle = `${color}${hex(0.08 * 255)}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Channel glow (proportional width)
        ctx.beginPath();
        ctx.moveTo(ch.topX, poolTop + poolHeight);
        ctx.quadraticCurveTo(
          (ch.topX + ch.bottomX) / 2, midY,
          ch.bottomX, ch.bottomY
        );
        ctx.strokeStyle = `${color}${hex(0.03 * 255)}`;
        ctx.lineWidth = 2 + ch.proportion * 8;
        ctx.stroke();

        // Channel exit dot at top pool
        ctx.beginPath();
        ctx.arc(ch.topX, poolTop + poolHeight, 2, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(0.2 * 255)}`;
        ctx.fill();

        // Recipient pool
        const rpLeft = ch.bottomX - recipientWidth / 2;
        ctx.beginPath();
        ctx.rect(rpLeft, recipientTop, recipientWidth, recipientHeight);
        ctx.strokeStyle = `${color}${hex(0.12 * 255)}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Recipient fill
        const rFillH = recipientHeight * ch.fillLevel;
        const rFillY = recipientTop + recipientHeight - rFillH;
        const rGrad = ctx.createLinearGradient(0, rFillY, 0, recipientTop + recipientHeight);
        rGrad.addColorStop(0, `${color}${hex(0.06 * 255)}`);
        rGrad.addColorStop(1, `${color}${hex(0.15 * 255)}`);
        ctx.fillStyle = rGrad;
        ctx.fillRect(rpLeft + 1, rFillY, recipientWidth - 2, rFillH - 1);

        // Proportion label dot (size proportional to share)
        const dotSize = 2 + ch.proportion * 6;
        ctx.beginPath();
        ctx.arc(ch.bottomX, recipientTop + recipientHeight + 10, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(0.12 * 255)}`;
        ctx.fill();
      }

      // Update and draw flow dots
      for (let i = flowDots.length - 1; i >= 0; i--) {
        const dot = flowDots[i];
        dot.progress += dot.speed * speedProp;

        if (dot.progress >= 1) {
          // Arrived at recipient
          channels[dot.channelIdx].fillLevel = Math.min(1, channels[dot.channelIdx].fillLevel + 0.01);
          flowDots.splice(i, 1);
          continue;
        }

        const ch = channels[dot.channelIdx];

        // Interpolate along quadratic bezier
        const t = dot.progress;
        const p0x = ch.topX;
        const p0y = poolTop + poolHeight;
        const p1x = (ch.topX + ch.bottomX) / 2;
        const p1y = (poolTop + poolHeight + ch.bottomY) / 2;
        const p2x = ch.bottomX;
        const p2y = ch.bottomY;

        const mt = 1 - t;
        dot.x = mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
        dot.y = mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;

        // Add slight random wiggle
        dot.x += (Math.random() - 0.5) * 0.5;

        // Fade in at start, fade at end
        const fadeFactor = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;

        // Glow
        const dg = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 3);
        dg.addColorStop(0, `${color}${hex(dot.alpha * fadeFactor * 0.25 * 255)}`);
        dg.addColorStop(1, `${color}00`);
        ctx.fillStyle = dg;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(dot.alpha * fadeFactor * 0.7 * 255)}`;
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
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

export default BudgetDrain;
