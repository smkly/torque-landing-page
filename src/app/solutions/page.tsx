"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Coins,
  Repeat,
  Rocket,
  Terminal,
  TrendingUp,
  Landmark,
  Network,
} from "lucide-react";
import { ImageGradient } from "@/components/ascii/ImageGradient";
import { CardVisualWrapper } from "@/components/card-visuals/CardVisualWrapper";
import { SplitText } from "@/components/animations/SplitText";

const IntegrationRequestModal = dynamic(
  () => import("../components/IntegrationRequestModal"),
  { ssr: false }
);
const RankOrbit = dynamic(
  () => import("@/components/card-visuals/RankOrbit").then(mod => ({ default: mod.RankOrbit })),
  { ssr: false }
);
const StreakChain = dynamic(
  () => import("@/components/card-visuals/StreakChain").then(mod => ({ default: mod.StreakChain })),
  { ssr: false }
);
const TrophyBurst = dynamic(
  () => import("@/components/card-visuals/TrophyBurst").then(mod => ({ default: mod.TrophyBurst })),
  { ssr: false }
);
const VelocityFlow = dynamic(
  () => import("@/components/card-visuals/VelocityFlow").then(mod => ({ default: mod.VelocityFlow })),
  { ssr: false }
);
const DurationLock = dynamic(
  () => import("@/components/card-visuals/DurationLock").then(mod => ({ default: mod.DurationLock })),
  { ssr: false }
);
const AnchorLock = dynamic(
  () => import("@/components/card-visuals/AnchorLock").then(mod => ({ default: mod.AnchorLock })),
  { ssr: false }
);
const GrowthBars = dynamic(
  () => import("@/components/card-visuals/GrowthBars").then(mod => ({ default: mod.GrowthBars })),
  { ssr: false }
);
const OddsMatrix = dynamic(
  () => import("@/components/card-visuals/OddsMatrix").then(mod => ({ default: mod.OddsMatrix })),
  { ssr: false }
);
const _LoyaltyLayers = dynamic(
  () => import("@/components/card-visuals/LoyaltyLayers").then(mod => ({ default: mod.LoyaltyLayers })),
  { ssr: false }
);

// =============================================================================
// Types
// =============================================================================
interface Solution {
  id: string;
  sector: string;
  icon: React.ComponentType<{ className?: string }>;
  filename: string;
  image: string;
  insight: {
    title: string;
    stat: string;
  };
  problem: {
    title: string;
    points: string[];
  };
  fix: {
    title: string;
    description: string;
    mechanics: string[];
    result: string;
  };
}

// Objective interface removed, now using ObjectiveGroup

// =============================================================================
// Data: Objectives with their vertical solution cards
// =============================================================================
interface ObjectiveGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keyStat: string;
  keyStatLabel: string;
  oneLiner: string;
  primitives: string[];
  solutions: Solution[];
}

