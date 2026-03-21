"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FaXTwitter } from "react-icons/fa6";

const FooterAsciiLogo = dynamic(
  () => import("@/components/three/FooterAsciiLogo").then(m => ({ default: m.FooterAsciiLogo })),
  { ssr: false }
);
import { Mail, CheckCircle2, ArrowUpRight, Rocket } from "lucide-react";
import { useForm } from "@formspree/react";
import { Button } from "@/components/ui/button";
import IntegrationRequestModal from "./IntegrationRequestModal";
import { SCRAMBLE_CHARS } from "@/app/data/stats";

const TORQUE_TEXT = "TORQUE";

function ScrambleLetter({ char }: { char: string }) {
  const [display, setDisplay] = useState(char);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    if (isHovered) {
      countRef.current = 0;
      intervalRef.current = setInterval(() => {
        countRef.current++;
        if (countRef.current > 6) {
          setDisplay(char);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setDisplay(SCRAMBLE_CHARS.text[Math.floor(Math.random() * SCRAMBLE_CHARS.text.length)]);
        }
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplay(char);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, char]);

  return (
    <span
      className="relative inline-block cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="invisible">{char}</span>
      <span className="absolute inset-0 flex items-center justify-center">{display}</span>
    </span>
  );
}

const Footer = () => {
  const [state, handleSubmit] = useForm("mqapdody");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const productLinks = [
    { label: "Platform", href: "/platform" },
    { label: "Solutions", href: "/solutions" },
    { label: "Playbooks", href: "/playbooks" },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ];


  const socialLinks = [
    { icon: FaXTwitter, href: "https://x.com/torqueprotocol", label: "Twitter" },
    { icon: Mail, href: "mailto:contact@torque.so", label: "Email" },
  ];

  return (
    <footer id="site-footer" className="fixed bottom-0 left-0 w-full h-screen overflow-hidden bg-blue z-0 flex flex-col">

      {/* ASCII Hexa Logo background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <FooterAsciiLogo />
      </div>

      {/* Big TORQUE Text — hidden */}
      {/* <div className="relative z-10 w-full" data-animate="fade-in">
        <div
          className="text-[20vw] font-bold leading-[0.85] tracking-[-0.05em] text-white/10 select-none overflow-hidden"
          style={{ fontFamily: "'Unbounded', sans-serif" }}
        >
          {TORQUE_TEXT.split("").map((char, i) => (
            <ScrambleLetter key={i} char={char} />
          ))}
        </div>
      </div> */}

      {/* Footer Content */}
      <div className="relative z-10 w-full px-6 md:px-8 lg:px-[4.5rem] pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logos/torque-symbol.svg"
                alt="Torque"
                width={32}
                height={28}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Incentive infrastructure for onchain protocols and tokens.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="strobe-glitch w-10 h-10 rounded-[3px] border border-white bg-transparent flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-6">
              Product
            </h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Start Building Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-6">
              Get Started
            </h4>
            <p className="text-white/60 text-sm mb-4">
              Launch your first campaign in under 24 hours.
            </p>
            <Button variant="inverse-outline" href="https://app.torque.so">
              Launch App
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* CTA + Newsletter Section */}
      <div className="relative z-10 w-full px-6 md:px-8 lg:px-[4.5rem] py-10 border-t border-white/10 mt-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8 items-end">
          {/* CTA */}
          <div className="lg:col-span-3 max-w-xl">
            <div className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-white/40">
              <Rocket className="w-3 h-3" />
              Let&apos;s Talk
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white leading-[1.1] tracking-tight mb-4">
              Start running incentives{" "}
              <span className="text-white/40">that actually work.</span>
            </h2>
            <p className="text-base text-white/60 mb-6">
              Talk to our team and get your first campaign live in under 24 hours.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="inverse" onClick={() => setIsModalOpen(true)}>
                Book a Demo
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="inverse-outline" href="/playbooks">
                View Playbooks
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">
              Stay in the loop
            </h4>
            {state.succeeded ? (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                You&apos;re subscribed.
              </div>
            ) : (
              <>
                <p className="text-white/60 text-sm mb-3">
                  Protocol updates, zero noise.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="flex-1 min-w-0 h-10 px-3 bg-white/5 border border-white/20 rounded-[3px] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
                  />
                  <input type="hidden" name="_subject" value="Newsletter signup" />
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="h-10 px-4 bg-white text-black text-sm font-medium rounded-[3px] hover:bg-white/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {state.submitting ? "..." : "Subscribe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar — pinned to bottom */}
      <div className="relative z-10 border-t border-white/10 mt-auto">
        <div className="w-full px-6 md:px-8 lg:px-[4.5rem] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-mono text-xs text-white/50">
              © {currentYear} Torque Labs. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="font-mono text-xs text-white/50 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="font-mono text-xs text-white/50 hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
