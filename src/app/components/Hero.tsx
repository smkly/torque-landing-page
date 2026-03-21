"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Terminal, ChevronDown } from "lucide-react";
import TrustBar from "./TrustBar";
import { heroStats } from "@/app/data/stats";
import { SplitText } from "@/components/animations/SplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "@/components/providers/GsapProvider";

gsap.registerPlugin(ScrollTrigger);

const TorqueHelicoid = dynamic(
  () => import("@/components/three/TorqueHelicoid").then(mod => ({ default: mod.TorqueHelicoid })),
  { ssr: false }
);
const IntegrationRequestModal = dynamic(
  () => import("./IntegrationRequestModal"),
  { ssr: false }
);

// =============================================================================
// Interactive Gradient Background
// =============================================================================
function InteractiveGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Top fade for navbar blend */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}

// =============================================================================
// Hero — ASCII Helicoid background with left-aligned content
// =============================================================================
const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { ready } = useGsap();

  // Refs for staggered entrance animation
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Orchestrated hero entrance timeline
  useEffect(() => {
    if (!ready) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      [badgeRef, subtitleRef, buttonsRef, statsRef, scrollHintRef].forEach(
        (ref) => {
          if (!ref.current) return;
          gsap.set(ref.current, { opacity: 1, y: 0, filter: "none" });
          // Also reveal children for buttons/stats
          gsap.set(ref.current.children, { opacity: 1, y: 0 });
        }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. SplitText headline handles itself (delay: 0.1, stagger: 0.3)

      // 2. Badge — drops in after headline
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -15, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        0.8
      );

      // 3. Subtitle — fades up with blur dissolve
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
        1.0
      );

      // 4. Buttons — slide up one at a time
      if (buttonsRef.current) {
        tl.fromTo(
          Array.from(buttonsRef.current.children),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.15 },
          1.3
        );
      }

      // 5. Stats — load at same time as buttons (1.3s)
      if (statsRef.current) {
        const statEls = Array.from(statsRef.current.children);
        gsap.set(statEls, { opacity: 0, y: 25 });

        tl.to(statEls, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.15,
          ease: "power3.out",
        }, 1.3);
      }

      // 6. Scroll hint — fade in, then hide on scroll
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        1.8
      );

      if (scrollHintRef.current) {
        gsap.to(scrollHintRef.current, {
          opacity: 0,
          y: -5,
          scrollTrigger: {
            trigger: scrollHintRef.current,
            start: "top 98%",
            end: "top 60%",
            scrub: 1.5,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [ready]);

  return (
    <>
      <section className="relative w-full h-screen">
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <InteractiveGradient />

          {/* ASCII Helicoid — top 40% on mobile with fade, full viewport on desktop */}
          <div className="absolute inset-x-0 top-0 h-[40%] md:h-full md:inset-0 overflow-hidden">
            <TorqueHelicoid />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none md:hidden" />
          </div>

          {/* Bottom fade — soft transition to white content */}
          <div className="absolute inset-x-0 bottom-0 h-48 z-10 pointer-events-none bg-gradient-to-b from-transparent via-white/50 to-white" />

        </div>

        {/* Hero content — overlays the scene (pointer-events-none so drag reaches helicoid) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="w-full h-full flex flex-col justify-end pointer-events-none px-[1.5rem] md:px-[3.5rem] lg:px-[4.5rem] pb-12">
            {/* Bottom row: hero text left, stats right */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              {/* Left — Hero content */}
              <div className="flex flex-col items-start text-left max-w-2xl">
                {/* Terminal Tag */}
                <div
                  ref={badgeRef}
                  className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]"
                  style={{ opacity: 0 }}
                >
                  <Terminal className="w-3 h-3" />
                  <span>$3B+ in volume driven</span>
                  <span className="w-1.5 h-1.5 bg-blue rounded-full animate-pulse" />
                </div>

                {/* Main Headline — SplitText line reveal */}
                <SplitText
                  tag="h1"
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-semibold leading-[1.1] tracking-tight mb-6 text-black"
                  delay={0.1}
                  stagger={0.3}
                  useScrollTrigger={false}
                >
                  <span>Launch Incentives.</span>
                  <span>Prove ROI.</span>
                </SplitText>

                {/* Subheadline */}
                <p
                  ref={subtitleRef}
                  className="text-lg md:text-xl text-black/60 mb-8 leading-relaxed"
                  style={{ opacity: 0 }}
                >
                  Incentive infrastructure for onchain protocols and tokens. Launch today. Measure tomorrow. 5x by next month.
                </p>

                {/* Action Buttons */}
                <div
                  ref={buttonsRef}
                  className="flex flex-col sm:flex-row items-start gap-4 pointer-events-auto"
                >
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="accent"
                    className="group"
                    style={{ opacity: 0 }}
                  >
                    Book a Demo
                    <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    href="/primitives"
                    style={{ opacity: 0 }}
                  >
                    See How It Works
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right — Stats */}
              <div
                ref={statsRef}
                className="flex flex-row items-start gap-6 sm:gap-8 lg:gap-10"
              >
                {heroStats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-start" style={{ opacity: 0 }}>
                    <span className="text-xl md:text-2xl lg:text-3xl font-display font-semibold text-black tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-xs text-black/50 mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll hint */}
            <div ref={scrollHintRef} className="mt-8" style={{ opacity: 0 }}>
              <div className="flex items-center gap-2 text-black/40">
                <span className="font-mono text-xs uppercase tracking-wider">Scroll to explore</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Request Modal */}
      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Hero;
