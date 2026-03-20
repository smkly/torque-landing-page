"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const VISITED_KEY = "torque_visited";

interface PreloaderProps {
  onReveal?: () => void;
  onComplete?: () => void;
}

export function Preloader({ onReveal, onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Skip for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsDone(true);
      onReveal?.();
      onComplete?.();
      return;
    }

    // Skip for returning visitors
    try {
      if (localStorage.getItem(VISITED_KEY)) {
        setIsDone(true);
        onReveal?.();
        onComplete?.();
        return;
      }
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }

    // Lock scroll during preloader
    document.body.style.overflow = "hidden";

    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    // Get total path length for stroke-dasharray animation
    const length = path.getTotalLength();

    // Initial state: stroke hidden, no fill
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      fill: "transparent",
      stroke: "#010101",
      strokeWidth: 6,
    });

    gsap.set(svg, { opacity: 1, scale: 0.95, rotation: -90 });

    const tl = gsap.timeline();

    // Phase 1: Stroke draws in + gentle rotation (0 -> 0.7s)
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 0.7,
      ease: "power2.inOut",
    }, 0);

    tl.to(svg, {
      rotation: 0,
      scale: 1,
      duration: 0.7,
      ease: "power2.inOut",
    }, 0);

    // Phase 2: Fill fades in, stroke fades out (0.55 -> 0.85s)
    tl.to(path, {
      fill: "#010101",
      stroke: "transparent",
      duration: 0.3,
      ease: "power1.in",
    }, 0.55);

    // Phase 3: Brief pulse (0.85 -> 1.0s)
    tl.fromTo(svg, {
      scale: 1,
    }, {
      scale: 1.05,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    }, 0.85);

    // Phase 4: Signal reveal
    tl.call(() => {
      onReveal?.();
    }, undefined, 1.0);

    // Phase 5: Scale up + fade overlay away
    tl.to(svg, {
      scale: 1.5,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    }, 1.0);

    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.style.overflow = "";
        setIsDone(true);
        onComplete?.();

        // Mark as visited for future loads
        try {
          localStorage.setItem(VISITED_KEY, "1");
        } catch {
          // Ignore storage errors
        }
      },
    }, 1.05);

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 379.7 337.2"
        className="w-12 h-12 opacity-0"
      >
        <path
          ref={pathRef}
          d="M269.2,0H110.5c-11.2,0-21.5,5.9-27,15.6L4.2,153c-5.6,9.7-5.6,21.6,0,31.2l79.3,137.4c5.6,9.7,15.9,15.6,27,15.6h158.6c11.1,0,21.5-5.9,27-15.6l79.3-137.4c5.6-9.7,5.6-21.6,0-31.2L296.2,15.6c-5.6-9.7-15.9-15.6-27-15.6ZM210.1,180.3h140.6l-70.3,121.8-70.3-121.8ZM350.7,156.9h-136.1c-11.1,0-21.5-5.9-27-15.6L119.5,23.4h136.1c11.1,0,21.5,5.9,27,15.6l68.1,117.9ZM169.6,156.9H29L99.3,35.1l70.3,121.8ZM29,180.3h136.1c11.1,0,21.5,5.9,27,15.6l68.1,117.9H124c-11.2,0-21.5-5.9-27-15.6L29,180.3Z"
          fill="transparent"
          stroke="transparent"
        />
      </svg>
    </div>
  );
}