const objectiveGroups: ObjectiveGroup[] = [
  {
    id: "trading-volume",
    label: "Trading Volume",
    icon: TrendingUp,
    keyStat: "$405",
    keyStatLabel: "in volume per $1 on leaderboard rewards",
    oneLiner: "Drive real trading activity, not rented volume that disappears when rewards stop.",
    primitives: ["Leaderboards", "Raffles", "Rebates", "Streaks"],
    solutions: [
      {
        id: "dexs",
        sector: "DEXs",
        icon: Repeat,
        filename: "dex.strategy",
        image: "/generated/image/light-mono/value-stack-light.jpg",
        insight: { title: "Volume & Retention", stat: "$405 volume per $1 on leaderboard rewards." },
        problem: { title: "Zero Switching Costs", points: ["Users route wherever fees are cheapest, zero loyalty", "Top 50 wallets drive 41% of daily volume on high-reward days", "Volume disappears when rewards stop"] },
        fix: { title: "Layer leaderboards with raffles.", description: "Leaderboards concentrate whale volume ($405:$1). Raffles grow small traders, claimers increased volume 3x.", mechanics: ["Trader Leaderboards (ranked weekly)", "Daily & Weekly Raffles", "Creator Rebates"], result: "$405 volume per $1 spent" },
      },
      {
        id: "terminals",
        sector: "Trading Terminals",
        icon: Terminal,
        filename: "terminal.strategy",
        image: "/generated/image/light-mono/network-nodes-light.jpg",
        insight: { title: "Loyalty & Retention", stat: "9.4x more likely to become power users." },
        problem: { title: "Mercenary Traders", points: ["Users trade once for the airdrop and ghost", "75% of traders are single-month mercenaries", "Volume disappears when rewards stop"] },
        fix: { title: "Streaks and lotteries that reward consistency.", description: "Consecutive claims compound retention: 65% → 96% at 4 claims. Daily raffles increase small trader volume 8.5x.", mechanics: ["Streak Rewards", "Daily Raffles", "Embedded Leaderboards"], result: "96% retention at 4 claims" },
      },
      {
        id: "perps",
        sector: "Perps",
        icon: TrendingUp,
        filename: "perps.strategy",
        image: "/generated/image/light-mono/network-nodes-light.jpg",
        insight: { title: "Quality Over Quantity", stat: "+130% daily volume during campaign." },
        problem: { title: "One-and-Done Traders", points: ["High volume masks mercenary behavior", "Users trade once for rewards then disappear", "No distinction between quality and junk volume"] },
        fix: { title: "Reward trading quality, not just size.", description: "Leaderboards ranked by PnL or consistency, not raw volume. Hold-time requirements filter wash trading.", mechanics: ["PnL Leaderboards", "Hold-Time Requirements", "Volume-Based Raffles"], result: "+77% unique traders" },
      },
      {
        id: "prediction",
        sector: "Prediction Markets",
        icon: Network,
        filename: "prediction.strategy",
        image: "/generated/image/light-mono/network-nodes-light.jpg",
        insight: { title: "Volume & Market Health", stat: "Fix churn from bad beats, low engagement between events, and wide spreads." },
        problem: { title: "Three Leaks", points: ["50% rage-quit after losing a 'sure thing' at the last minute", "Users bet on one event and disappear for weeks", "Wide spreads make markets untradeable"] },
        fix: { title: "Upset protection, active streaks, and spread incentives.", description: "Refund bad-beat losses to retain users. Reward active position portfolios to turn event tourists into daily users. Pay retail to tighten spreads.", mechanics: ["Upset Protection (bad-beat rebates)", "Active Position Streaks (5+ positions)", "Spread Squeezer (limit order rewards)"], result: "Retention + liquidity + DAU" },
      },
      {
        id: "launchpads-volume",
        sector: "Launchpads",
        icon: Rocket,
        filename: "launchpad-volume.strategy",
        image: "/generated/image/light-mono/data-particles.jpg",
        insight: { title: "Bonding Curve Volume", stat: "6x token launches. 8x trading volume during creator rebates." },
        problem: { title: "Launch and Die", points: ["Tokens launch but generate no sustained trading", "Bonding curve volume spikes then flatlines", "No incentive to trade after the initial pump"] },
        fix: { title: "Creator rebates and trading competitions on new tokens.", description: "Rebate creators based on their token's volume. Run leaderboards on newly launched tokens to sustain post-launch activity.", mechanics: ["Creator Rebates (per-token volume)", "New Token Leaderboards", "Launch Day Raffles"], result: "$6.9M in protocol fees" },
      },
    ],
  },
  {
    id: "capital",
    label: "Capital",
    icon: Landmark,
    keyStat: "387x",
    keyStatLabel: "volume per rebate dollar",
    oneLiner: "Grow deposits, liquidity, and token holdings with sustainable incentives.",
    primitives: ["Dynamic Rebates", "Gifts", "Milestones", "Referrals"],
    solutions: [
      {
        id: "tokens",
        sector: "Tokens & Stablecoins",
        icon: Coins,
        filename: "token.strategy",
        image: "/generated/image/light-mono/floating-mass-01.jpg",
        insight: { title: "Velocity & Distribution", stat: "$625M incentivized volume. 165K participants." },
        problem: { title: "Dead Liquidity", points: ["High market cap, zero velocity, tokens sit in wallets", "No incentive for holders to transact", "Distribution relies on market makers, not organic activity"] },
        fix: { title: "Dynamic rebates that scale with activity.", description: "Proportional daily rebates with onchain settlement. Higher volume = lower bips. Self-regulating.", mechanics: ["Dynamic Rebates (proportional daily)", "Looping Bonuses (leverage incentives)", "Spend Rewards"], result: "387x volume per rebate dollar" },
      },
      {
        id: "lending",
        sector: "Lending",
        icon: Landmark,
        filename: "lending.strategy",
        image: "/generated/image/light-mono/value-stack-light.jpg",
        insight: { title: "Utilization & Deposits", stat: "Duration-weighted bonuses drive sticky capital." },
        problem: { title: "Idle Capital", points: ["Massive deposits earning minimal yield", "Borrowing under-incentivized vs lending", "TVL doesn't translate to usage"] },
        fix: { title: "Reward duration, not just deposits.", description: "Target new LPs with duration-weighted bonuses. Longer holds = higher multipliers.", mechanics: ["Duration-Weighted Deposit Bonuses", "Borrower Activation Rewards", "Loyalty Multipliers"], result: "Sticky capital, not mercenary TVL" },
      },
      {
        id: "staking",
        sector: "Staking & Validators",
        icon: Landmark,
        filename: "staking.strategy",
        image: "/generated/image/light-mono/floating-mass-01.jpg",
        insight: { title: "Long-Term Alignment", stat: "Hold rewards scale with commitment." },
        problem: { title: "Stake & Forget", points: ["Stakers park tokens and never engage further", "No incentive to participate in governance or ecosystem", "Validator selection driven by APY alone"] },
        fix: { title: "Reward active staking, not passive holding.", description: "Milestone unlocks for staking duration. Cross-ecosystem engagement multipliers for governance participation.", mechanics: ["Duration-Based Hold Rewards", "Milestone Unlocks", "Governance Participation Bonuses"], result: "Active stakers, not passive holders" },
      },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    icon: Network,
    keyStat: "6x",
    keyStatLabel: "increase in token launches",
    oneLiner: "Incentivize the supply side: token launches, market creation, and cross-protocol activity.",
    primitives: ["Creator Rebates", "Breadth Multipliers", "Milestones", "Leaderboards"],
    solutions: [
      {
        id: "launchpads",
        sector: "Launchpads",
        icon: Rocket,
        filename: "launchpad.strategy",
        image: "/generated/image/light-mono/data-particles.jpg",
        insight: { title: "Participation & Breadth", stat: "95.7% of users only participate in a single launch." },
        problem: { title: "One-and-Done Participation", points: ["Users deposit for one launch and never return", "Whale concentration: 4.8% of wallets hold 59.4% of SOL", "No incentive to participate across multiple launches"] },
        fix: { title: "Breadth multipliers and time-weighted leaderboards.", description: "Escalating multipliers (up to 3x for 5+ launches). Time-weighted deposits shift 81% of volume to first 24 hours.", mechanics: ["Breadth Multipliers (1x → 3x)", "Time-Weighted Leaderboards", "Milestone Unlocks (retroactive)"], result: "6x creator activity increase" },
      },
      {
        id: "prediction-ecosystem",
        sector: "Prediction Markets",
        icon: Network,
        filename: "prediction-ecosystem.strategy",
        image: "/generated/image/light-mono/network-nodes-light.jpg",
        insight: { title: "Market Creation & Participation", stat: "Market creation is under-incentivized across prediction platforms." },
        problem: { title: "No One Creates Markets", points: ["Market creation falls on the platform, not users", "Liquidity depth depends on professional market makers", "No incentive for users to seed new categories"] },
        fix: { title: "Reward market creators and early liquidity providers.", description: "Creator rebates for new markets that reach volume thresholds. Early liquidity bonuses for users who tighten spreads on new markets.", mechanics: ["Market Creation Rebates", "Early Liquidity Bonuses", "Category Breadth Multipliers"], result: "User-driven market creation" },
      },
    ],
  },
];

// =============================================================================
// Solutions Page
// =============================================================================
export default function SolutionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />

      <main className="relative z-10 min-h-screen bg-white pt-24 md:pt-32">
        {/* Page Header */}
        <header className="w-full px-6 md:px-12 lg:px-20 pb-12 md:pb-16 border-b border-black/10">
          <div className="max-w-4xl">
            <div
              data-animate="fade-up"
              className="inline-flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-black/40"
            >
              <span className="w-1 h-1 bg-blue rounded-full" />
              Solutions
            </div>
            <h1
              data-animate="fade-up"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-black leading-[1.1] tracking-tight mb-4"
            >
              Grow Your Core Metrics
            </h1>
            <p
              data-animate="fade-up"
              className="text-base md:text-lg text-black/60 max-w-2xl mb-6"
            >
              Every incentive maps to one objective. Volume, capital, or ecosystem. Pick yours.
            </p>

            {/* Quick Nav: Objectives */}
            <div
              data-animate="fade-up"
              className="flex flex-wrap items-center gap-2"
            >
              {objectiveGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <a
                    key={group.id}
                    href={`#${group.id}`}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-[3px] border border-black/10 hover:border-black/20 transition-colors font-mono text-[10px] uppercase tracking-wider text-black/50 hover:text-black"
                  >
                    <Icon className="w-3 h-3 group-hover:text-blue transition-colors" />
                    {group.label}
                  </a>
                );
              })}
            </div>
          </div>
        </header>

        {/* Objective Sections with embedded vertical cards */}
        {objectiveGroups.map((group, idx) => (
          <ObjectiveSection key={group.id} group={group} index={idx} />
        ))}

        {/* CTA Section */}
        <SolutionsCTA onOpenModal={() => setIsModalOpen(true)} />
      </main>

      {/* Integration Request Modal */}
      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="h-screen" />
      <Footer />
    </>
  );
}

