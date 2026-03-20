"use client";

import React, { useEffect, useRef } from "react";

interface WalletTiersProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function WalletTiers({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: WalletTiersProps) {
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

    // Three buckets at the bottom
    const bucketY = h * 0.72;
    const bucketHeight = h * 0.18;
    const gap = w * 0.04;
    const totalGaps = gap * 4; // 2 outer margins + 2 inner gaps
    const availableWidth = w - totalGaps;

    // Bucket widths proportional to tier size
    const smallW = availableWidth * 0.22;
    const medW = availableWidth * 0.33;
    const largeW = availableWidth * 0.45;

    interface Bucket {
      x: number;
      width: number;
      label: string;
      fillCount: number;
      pulseAlpha: number;
    }

    const buckets: Bucket[] = [
      { x: gap, width: smallW, label: "S", fillCount: 0, pulseAlpha: 0 },
      { x: gap + smallW + gap, width: medW, label: "M", fillCount: 0, pulseAlpha: 0 },
      { x: gap + smallW + gap + medW + gap, width: largeW, label: "L", fillCount: 0, pulseAlpha: 0 },
    ];

    // Falling wallet dots
    interface WalletDot {
      x: number;
      y: number;
      vy: number;
      size: number;
      tier: number; // 0=small, 1=medium, 2=large
      alpha: number;
      targetX: number;
      landed: boolean;
      landY: number;
      fadeTimer: number;
    }

    const dots: WalletDot[] = [];

    // Particles on landing
    interface LandParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
    }

    const particles: LandParticle[] = [];

    let spawnTimer = 0;
    let time = 0;

    const spawnDot = () => {
      // Random tier weighted: 40% small, 35% medium, 25% large
      const r = Math.random();
      const tier = r < 0.4 ? 0 : r < 0.75 ? 1 : 2;
      const bucket = buckets[tier];
      const size = tier === 0 ? 2 + Math.random() * 1.5 : tier === 1 ? 3.5 + Math.random() * 2 : 5.5 + Math.random() * 2.5;
      const targetX = bucket.x + bucket.width * (0.15 + Math.random() * 0.7);

      // Start from top with some horizontal spread
      const startX = w * (0.1 + Math.random() * 0.8);

      dots.push({
        x: startX,
        y: -10 - Math.random() * 30,
        vy: 0.6 + Math.random() * 0.4,
        size,
        tier,
        alpha: 0.5 + Math.random() * 0.3,
        targetX,
        landed: false,
        landY: 0,
        fadeTimer: 0,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Spawn dots
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.4 && dots.length < 30) {
        spawnTimer = 0;
        spawnDot();
      }

      // Draw buckets
      for (const bucket of buckets) {
        // Bucket walls
        ctx.strokeStyle = `${color}${hex(35)}`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        // Left wall
        ctx.beginPath();
        ctx.moveTo(bucket.x, bucketY);
        ctx.lineTo(bucket.x, bucketY + bucketHeight);
        ctx.stroke();

        // Right wall
        ctx.beginPath();
        ctx.moveTo(bucket.x + bucket.width, bucketY);
        ctx.lineTo(bucket.x + bucket.width, bucketY + bucketHeight);
        ctx.stroke();

        // Bottom
        ctx.beginPath();
        ctx.moveTo(bucket.x, bucketY + bucketHeight);
        ctx.lineTo(bucket.x + bucket.width, bucketY + bucketHeight);
        ctx.stroke();

        // Bucket fill glow
        const fillGrad = ctx.createLinearGradient(bucket.x, bucketY + bucketHeight, bucket.x, bucketY);
        const fillIntensity = Math.min(1, bucket.fillCount / 15);
        fillGrad.addColorStop(0, `${color}${hex(fillIntensity * 20)}`);
        fillGrad.addColorStop(1, `${color}00`);
        ctx.fillStyle = fillGrad;
        ctx.fillRect(bucket.x, bucketY, bucket.width, bucketHeight);

        // Bucket label
        ctx.fillStyle = `${color}${hex(40)}`;
        ctx.font = `${Math.min(11, bucket.width * 0.12)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(bucket.label, bucket.x + bucket.width / 2, bucketY + bucketHeight + 14);

        // Landing pulse
        if (bucket.pulseAlpha > 0) {
          bucket.pulseAlpha -= 0.02 * speedProp;
          ctx.strokeStyle = `${color}${hex(bucket.pulseAlpha * 255)}`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bucket.x + 2, bucketY + bucketHeight - 2);
          ctx.lineTo(bucket.x + bucket.width - 2, bucketY + bucketHeight - 2);
          ctx.stroke();
        }

        // Slowly decay fill count
        bucket.fillCount *= 0.998;
      }

      // Update and draw dots
      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];

        if (!dot.landed) {
          // Gravity and horizontal drift toward target
          dot.vy += 0.02 * speedProp;
          dot.y += dot.vy * speedProp;

          // Ease x toward target
          const dx = dot.targetX - dot.x;
          dot.x += dx * 0.02 * speedProp;

          // Check if landed in bucket
          const bucket = buckets[dot.tier];
          if (dot.y >= bucketY + bucketHeight - dot.size - 2) {
            dot.landed = true;
            dot.landY = bucketY + bucketHeight - dot.size - 2;
            dot.y = dot.landY;
            bucket.fillCount++;
            bucket.pulseAlpha = 0.3;

            // Spawn landing particles
            for (let p = 0; p < 3; p++) {
              particles.push({
                x: dot.x,
                y: dot.landY,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -(0.5 + Math.random() * 1),
                alpha: 0.4,
              });
            }
          }

          // Draw falling dot
          // Glow
          const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 3);
          glow.addColorStop(0, `${color}${hex(dot.alpha * 40)}`);
          glow.addColorStop(1, `${color}00`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${hex(dot.alpha * 200)}`;
          ctx.fill();
        } else {
          // Landed dot fades out
          dot.fadeTimer += 0.016 * speedProp;
          dot.alpha -= 0.01 * speedProp;

          if (dot.alpha <= 0) {
            dots.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${hex(dot.alpha * 150)}`;
          ctx.fill();
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * speedProp;
        p.y += p.vy * speedProp;
        p.vy += 0.03 * speedProp;
        p.alpha -= 0.015 * speedProp;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(p.alpha * 255)}`;
        ctx.fill();
      }

      // Faint guide lines from top to buckets
      for (const bucket of buckets) {
        const centerX = bucket.x + bucket.width / 2;
        ctx.beginPath();
        ctx.setLineDash([2, 6]);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, bucketY - 5);
        ctx.strokeStyle = `${color}${hex(8)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);
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

export default WalletTiers;
