"use client";

import React, { useEffect, useRef } from "react";

interface AirdropShowerProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function AirdropShower({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: AirdropShowerProps) {
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

    // Wallet slots at the bottom
    const walletY = h * 0.82;
    const numWallets = 5;
    const walletSpacing = w / (numWallets + 1);
    const walletWidth = Math.min(24, walletSpacing * 0.5);

    interface Wallet {
      x: number;
      hasShield: boolean;
      glowAlpha: number;
    }

    const wallets: Wallet[] = [];
    for (let i = 0; i < numWallets; i++) {
      const x = walletSpacing * (i + 1);
      // ~40% have shields
      const hasShield = i === 1 || i === 3;
      wallets.push({ x, hasShield, glowAlpha: 0 });
    }

    // Shield barriers above some wallets
    const shieldY = walletY - 30;
    const shieldWidth = walletWidth * 1.8;

    // Falling token drops
    interface TokenDrop {
      x: number;
      y: number;
      vy: number;
      size: number;
      alpha: number;
      targetWallet: number;
      deflected: boolean;
      dvx: number; // deflection velocity x
      dvy: number; // deflection velocity y
    }

    const drops: TokenDrop[] = [];

    // Contact glow particles
    interface GlowParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }

    const glowParticles: GlowParticle[] = [];

    // Shield spark particles
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
    }

    const sparks: Spark[] = [];

    let spawnTimer = 0;
    let time = 0;

    const spawnDrop = () => {
      // Pick a target wallet
      const targetWallet = Math.floor(Math.random() * numWallets);
      const wallet = wallets[targetWallet];
      // Start near the top, somewhat aligned to target
      const startX = wallet.x + (Math.random() - 0.5) * walletSpacing * 0.6;

      drops.push({
        x: startX,
        y: -5 - Math.random() * 20,
        vy: 0.5 + Math.random() * 0.3,
        size: 2 + Math.random() * 1.5,
        alpha: 0.4 + Math.random() * 0.3,
        targetWallet,
        deflected: false,
        dvx: 0,
        dvy: 0,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Spawn drops
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.15 && drops.length < 40) {
        spawnTimer = 0;
        spawnDrop();
      }

      // Draw wallets
      for (const wallet of wallets) {
        // Wallet line
        ctx.beginPath();
        ctx.moveTo(wallet.x - walletWidth / 2, walletY);
        ctx.lineTo(wallet.x + walletWidth / 2, walletY);
        ctx.strokeStyle = `${color}${hex(50)}`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Small bracket ends
        ctx.beginPath();
        ctx.moveTo(wallet.x - walletWidth / 2, walletY);
        ctx.lineTo(wallet.x - walletWidth / 2, walletY - 4);
        ctx.moveTo(wallet.x + walletWidth / 2, walletY);
        ctx.lineTo(wallet.x + walletWidth / 2, walletY - 4);
        ctx.strokeStyle = `${color}${hex(35)}`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow on receive
        if (wallet.glowAlpha > 0) {
          wallet.glowAlpha -= 0.015 * speedProp;
          const glow = ctx.createRadialGradient(wallet.x, walletY, 0, wallet.x, walletY, walletWidth * 1.5);
          glow.addColorStop(0, `${color}${hex(wallet.glowAlpha * 100)}`);
          glow.addColorStop(1, `${color}00`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(wallet.x, walletY, walletWidth * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shield above blocked wallets
        if (wallet.hasShield) {
          // Shield arc
          ctx.beginPath();
          ctx.arc(wallet.x, shieldY + 5, shieldWidth / 2, Math.PI, 0);
          ctx.strokeStyle = `${color}${hex(30 + Math.sin(time * 2 + wallet.x) * 8)}`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Shield glow
          const sg = ctx.createRadialGradient(wallet.x, shieldY, 0, wallet.x, shieldY, shieldWidth);
          sg.addColorStop(0, `${color}${hex(6)}`);
          sg.addColorStop(1, `${color}00`);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(wallet.x, shieldY, shieldWidth, 0, Math.PI * 2);
          ctx.fill();

          // Small shield icon
          ctx.beginPath();
          ctx.moveTo(wallet.x, shieldY - 5);
          ctx.lineTo(wallet.x - 4, shieldY - 2);
          ctx.lineTo(wallet.x - 4, shieldY + 2);
          ctx.lineTo(wallet.x, shieldY + 5);
          ctx.lineTo(wallet.x + 4, shieldY + 2);
          ctx.lineTo(wallet.x + 4, shieldY - 2);
          ctx.closePath();
          ctx.strokeStyle = `${color}${hex(25)}`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Update and draw drops
      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        const wallet = wallets[drop.targetWallet];

        if (drop.deflected) {
          // Deflected motion
          drop.x += drop.dvx * speedProp;
          drop.y += drop.dvy * speedProp;
          drop.dvy += 0.03 * speedProp;
          drop.alpha -= 0.012 * speedProp;

          if (drop.alpha <= 0 || drop.y > h + 10) {
            drops.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${hex(drop.alpha * 150)}`;
          ctx.fill();
        } else {
          // Fall toward wallet
          drop.vy += 0.01 * speedProp;
          drop.y += drop.vy * speedProp;

          // Drift toward target
          const dx = wallet.x - drop.x;
          drop.x += dx * 0.01 * speedProp;

          // Check shield collision
          if (wallet.hasShield && drop.y >= shieldY - 5 && drop.y <= shieldY + 8) {
            const distX = Math.abs(drop.x - wallet.x);
            if (distX < shieldWidth / 2) {
              drop.deflected = true;
              drop.dvx = (drop.x - wallet.x) * 0.08 + (Math.random() - 0.5) * 1.5;
              drop.dvy = -drop.vy * 0.5 - Math.random() * 0.5;

              // Sparks
              for (let s = 0; s < 3; s++) {
                sparks.push({
                  x: drop.x,
                  y: shieldY,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -(0.5 + Math.random() * 1.5),
                  alpha: 0.5 + Math.random() * 0.3,
                });
              }
              continue;
            }
          }

          // Check wallet arrival
          if (drop.y >= walletY - 3) {
            // Received
            wallet.glowAlpha = 0.5;

            // Contact particles
            for (let p = 0; p < 2; p++) {
              glowParticles.push({
                x: drop.x,
                y: walletY,
                vx: (Math.random() - 0.5) * 1,
                vy: -(0.3 + Math.random() * 0.8),
                alpha: 0.5,
                size: 1 + Math.random(),
              });
            }

            drops.splice(i, 1);
            continue;
          }

          // Draw falling drop
          // Glow
          const dg = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, drop.size * 3);
          dg.addColorStop(0, `${color}${hex(drop.alpha * 50)}`);
          dg.addColorStop(1, `${color}00`);
          ctx.fillStyle = dg;
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${hex(drop.alpha * 200)}`;
          ctx.fill();

          // Small tail
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y - drop.size);
          ctx.lineTo(drop.x, drop.y - drop.size - drop.vy * 3);
          ctx.strokeStyle = `${color}${hex(drop.alpha * 80)}`;
          ctx.lineWidth = drop.size * 0.6;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }

      // Update and draw glow particles
      for (let i = glowParticles.length - 1; i >= 0; i--) {
        const p = glowParticles[i];
        p.x += p.vx * speedProp;
        p.y += p.vy * speedProp;
        p.alpha -= 0.018 * speedProp;

        if (p.alpha <= 0) {
          glowParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(p.alpha * 255)}`;
        ctx.fill();
      }

      // Update and draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * speedProp;
        s.y += s.vy * speedProp;
        s.vy += 0.04 * speedProp;
        s.alpha -= 0.02 * speedProp;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(s.alpha * 255)}`;
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

export default AirdropShower;
