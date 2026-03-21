"use client";

import React from "react";
import Image from "next/image";

const logos = [
  { name: "Raydium", src: "/logos/raydium.svg" },
  { name: "Axiom", src: "/logos/axiom.svg" },
  { name: "USD1", src: "/logos/usd1.svg" },
  { name: "Metaplex", src: "/logos/metaplex.svg" },
  { name: "Solana", src: "/logos/solana.svg" },
];

export default function TrustBar({ trailing }: { trailing?: React.ReactNode }) {
  return (
    <section className="w-full py-8 overflow-hidden bg-transparent">
      <div className="w-full flex flex-col items-center">
        <p
          data-animate="fade-up"
          className="font-mono text-xs uppercase tracking-wider text-black/40 mb-8 text-center"
        >
          Trusted by Leading Companies
        </p>

        {/* Logos */}
        <div
          data-animate="fade-up"
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12"
        >
          {logos.map((logo) => (
            <div
              key={logo.name}
              data-animate="fade-up"
              className="h-14 flex items-center justify-center opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105 transition-all duration-300 group"
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={160}
                height={56}
                className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,0,255,0.3)]"
              />
            </div>
          ))}
          {trailing}
        </div>

        {/* Social proof stat */}
        <p
          data-animate="fade-up"
          className="font-mono text-xs text-black/30 mt-6 text-center"
        >
          $5B+ in incentivized volume across 1,000+ campaigns
        </p>

        {/* Testimonial — hidden for now */}
      </div>
    </section>
  );
}
