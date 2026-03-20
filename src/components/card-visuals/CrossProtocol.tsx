"use client";

import React, { useEffect, useRef } from "react";

interface CrossProtocolProps {
  color?: string;
  className?: string;
  paused?: boolean;
  speed?: number;
}

export function CrossProtocol({ color = "#0000FF", className = "", paused = false, speed: speedProp = 1 }: CrossProtocolProps) {
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

    // Three nodes in a triangle
    const cx = w / 2;
    const cy = h * 0.45;
    const triRadius = Math.min(w, h) * 0.28;
    const nodeRadius = Math.min(w, h) * 0.055;

    interface Node {
      x: number;
      y: number;
      pulseAlpha: number;
      pulseRadius: number;
      baseAngle: number;
    }

    const nodes: Node[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      nodes.push({
        x: cx + Math.cos(angle) * triRadius,
        y: cy + Math.sin(angle) * triRadius,
        pulseAlpha: 0,
        pulseRadius: nodeRadius,
        baseAngle: angle,
      });
    }

    // Particles flowing between nodes along curved paths
    interface FlowParticle {
      fromNode: number;
      toNode: number;
      t: number; // 0-1 progress along curve
      speed: number;
      size: number;
      alpha: number;
    }

    const particles: FlowParticle[] = [];

    // Get curved path point between two nodes (quadratic bezier via center offset)
    const getCurvePoint = (from: Node, to: Node, t: number): { x: number; y: number } => {
      // Control point offset toward center then perpendicular
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      // Perpendicular offset toward center
      const nx = -dy * 0.15;
      const ny = dx * 0.15;
      // Determine which direction pushes toward center
      const cpx1 = mx + nx;
      const cpy1 = my + ny;
      const cpx2 = mx - nx;
      const cpy2 = my - ny;
      const d1 = Math.hypot(cpx1 - cx, cpy1 - cy);
      const d2 = Math.hypot(cpx2 - cx, cpy2 - cy);
      const cpx = d1 < d2 ? cpx1 : cpx2;
      const cpy = d1 < d2 ? cpy1 : cpy2;

      // Quadratic bezier
      const u = 1 - t;
      return {
        x: u * u * from.x + 2 * u * t * cpx + t * t * to.x,
        y: u * u * from.y + 2 * u * t * cpy + t * t * to.y,
      };
    };

    let spawnTimer = 0;
    let time = 0;

    const spawnParticle = () => {
      const fromNode = Math.floor(Math.random() * 3);
      let toNode = (fromNode + 1 + Math.floor(Math.random() * 2)) % 3;
      if (toNode === fromNode) toNode = (fromNode + 1) % 3;

      particles.push({
        fromNode,
        toNode,
        t: 0,
        speed: 0.006 + Math.random() * 0.004,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.5 + Math.random() * 0.3,
      });
    };

    // Seed some initial particles
    for (let i = 0; i < 5; i++) {
      const p: FlowParticle = {
        fromNode: Math.floor(Math.random() * 3),
        toNode: 0,
        t: Math.random(),
        speed: 0.006 + Math.random() * 0.004,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.5 + Math.random() * 0.3,
      };
      p.toNode = (p.fromNode + 1 + Math.floor(Math.random() * 2)) % 3;
      if (p.toNode === p.fromNode) p.toNode = (p.fromNode + 1) % 3;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.016 * speedProp;

      // Spawn particles
      spawnTimer += 0.016 * speedProp;
      if (spawnTimer > 0.3 && particles.length < 18) {
        spawnTimer = 0;
        spawnParticle();
      }

      // Draw curved connection paths between all node pairs
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          ctx.beginPath();
          for (let t = 0; t <= 1; t += 0.02) {
            const p = getCurvePoint(nodes[i], nodes[j], t);
            if (t === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = `${color}${hex(18)}`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw faint triangle fill
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.closePath();
      ctx.fillStyle = `${color}${hex(4)}`;
      ctx.fill();

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed * speedProp;

        if (p.t >= 1) {
          // Particle arrived — trigger pulse on target node
          nodes[p.toNode].pulseAlpha = 0.35;
          nodes[p.toNode].pulseRadius = nodeRadius;
          particles.splice(i, 1);
          continue;
        }

        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        const pos = getCurvePoint(from, to, p.t);

        // Particle glow
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4);
        glow.addColorStop(0, `${color}${hex(p.alpha * 50)}`);
        glow.addColorStop(1, `${color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(p.alpha * 220)}`;
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        // Outer glow
        const ng = ctx.createRadialGradient(node.x, node.y, nodeRadius * 0.5, node.x, node.y, nodeRadius * 2);
        ng.addColorStop(0, `${color}${hex(8)}`);
        ng.addColorStop(1, `${color}00`);
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}${hex(45)}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node fill
        const nf = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius);
        nf.addColorStop(0, `${color}${hex(12)}`);
        nf.addColorStop(1, `${color}${hex(4)}`);
        ctx.fillStyle = nf;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Center dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${hex(80)}`;
        ctx.fill();

        // Pulse ring
        if (node.pulseAlpha > 0) {
          node.pulseRadius += 0.8 * speedProp;
          node.pulseAlpha -= 0.006 * speedProp;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}${hex(node.pulseAlpha * 255)}`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Subtle rotating outer aura
      const auraRadius = triRadius * 1.3;
      const auraAngle = time * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, auraAngle, auraAngle + Math.PI * 0.6);
      ctx.strokeStyle = `${color}${hex(10)}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, auraAngle + Math.PI, auraAngle + Math.PI + Math.PI * 0.6);
      ctx.strokeStyle = `${color}${hex(8)}`;
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

export default CrossProtocol;
