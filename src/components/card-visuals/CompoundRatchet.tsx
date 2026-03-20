"use client";

import React, { useEffect, useRef } from "react";

interface CompoundRatchetProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function CompoundRatchet({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: CompoundRatchetProps) {
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

    // Bar dimensions
    const barWidth = Math.min(w, h) * 0.2;
    const barX = w / 2 - barWidth / 2;
    const barBottom = h * 0.85;
    const barMaxHeight = h * 0.7;
    const totalClicks = 8;

    // State
    let currentHeight = 0;
    let targetHeight = 0;
    let clickIndex = 0;
    let clickTimer = 0;
    let resetting = false;
    let time = 0;

    // Burst particles on each click
    interface BurstParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }

    const bursts: BurstParticle[] = [];

    // Ratchet teeth marks
    interface RatchetTooth {
      y: number;
      alpha: number;
    }

    const teeth: RatchetTooth[] = [];

    // Pawl state
    let pawlY = barBottom;
    let pawlAlpha = 0;

    const getClickHeight = (index: number): number => {
      // Each click is slightly bigger than the last (compound growth)
      let total = 0;
      const baseStep = barMaxHeight / (totalClicks * 1.8);
      for (let i = 0; i <= index; i++) {
        total += baseStep * (1 + i * 0.2);
      }
      return Math.min(total, barMaxHeight);
    };

    const triggerClick = () => {
      targetHeight = getClickHeight(clickIndex);

      // Spawn burst particles at the top of the bar
      const topY = barBottom - targetHeight;
      for (let i = 0; i < 6; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
        const speed = 1 + Math.random() * 2;
        bursts.push({
          x: barX + barWidth / 2 + (Math.random() - 0.5) * barWidth * 0.5,
          y: topY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.6 + Math.random() * 0.3,
          size: 1 + Math.random() * 1.5,
        });
      }

      // Add ratchet tooth
      teeth.push({ y: topY, alpha: 0.5 });

      // Set pawl position
      pawlY = topY;
      pawlAlpha = 0.6;

      clickIndex++;
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Click timing
      if (!resetting) {
        clickTimer += 0.016 * speedProp;
        if (clickTimer > 1.2 && clickIndex < totalClicks) {
          clickTimer = 0;
          triggerClick();
        }

        // Check if completed all clicks
        if (clickIndex >= totalClicks && Math.abs(currentHeight - targetHeight) < 1) {
          clickTimer += 0.016 * speedProp;
          if (clickTimer > 1.5) {
            resetting = true;
            clickTimer = 0;
          }
        }
      } else {
        // Smooth reset
        targetHeight = 0;
        if (currentHeight < 2) {
          currentHeight = 0;
          resetting = false;
          clickIndex = 0;
          clickTimer = 0;
          teeth.length = 0;
          pawlAlpha = 0;
        }
      }

      // Ease current height toward target
      if (resetting) {
        currentHeight += (targetHeight - currentHeight) * 0.03 * speedProp;
      } else {
        // Quick snap up for ratchet effect
        currentHeight += (targetHeight - currentHeight) * 0.15 * speedProp;
      }

      const topY = barBottom - currentHeight;

      // Background column track
      ctx.fillStyle = `${color}${hex(5)}`;
      ctx.fillRect(barX - 1, barBottom - barMaxHeight - 10, barWidth + 2, barMaxHeight + 12);

      // Graduation marks on the side
      for (let i = 0; i <= totalClicks; i++) {
        const markH = getClickHeight(i);
        const markY = barBottom - markH;
        ctx.beginPath();
        ctx.moveTo(barX - 8, markY);
        ctx.lineTo(barX - 2, markY);
        ctx.strokeStyle = `${color}${hex(15)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Bar fill gradient
      if (currentHeight > 1) {
        const barGrad = ctx.createLinearGradient(barX, barBottom, barX, topY);
        barGrad.addColorStop(0, `${color}${hex(15)}`);
        barGrad.addColorStop(0.5, `${color}${hex(30)}`);
        barGrad.addColorStop(1, `${color}${hex(50)}`);
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, topY, barWidth, currentHeight);

        // Bar outline
        ctx.strokeStyle = `${color}${hex(40)}`;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, topY, barWidth, currentHeight);

        // Glow at top
        const glowGrad = ctx.createRadialGradient(
          barX + barWidth / 2, topY, 0,
          barX + barWidth / 2, topY, barWidth * 1.2
        );
        glowGrad.addColorStop(0, `${color}${hex(25)}`);
        glowGrad.addColorStop(1, `${color}00`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(barX + barWidth / 2, topY, barWidth * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Top cap line
        ctx.beginPath();
        ctx.moveTo(barX, topY);
        ctx.lineTo(barX + barWidth, topY);
        ctx.strokeStyle = `${color}${hex(80)}`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw ratchet teeth (small marks on the right side)
      for (let i = teeth.length - 1; i >= 0; i--) {
        const tooth = teeth[i];
        tooth.alpha -= 0.001 * speedProp;

        if (tooth.alpha <= 0) {
          teeth.splice(i, 1);
          continue;
        }

        // Small triangular pawl on the right
        const tx = barX + barWidth + 3;
        const ty = tooth.y;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 8, ty - 3);
        ctx.lineTo(tx + 8, ty + 3);
        ctx.closePath();
        ctx.fillStyle = `${color}${hex(tooth.alpha * 200)}`;
        ctx.fill();

        // Horizontal dash from tooth
        ctx.beginPath();
        ctx.moveTo(barX + barWidth, ty);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = `${color}${hex(tooth.alpha * 150)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw main pawl (the current lock)
      if (pawlAlpha > 0 && !resetting) {
        // Pawl on left side
        const px = barX - 3;
        const py = pawlY;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 10, py - 4);
        ctx.lineTo(px - 10, py + 4);
        ctx.closePath();
        ctx.fillStyle = `${color}${hex(pawlAlpha * 255)}`;
        ctx.fill();

        // Pawl connecting line
        ctx.beginPath();
        ctx.moveTo(barX, py);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${color}${hex(pawlAlpha * 200)}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        pawlAlpha -= 0.002 * speedProp;
      }

      // Update and draw burst particles
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx * speedProp;
        p.y += p.vy * speedProp;
        p.vy += 0.02 * speedProp; // slight gravity
        p.alpha -= 0.012 * speedProp;

        if (p.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        // Glow
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        pg.addColorStop(0, `${color}${hex(p.alpha * 60)}`);
        pg.addColorStop(1, `${color}00`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(p.alpha * 255)}`;
        ctx.fill();
      }

      // Base line
      ctx.beginPath();
      ctx.moveTo(barX - 15, barBottom);
      ctx.lineTo(barX + barWidth + 15, barBottom);
      ctx.strokeStyle = `${color}${hex(25)}`;
      ctx.lineWidth = 1;
      ctx.stroke();

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

export default CompoundRatchet;
