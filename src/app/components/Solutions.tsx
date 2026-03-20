"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Zap, Repeat, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualCard } from "@/components/card-visuals/VisualCard";
import { SplitText } from "@/components/animations/SplitText";

const VelocityFlow = dynamic(
  () => import("@/components/card-visuals/VelocityFlow").then(mod => ({ default: mod.VelocityFlow })),
  { ssr: false }
);
const LiquidityPool = dynamic(
  () => import("@/components/card-visuals/LiquidityPool").then(mod => ({ default: mod.LiquidityPool })),
  { ssr: false }
);
const RetentionLoop = dynamic(
  () => import("@/components/card-visuals/RetentionLoop").then(mod => ({ default: mod.RetentionLoop })),
  { ssr: false }
);

// =============================================================================
// Solution Card Component
// =============================================================================
interface SolutionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  filename: string;
  visual: React.ComponentType<{ color?: string; paused?: boolean }>;
  diagnosis: string;
  fix: string;
  visualFill?: "box" | "full";
}

function SolutionCard({ icon: Icon, title, subtitle, filename, visual: Visual, diagnosis, fix, visualFill }: SolutionCardProps) {
  return (
    <VisualCard
      visual={<Visual />}
      filename={filename}
      layout="adaptive"
      visualFill={visualFill}
    >
      <div className="relative w-8 h-8 rounded-[3px] bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-blue/10 transition-colors">
        <Icon className="w-4 h-4 text-black group-hover:text-blue transition-colors" />
      </div>

      <h3 className="relative font-display text-base md:text-lg font-medium text-black mb-1 group-hover:text-blue transition-colors">
        {title}
      </h3>
      <p className="relative text-[10px] font-mono uppercase tracking-wider text-black/50 mb-3">
        {subtitle}
      </p>

      <div className="relative space-y-2 mb-4">
        <div className="p-3 border-l-2 border-black/20 rounded-r-[2px]">
          <span className="text-[9px] font-mono uppercase tracking-wider text-black/40 block mb-0.5">diagnosis</span>
          <p className="text-xs text-black/70">{diagnosis}</p>
        </div>
        <div className="p-3 border-l-2 border-blue rounded-r-[2px]">
          <span className="text-[9px] font-mono uppercase tracking-wider text-black/40 block mb-0.5">the fix</span>
          <p className="text-xs text-black">{fix}</p>
        </div>
      </div>

      <a href="/playbooks" className="relative inline-flex items-center text-xs text-blue hover:text-black transition-colors font-medium">
        View Strategy <ArrowUpRight className="w-3 h-3 ml-1" />
      </a>
    </VisualCard>
  );
}

// =============================================================================
// Solutions Section
// =============================================================================
export default function Solutions() {
  return (
    <div className="relative z-10 w-full py-32 md:py-52 bg-white">
      <div className="relative w-full px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]">
              <span className="w-1.5 h-1.5 bg-blue rounded-full animate-pulse" />
              <span>The Solutions</span>
            </div>

            <SplitText tag="h2" className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-black mb-6 max-w-4xl leading-[1.1] tracking-tight">
              <span>Your Protocol Has</span>
              <span className="text-black/40">a Leaky Bucket</span>
            </SplitText>

            <p data-animate="fade-up" className="text-lg md:text-xl text-black/60 max-w-2xl">
              You know where users drop off. Fix it.
            </p>
          </div>
          <div data-animate="fade-up">
            <Button variant="outline" href="/solutions" className="w-fit">
              View Solutions
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Solution Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div data-animate="fade-up">
            <SolutionCard
              icon={Zap}
              title="Trading Apps & Terminals"
              subtitle="Mercenary Trader Problem"
              filename="trading.strategy"
              visual={RetentionLoop}
              diagnosis="Users trade once for the airdrop and ghost, leaving you with rented volume."
              fix="Streaks and lotteries that reward consistency over size."
            />
          </div>
          <div data-animate="fade-up">
            <SolutionCard
              icon={Repeat}
              title="DEXs & Aggregators"
              subtitle="Zero Switching Cost Problem"
              filename="dex.strategy"
              visual={LiquidityPool}
              diagnosis="Users route wherever fees are cheapest and leave the moment a better rate appears."
              fix="Leaderboards and referrals that give users a reason to stay."
            />
          </div>
          <div data-animate="fade-up">
            <SolutionCard
              icon={Coins}
              title="Tokens & Stablecoins"
              subtitle="Dead Liquidity Problem"
              filename="token.strategy"
              visual={VelocityFlow}
              visualFill="full"
              diagnosis="High market cap, zero velocity. Your token sits in wallets doing nothing."
              fix="Referral rebates and spend rewards that push holders to transact."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
