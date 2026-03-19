"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import IntegrationRequestModal from "./IntegrationRequestModal";
import { menuItems } from "@/app/data/navigation";
import { SCRAMBLE_CHARS } from "@/app/data/stats";

const TARGET = "TORQUE";

// =============================================================================
// Scramble Text Component
// =============================================================================
function ScrambleText({ isHovered }: { isHovered: boolean }) {
  const [text, setText] = useState(TARGET);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iterationRef = useRef(0);

  const scramble = useCallback(() => {
    iterationRef.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setText(
        TARGET.split("")
          .map((char, index) => {
            if (index < iterationRef.current) {
              return TARGET[index];
            }
            return SCRAMBLE_CHARS.text[Math.floor(Math.random() * SCRAMBLE_CHARS.text.length)];
          })
          .join("")
      );

      if (iterationRef.current >= TARGET.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iterationRef.current += 0.5;
    }, 40);
  }, []);

  useEffect(() => {
    if (isHovered) {
      scramble();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setText(TARGET);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, scramble]);

  return (
    <span className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Unbounded', sans-serif" }}>
      {text}
    </span>
  );
}

// =============================================================================
// Glass Filter SVG Component
// =============================================================================
function GlassFilterSVG() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        <filter id="glass-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" seed="5" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="0.5" result="blurred" />
          <feSpecularLighting in="blurred" surfaceScale="2" specularConstant="0.8" specularExponent="20" lightingColor="white" result="specular">
            <fePointLight x="100" y="-50" z="200" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceGraphic" operator="in" result="specularComposite" />
          <feBlend in="SourceGraphic" in2="specularComposite" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

// =============================================================================
// Navbar Component
// =============================================================================
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [bannerHidden, setBannerHidden] = useState(false);
  const symbolRef = useRef<HTMLImageElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [bgOpacity, setBgOpacity] = useState(isHome ? 0 : 1);

  // Rotate symbol on scroll + fade in glass background + detect footer
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (symbolRef.current) {
            const rotation = window.scrollY * 0.15;
            symbolRef.current.style.transform = `rotate(${rotation}deg)`;
          }
          // Fade in bg over first 200px of scroll (homepage only)
          if (isHome) {
            setBgOpacity(Math.min(1, window.scrollY / 200));
            setBannerHidden(window.scrollY > 50);
          }
          // Hide navbar when scrolled into the footer reveal zone
          const distanceFromBottom =
            document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
          setIsFooterVisible(distanceFromBottom < window.innerHeight - 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    if (isMenuOpen) {
      const menuElement = document.getElementById("mobile-menu");
      if (menuElement) {
        setMenuHeight(menuElement.scrollHeight);
      }
    } else {
      setMenuHeight(0);
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <GlassFilterSVG />

      <header
        className={`fixed left-1/2 z-[1000] w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] transition-all duration-300 ease-in-out ${bannerHidden ? "top-4" : "top-12"}`}
        style={{
          transform: isFooterVisible
            ? "translateX(-50%) translateY(-120%)"
            : "translateX(-50%)",
        }}
      >
        {/* Glass background layer — fades in on scroll */}
        <GlassBackground opacity={bgOpacity} />

        {/* Content container */}
        <div
          className="relative flex items-center h-14 px-6 w-full rounded-[3px] border shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-150"
          style={{
            borderColor: `rgba(255,255,255,${bgOpacity * 0.3})`,
            boxShadow: `0 8px 32px rgba(0,0,0,${bgOpacity * 0.08}), 0 2px 8px rgba(0,0,0,${bgOpacity * 0.04})`,
          }}
        >
          {/* Left: Logo */}
          <Link
            href="/"
            className="relative group flex items-center flex-shrink-0 gap-2"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <Image
              ref={symbolRef}
              src="/logos/torque-symbol.svg"
              alt="Torque"
              width={32}
              height={28}
              className="h-7 w-auto transition-transform duration-150 ease-out will-change-transform"
            />
            <div
              className={`absolute left-[calc(100%+0.5rem)] transition-all duration-200 ${
                isLogoHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
            >
              <ScrambleText isHovered={isLogoHovered} />
            </div>
          </Link>

          {/* Center: Navigation — fades in on scroll */}
          <nav
            className="hidden lg:flex items-center justify-center flex-1 gap-1 transition-opacity duration-300"
            style={{ opacity: bgOpacity }}
          >
            {menuItems.map((item) => (
              <NavLink key={item.label} item={item} isActive={pathname === item.href} />
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-3">
<Button size="sm" onClick={() => setIsModalOpen(true)}>
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden ml-auto p-2 hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          menuHeight={menuHeight}
          pathname={pathname}
          onClose={closeMenu}
          onModalOpen={() => setIsModalOpen(true)}
        />
      </header>

      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// =============================================================================
// Glass Background Component
// =============================================================================
function GlassBackground({ opacity = 1 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 rounded-[3px] overflow-hidden transition-opacity duration-150" style={{ opacity }}>
      <div
        className="absolute inset-0 backdrop-blur-2xl"
        style={{ filter: "url(#glass-filter)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/70" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="absolute inset-0 rounded-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

// =============================================================================
// Nav Link Component
// =============================================================================
interface NavLinkProps {
  item: { label: string; href: string };
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      className={`px-4 py-2 font-body text-sm transition-colors ${
        isActive ? "text-black font-medium" : "text-black/60 hover:text-black"
      }`}
    >
      {item.label}
    </Link>
  );
}

// =============================================================================
// Mobile Menu Component
// =============================================================================
interface MobileMenuProps {
  menuHeight: number;
  pathname: string;
  onClose: () => void;
  onModalOpen: () => void;
}

function MobileMenu({ menuHeight, pathname, onClose, onModalOpen }: MobileMenuProps) {
  return (
    <div
      id="mobile-menu"
      className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/90 backdrop-blur-xl rounded-[3px] mt-2"
      style={{ maxHeight: `${menuHeight}px` }}
    >
      <nav className="px-6 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={`block py-3 font-body text-sm transition-colors ${
              pathname === item.href ? "text-black font-medium" : "text-black/60 hover:text-black"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <div className="pt-4 pb-2 space-y-3 border-t border-black/10 mt-2">
<Button onClick={onModalOpen} className="w-full">
            Launch App
          </Button>
        </div>
      </nav>
    </div>
  );
}
