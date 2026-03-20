"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollState {
  progress: number;
  velocity: number;
  direction: number;
  isScrolling: boolean;
  scrollY: number;
}

interface ScrollContextValue extends ScrollState {
  scrollTo: (target: string | number | HTMLElement, options?: object) => void;
}

const ScrollContext = createContext<ScrollContextValue>({
  progress: 0,
  velocity: 0,
  direction: 0,
  isScrolling: false,
  scrollY: 0,
  scrollTo: () => {},
});

export function useScrollContext() {
  return useContext(ScrollContext);
}

interface ScrollProviderProps {
  children: React.ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    progress: 0,
    velocity: 0,
    direction: 0,
    isScrolling: false,
    scrollY: 0,
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: object) => {
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const dt = now - lastTime.current;

      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? currentY / documentHeight : 0;

      const delta = currentY - lastScrollY.current;
      const velocity = dt > 0 ? delta / (dt / 1000) : 0;
      const direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;

      lastScrollY.current = currentY;
      lastTime.current = now;

      setScrollState({
        progress: Math.min(Math.max(progress, 0), 1),
        velocity,
        direction,
        isScrolling: true,
        scrollY: currentY,
      });

      // Update ScrollTrigger on each scroll event
      ScrollTrigger.update();

      // Reset isScrolling after scroll stops
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setScrollState((prev) => ({ ...prev, isScrolling: false }));
      }, 150);
    };

    // Initialize values
    lastScrollY.current = window.scrollY;
    lastTime.current = performance.now();

    window.addEventListener("scroll", onScroll, { passive: true });

    // Keep GSAP ticker running for ScrollTrigger (needed for pinned animations etc.)
    const tickerCallback = () => {
      ScrollTrigger.update();
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.ticker.remove(tickerCallback);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        ...scrollState,
        scrollTo,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export default ScrollProvider;
