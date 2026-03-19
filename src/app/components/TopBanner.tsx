"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function TopBanner() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHidden(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[1001] bg-blue text-white text-center py-2 px-4 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link
        href="https://docs.torque.so/mcp"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:opacity-80 transition-opacity"
      >
        Get started quickly — try our MCP
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
