"use client";

import React, { useEffect, useRef } from "react";

interface OddsMatrixProps {
  color?: string;
  className?: string;
  paused?: boolean;
}

export function OddsMatrix({ color = "#0000FF", className = "", paused = false }: OddsMatrixProps) {
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

    // Columns representing probability distribution
    const colCount = 8;

    interface OddsColumn {
      height: number;       // current height 0-1
      targetHeight: number;  // target height 0-1
      favorite: boolean;
      percentage: number;
    }

    const columns: OddsColumn[] = [];
    const marginX = w * 0.12;
    const colSpan = w - marginX * 2;
    const colWidth = 18;
    const colGap = (colSpan - colWidth * colCount) / (colCount - 1);
    const baseY = h * 0.78;
    const maxColHeight = h * 0.55;

    // Threshold lines
    const thresholds = [0.3, 0.5, 0.75];

    // Sparks
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }
    const sparks: Spark[] = [];

    // Initialize columns
    const favoriteIdx = 2; // one column is always the favorite
    for (let i = 0; i < colCount; i++) {
      const h2 = 0.15 + Math.random() * 0.7;
      columns.push({
        height: h2,
        targetHeight: h2,
        favorite: i === favoriteIdx,
        percentage: Math.round(h2 * 100),
      });
    }

    let time = 0;
    let shiftTimer = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // Shift odds every 2.5 seconds
      shiftTimer += 0.016;
      if (shiftTimer > 2.5) {
        shiftTimer = 0;
        columns.forEach((col) => {
          const oldTarget = col.targetHeight;
          col.targetHeight = 0.1 + Math.random() * 0.8;
          if (col.favorite) {
            col.targetHeight = Math.max(0.5, col.targetHeight); // favorite stays high
          }
        });
      }

      // Animate heights toward targets
      columns.forEach(col => {
        const diff = col.targetHeight - col.height;
        col.height += diff * 0.03;
        col.percentage = Math.round(col.height * 100);
      });

      // Draw threshold lines (horizontal dashes)
      thresholds.forEach(threshold => {
        const thresholdY = baseY - threshold * maxColHeight;

        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.moveTo(marginX - 10, thresholdY);
        ctx.lineTo(w - marginX + 10, thresholdY);
        ctx.strokeStyle = `${color}${hex(8)}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Threshold label
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = `${color}${hex(30)}`;
        ctx.fillText(`${Math.round(threshold * 100)}%`, marginX - 14, thresholdY + 4);
      });

      // Draw baseline
      ctx.beginPath();
      ctx.moveTo(marginX - 5, baseY);
      ctx.lineTo(w - marginX + 5, baseY);
      ctx.strokeStyle = `${color}${hex(12)}`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw columns
      columns.forEach((col, i) => {
        const x = marginX + i * (colWidth + colGap);
        const colH = col.height * maxColHeight;
        const colY = baseY - colH;
        const pulse = Math.sin(time * 1.5 + i * 0.8) * 0.5 + 0.5;

        const isFav = col.favorite;
        const baseAlpha = isFav ? 0.2 : 0.12;
        const fillAlpha = baseAlpha + pulse * 0.03;

        // Column glow (for favorite)
        if (isFav) {
          const cg = ctx.createLinearGradient(x + colWidth / 2, colY, x + colWidth / 2, baseY);
          cg.addColorStop(0, `${color}${hex(0.08 * 255)}`);
          cg.addColorStop(0.5, `${color}${hex(0.04 * 255)}`);
          cg.addColorStop(1, `${color}00`);
          ctx.fillStyle = cg;
          ctx.fillRect(x - 3, colY, colWidth + 6, colH);
        }

        // Column body gradient
        const colGrad = ctx.createLinearGradient(x, colY, x, baseY);
        colGrad.addColorStop(0, `${color}${hex(fillAlpha * 1.5 * 255)}`);
        colGrad.addColorStop(0.3, `${color}${hex(fillAlpha * 255)}`);
        colGrad.addColorStop(1, `${color}${hex(fillAlpha * 0.3 * 255)}`);
        ctx.fillStyle = colGrad;
        ctx.fillRect(x, colY, colWidth, colH);

        // Column border
        ctx.strokeStyle = `${color}${hex((baseAlpha + 0.04) * 255)}`;
        ctx.lineWidth = isFav ? 1.5 : 0.8;
        ctx.strokeRect(x, colY, colWidth, colH);

        // Top cap glow
        ctx.beginPath();
        ctx.fillStyle = `${color}${hex((0.15 + pulse * 0.05) * 255)}`;
        ctx.fillRect(x - 1, colY - 1, colWidth + 2, 2);

        // Check threshold crossings for sparks
        thresholds.forEach(threshold => {
          const thresholdY2 = baseY - threshold * maxColHeight;
          if (Math.abs(colY - thresholdY2) < 3) {
            // Near threshold - spark!
            if (Math.random() < 0.03) {
              for (let s = 0; s < 3; s++) {
                sparks.push({
                  x: x + colWidth / 2 + (Math.random() - 0.5) * 8,
                  y: thresholdY2,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -(0.5 + Math.random() * 1.5),
                  alpha: 0.6 + Math.random() * 0.4,
                  size: 1 + Math.random() * 1.5,
                });
              }
            }
          }
        });

        // Percentage label at top
        ctx.font = `bold ${isFav ? 13 : 11}px monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = `${color}${hex((isFav ? 0.35 : 0.2) * 255)}`;
        ctx.fillText(`${col.percentage}%`, x + colWidth / 2, colY - 10);

        // Favorite indicator
        if (isFav) {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = `${color}${hex(0.2 * 255)}`;
          ctx.fillText("FAV", x + colWidth / 2, colY - 22);
        }
      });

      // Draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.03; // slight gravity
        spark.alpha -= 0.015;

        if (spark.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        // Spark glow
        const sg = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, spark.size * 3);
        sg.addColorStop(0, `${color}${hex(spark.alpha * 80)}`);
        sg.addColorStop(1, `${color}00`);
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Spark core
        ctx.beginPath();
        ctx.fillStyle = `${color}${hex(spark.alpha * 255)}`;
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // "ODDS" label
      const labelAlpha = 0.06 + Math.sin(time * 0.5) * 0.02;
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = `${color}${hex(labelAlpha * 1.5 * 255)}`;
      ctx.fillText("PROBABILITY", w * 0.5, h * 0.12);

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
  }, [color]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
}

export default OddsMatrix;
