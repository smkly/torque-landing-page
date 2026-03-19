"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Orientation } from "@/components/card-visuals/useOrientation";

type CardVisualState = "OFF_SCREEN" | "PREVIEWING" | "IDLE" | "PLAYING";

interface CardVisualWrapperProps {
  children: React.ReactElement;
  aspectRatio?: string;
  speed?: number;
  color?: string;
  orientation?: Orientation;
  className?: string;
  threshold?: number;
  previewDuration?: number;
}

export function CardVisualWrapper({
  children,
  aspectRatio,
  speed = 1,
  color,
  orientation,
  className,
  threshold = 0.3,
  previewDuration = 1500,
}: CardVisualWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CardVisualState>("OFF_SCREEN");
  const [isMobile, setIsMobile] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPreviewedRef = useRef(false);

  // Detect touch/mobile device
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (isMobile) {
            setState("PLAYING");
          } else if (!hasPreviewedRef.current) {
            setState("PREVIEWING");
            hasPreviewedRef.current = true;
            previewTimerRef.current = setTimeout(() => {
              setState((prev) => (prev === "PREVIEWING" ? "IDLE" : prev));
            }, previewDuration);
          } else {
            setState("IDLE");
          }
        } else {
          setState("OFF_SCREEN");
          if (previewTimerRef.current) {
            clearTimeout(previewTimerRef.current);
            previewTimerRef.current = null;
          }
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [isMobile, threshold, previewDuration]);

  // Hover detection: attach to nearest ancestor with 'group' class,
  // since the wrapper itself may be behind content with higher z-index
  useEffect(() => {
    if (isMobile) return;

    let target: HTMLElement | null = wrapperRef.current;
    let el: HTMLElement | null = target;
    while (el) {
      if (el.classList.contains("group")) {
        target = el;
        break;
      }
      el = el.parentElement;
    }
    if (!target) return;

    const onEnter = () => {
      setState((prev) => {
        if (prev === "OFF_SCREEN") return prev;
        if (previewTimerRef.current) {
          clearTimeout(previewTimerRef.current);
          previewTimerRef.current = null;
        }
        return "PLAYING";
      });
    };

    const onLeave = () => {
      setState((prev) => (prev === "PLAYING" ? "IDLE" : prev));
    };

    target.addEventListener("mouseenter", onEnter);
    target.addEventListener("mouseleave", onLeave);

    const cleanup = target;
    return () => {
      cleanup?.removeEventListener("mouseenter", onEnter);
      cleanup?.removeEventListener("mouseleave", onLeave);
    };
  }, [isMobile]);

  const paused = state === "OFF_SCREEN" || state === "IDLE";

  const childProps: Record<string, unknown> = { paused, speed };
  if (color !== undefined) {
    childProps.color = color;
  }
  if (orientation !== undefined) {
    childProps.orientation = orientation;
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {React.cloneElement(children, childProps)}
    </div>
  );
}