// =============================================================================
// Objective Section: contains vertical cards
// =============================================================================
interface ObjectiveSectionProps {
  group: ObjectiveGroup;
  index: number;
}

function ObjectiveSection({ group, index }: ObjectiveSectionProps) {
  const Icon = group.icon;
  const isAlt = index % 2 === 1;

  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = React.useRef<HTMLElement>(null);

  // Auto-select tab based on URL hash after hydration + scroll to section
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const idx = group.solutions.findIndex(s => s.id === hash);
    if (idx >= 0) {
      setActiveIdx(idx);
      // Scroll the objective section to top of viewport with 14px offset
      setTimeout(() => {
        const el = sectionRef.current;
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 14;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 100);
    }
  }, [group.solutions]);

  return (
    <section
      ref={sectionRef}
      id={group.id}
      className={`w-full border-b border-black/10 ${isAlt ? "bg-black/[0.015]" : "bg-white"}`}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-24">
        {/* Objective Header */}
        <div className="mb-8">
          <div
            data-animate="fade-up"
            className="inline-flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]"
          >
            <Icon className="w-3.5 h-3.5 text-blue" />
            <span>{group.label}</span>
          </div>

          <p data-animate="fade-up" className="text-base md:text-lg text-black/60 max-w-2xl mb-6">
            {group.oneLiner}
          </p>

          {/* Vertical Type Selector */}
          <div data-animate="fade-up" className="flex flex-wrap gap-2">
            {group.solutions.map((solution, idx) => {
              const SolIcon = solution.icon;
              return (
                <button
                  key={solution.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    window.history.replaceState(null, "", `#${solution.id}`);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[3px] font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                    activeIdx === idx
                      ? "bg-blue text-white border border-blue"
                      : "text-black/50 border border-black/10 hover:border-black/20 hover:text-black"
                  }`}
                >
                  <SolIcon className="w-3.5 h-3.5" />
                  {solution.sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Solution Card */}
        <SolutionCard solution={group.solutions[activeIdx]} />
      </div>
    </section>
  );
}

// =============================================================================
// Solution Card
// =============================================================================
const solutionVisuals: Record<string, React.ReactElement> = {
  dexs: <RankOrbit color="#0008FF" competitorCount={6} />,
  terminals: <StreakChain color="#0008FF" />,
  perps: <TrophyBurst color="#0008FF" />,
  tokens: <VelocityFlow color="#0008FF" />,
  lending: <DurationLock color="#0008FF" />,
  staking: <AnchorLock color="#0008FF" />,
  launchpads: <GrowthBars color="#0008FF" />,
  prediction: <OddsMatrix color="#0008FF" />,
};

interface SolutionCardProps {
  solution: Solution;
}

function SolutionCard({ solution }: SolutionCardProps) {
  const Icon = solution.icon;

  return (
    <div
      id={solution.id}
      data-animate="fade-up"
      className="group rounded-[3px] overflow-hidden border border-black/5 hover:border-black/15 transition-colors"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left: Content stacked */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-[3px] bg-white border border-black/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue/5 transition-colors">
              <Icon className="w-6 h-6 text-black group-hover:text-blue transition-colors" />
            </div>
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-medium text-black mb-1">
                {solution.sector}
              </h3>
              <p className="text-sm font-mono uppercase tracking-wider text-black/50">
                {solution.insight.title}
              </p>
            </div>
          </div>

          {/* Stacked sub-cards */}
          <div className="space-y-3 flex-1">
            {/* Diagnosis */}
            <div className="p-4 bg-black/[0.02] rounded-[3px] border-l-2 border-blue">
              <span className="text-[10px] font-mono uppercase tracking-wider text-black/40 block mb-1">
                diagnosis
              </span>
              <p className="text-base text-black">{solution.insight.stat}</p>
            </div>

            {/* Problem */}
            <div className="p-4 bg-black/[0.02] rounded-[3px] border border-black/10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-black/50 mb-2">
                The Problem
              </h4>
              <h5 className="text-sm font-display font-medium text-black mb-2">
                {solution.problem.title}
              </h5>
              <ul className="space-y-1.5">
                {solution.problem.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-black/60"
                  >
                    <span className="w-1 h-1 bg-black/30 rounded-full mt-2 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fix */}
            <div className="p-4 bg-black/[0.02] rounded-[3px] border border-blue/20">
              <h4 className="text-xs font-mono uppercase tracking-wider text-blue mb-2">
                The Torque Fix
              </h4>
              <h5 className="text-sm font-display font-medium text-black mb-1">
                {solution.fix.title}
              </h5>
              <p className="text-sm text-black/60 mb-3">
                {solution.fix.description}
              </p>

              {/* Mechanics */}
              <div className="pt-3 border-t border-black/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-black/40 block mb-1.5">
                  Mechanics
                </span>
                <ul className="space-y-1 mb-3">
                  {solution.fix.mechanics.map((mechanic, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-black"
                    >
                      <span className="text-blue mt-0.5">+</span>
                      {mechanic}
                    </li>
                  ))}
                </ul>

                {/* Result */}
                <span className="inline-flex items-center px-3 py-1.5 bg-blue/10 text-blue text-sm font-medium rounded-[3px]">
                  {solution.fix.result}
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 pt-5 border-t border-black/10 flex items-center justify-between">
            <span className="text-sm text-black/40">
              See how we implemented this for{" "}
              {solution.sector.toLowerCase()} protocols
            </span>
            <Button variant="outline" size="sm" href="/how-it-works">
              Learn More
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right: Animation */}
        <div className="relative w-full md:w-[45%] lg:w-[50%] min-h-[300px] md:min-h-0 flex-shrink-0">
          {/* Procedural visual */}
          {solutionVisuals[solution.id] && (
            <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
              <CardVisualWrapper
                color="#0008FF"
                className="relative w-full h-full"
              >
                {solutionVisuals[solution.id]}
              </CardVisualWrapper>
            </div>
          )}
          <ImageGradient className="bg-gradient-to-r from-white via-white/40 to-transparent transition-opacity duration-500 group-hover:opacity-0 hidden md:block" />
          <ImageGradient className="bg-gradient-to-t from-white/60 via-white/30 to-transparent transition-opacity duration-500 group-hover:opacity-0 md:hidden" />

          {/* Terminal Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-4 py-2 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
            <span className="font-mono text-[9px] text-black/30">
              {solution.filename}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Solutions CTA Section
// =============================================================================
interface SolutionsCTAProps {
  onOpenModal: () => void;
}

function SolutionsCTA({ onOpenModal }: SolutionsCTAProps) {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-white border-t border-black/10">
      <div className="max-w-xl mx-auto text-center">
        <div
          data-animate="fade-up"
          className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40"
        >
          <Rocket className="w-3 h-3" />
          Get Started
        </div>
        <SplitText
          tag="h2"
          className="font-display text-2xl sm:text-3xl font-medium text-black leading-[1.1] tracking-tight mb-4"
        >
          <span>Ready to launch</span>
          <span className="text-black/40">your first campaign?</span>
        </SplitText>
        <p
          data-animate="fade-up"
          className="text-base text-black/60 mb-6"
        >
          Get your first campaign live in under 24 hours.
        </p>
        <div
          data-animate="fade-up"
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="accent" onClick={onOpenModal}>
            Book a Demo
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" href="/how-it-works">
            How It Works
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
