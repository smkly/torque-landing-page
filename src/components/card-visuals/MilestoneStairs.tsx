"use client";

import React, { useEffect, useRef } from "react";

interface MilestoneStairsProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function MilestoneStairs({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: MilestoneStairsProps) {
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

    const stepCount = 6;
    const margin = w * 0.1;
    const stairWidth = w - margin * 2;
    const stairTop = h * 0.15;
    const stairBottom = h * 0.72;
    const stairHeight = stairBottom - stairTop;

    // Each step gets progressively wider
    interface Step {
      x: number;
      y: number;
      stepWidth: number;
      brightness: number;
      completed: boolean;
    }

    const steps: Step[] = [];
    for (let i = 0; i < stepCount; i++) {
      const fraction = i / (stepCount - 1);
      const stepW = stairWidth * (0.06 + fraction * 0.12);
      const x = margin + fraction * (stairWidth - stepW);
      const y = stairBottom - fraction * stairHeight;
      steps.push({ x, y, stepWidth: stepW, brightness: 0, completed: false });
    }

    // Burst particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      alpha: number;
      size: number;
    }

    const particles: Particle[] = [];

    // Climber state
    let climberStep = 0;
    let climberProgress = 0; // 0 to 1 within current step transition
    let climberX = steps[0].x + steps[0].stepWidth / 2;
    let climberY = steps[0].y;
    let pauseTimer = 0;
    let isPausing = false;

    let time = 0;

    const spawnBurst = (bx: number, by: number) => {
      const count = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.8 + Math.random() * 2;
        particles.push({
          x: bx, y: by,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.5,
          life: 1,
          alpha: 0.6 + Math.random() * 0.3,
          size: 1 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Update climber
      if (!isPausing) {
        climberProgress += 0.012 * speedProp;

        if (climberProgress >= 1) {
          climberProgress = 0;
          steps[climberStep].completed = true;
          steps[climberStep].brightness = 1;

          // Burst at completed step
          spawnBurst(
            steps[climberStep].x + steps[climberStep].stepWidth / 2,
            steps[climberStep].y
          );

          climberStep++;
          isPausing = true;
          pauseTimer = 0.3;

          // Reset if reached top
          if (climberStep >= stepCount) {
            climberStep = 0;
            climberProgress = 0;
            isPausing = true;
            pauseTimer = 1.2;
            // Reset steps
            for (const s of steps) s.completed = false;
          }
        }
      } else {
        pauseTimer -= 0.016 * speedProp;
        if (pauseTimer <= 0) {
          isPausing = false;
        }
      }

      // Interpolate climber position
      const currentStep = steps[climberStep];
      const nextStep = climberStep < stepCount - 1 ? steps[climberStep + 1] : currentStep;
      const eased = climberProgress * climberProgress * (3 - 2 * climberProgress); // smoothstep
      climberX = currentStep.x + currentStep.stepWidth / 2 + eased * (nextStep.x + nextStep.stepWidth / 2 - (currentStep.x + currentStep.stepWidth / 2));
      climberY = currentStep.y + eased * (nextStep.y - currentStep.y);

      // Draw connecting dotted line between steps
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      for (let i = 0; i < stepCount; i++) {
        const s = steps[i];
        const sx = s.x + s.stepWidth / 2;
        const sy = s.y;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = `${color}${hex(0.06 * 255)}`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw steps
      for (let i = 0; i < stepCount; i++) {
        const s = steps[i];

        // Decay brightness
        s.brightness *= 0.97;

        const isActive = i <= climberStep;
        const baseAlpha = isActive ? 0.2 : 0.06;
        const pulseAlpha = s.brightness * 0.5;
        const totalAlpha = baseAlpha + pulseAlpha;

        // Step platform
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.stepWidth, s.y);
        ctx.strokeStyle = `${color}${hex(totalAlpha * 255)}`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Step glow underneath
        if (totalAlpha > 0.1) {
          const sg = ctx.createLinearGradient(s.x, s.y, s.x, s.y + 12);
          sg.addColorStop(0, `${color}${hex(totalAlpha * 0.3 * 255)}`);
          sg.addColorStop(1, `${color}00`);
          ctx.fillStyle = sg;
          ctx.fillRect(s.x, s.y, s.stepWidth, 12);
        }

        // Step number dot
        const dotX = s.x + s.stepWidth / 2;
        const dotY = s.y;
        if (s.completed) {
          ctx.beginPath();
          ctx.fillStyle = `${color}${hex((0.3 + s.brightness * 0.4) * 255)}`;
          ctx.arc(dotX, dotY - 6, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.fillStyle = `${color}${hex(0.08 * 255)}`;
          ctx.arc(dotX, dotY - 6, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vertical riser between steps (subtle)
        if (i > 0) {
          const prev = steps[i - 1];
          ctx.beginPath();
          ctx.moveTo(s.x, prev.y);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = `${color}${hex(0.04 * 255)}`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw climber dot
      const climberGlow = ctx.createRadialGradient(climberX, climberY, 0, climberX, climberY, 12);
      climberGlow.addColorStop(0, `${color}${hex(0.35 * 255)}`);
      climberGlow.addColorStop(1, `${color}00`);
      ctx.fillStyle = climberGlow;
      ctx.beginPath();
      ctx.arc(climberX, climberY - 4, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `${color}${hex(0.8 * 255)}`;
      ctx.arc(climberX, climberY - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Climber trail
      const trailLen = 6;
      for (let t = 1; t <= trailLen; t++) {
        const trailFrac = t / trailLen;
        const trailAlpha = (1 - trailFrac) * 0.15;
        const prevProgress = Math.max(0, climberProgress - t * 0.05);
        const pe = prevProgress * prevProgress * (3 - 2 * prevProgress);
        const tx = currentStep.x + currentStep.stepWidth / 2 + pe * (nextStep.x + nextStep.stepWidth / 2 - (currentStep.x + currentStep.stepWidth / 2));
        const ty = currentStep.y + pe * (nextStep.y - currentStep.y);
        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(trailAlpha * 255)}`;
        ctx.arc(tx, ty - 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * speedProp;
        p.y += p.vy * speedProp;
        p.vy += 0.03 * speedProp; // slight gravity
        p.life -= 0.02 * speedProp;
        p.alpha = p.life * 0.6;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        pg.addColorStop(0, `${color}${hex(p.alpha * 0.4 * 255)}`);
        pg.addColorStop(1, `${color}00`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(p.alpha * 255)}`;
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
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

export default MilestoneStairs;
