"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Rocket,
  UserPlus,
  Zap,
  RefreshCw,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { SplitText } from "@/components/animations/SplitText";

const IntegrationRequestModal = dynamic(
  () => import("../components/IntegrationRequestModal"),
  { ssr: false }
);

// =============================================================================
// Operations Data
// =============================================================================
interface Operation {
  id: string;
  label: string;
  headline: string;
  description: string;
  icon: React.ElementType;
  keyStat: string;
  keyStatLabel: string;
  supportingStats: { value: string; label: string }[];
  primitives: string[];
  insight: string;
}

const OPERATIONS: Operation[] = [
  {
    id: "acquire",
    label: "01 / ACQUIRE",
    headline: "Get Users In the Door",
    description:
      "Turn spend into wallets. Lowest-cost acquisition channels in DeFi.",
    icon: UserPlus,
    keyStat: "~$10",
    keyStatLabel: "Cost per acquired user",
    supportingStats: [
      { value: "56K+", label: "New users in 28 days" },
      { value: "165K", label: "Rebate participants" },
      { value: "<$7", label: "CAC via gifts (lowest)" },
    ],
    primitives: ["Raffles", "Gifts", "Referrals"],
    insight:
      "Small traders who claimed daily raffles increased volume 8.5x. Raffles don\u2019t just acquire \u2014 they grow users from day one.",
  },
  {
    id: "activate",
    label: "02 / ACTIVATE",
    headline: "First Meaningful Action",
    description:
      "Get users from connected wallet to first real trade. Fast.",
    icon: Zap,
    keyStat: "9.4x",
    keyStatLabel: "Claimers → power user conversion",
    supportingStats: [
      { value: "+130%", label: "Volume on launch day" },
      { value: "98.6%", label: "Claimers with trading activity" },
      { value: "+925%", label: "Whale tier surge" },
    ],
    primitives: ["Leaderboards", "First-Trade Hooks"],
    insight:
      "$405 in volume for every $1 spent on leaderboard rewards. Competition drives action.",
  },
  {
    id: "retain",
    label: "03 / RETAIN",
    headline: "Keep Them Coming Back",
    description:
      "The first week decides everything. Streak mechanics close the gap.",
    icon: RefreshCw,
    keyStat: "96%",
    keyStatLabel: "Volume retention at 4 consecutive claims",
    supportingStats: [
      { value: "65% → 96%", label: "Retention: 0 vs 4 claims" },
      { value: "D3–D7", label: "Critical churn window (~46% drop)" },
      { value: "387x", label: "Volume per rebate dollar" },
    ],
    primitives: ["Streaks", "Consecutive Claims", "Rebates"],
    insight:
      "Over half of users drop off by Day 7. Streak mechanics close the gap.",
  },
  {
    id: "scale",
    label: "04 / SCALE",
    headline: "Autopilot Growth",
    description:
      "Set it and forget it. Dynamic rebates that scale with the protocol.",
    icon: TrendingUp,
    keyStat: "$625M",
    keyStatLabel: "Volume from dynamic rebates",
    supportingStats: [
      { value: "165K", label: "Participants" },
      { value: "6x", label: "Token launches from creator rebates" },
      { value: "$100K → $2.8M", label: "Weekly revenue growth" },
    ],
    primitives: ["Dynamic Rebates", "Creator Rebates", "Pro-Rata Distributions"],
    insight:
      "Rebates at <3 basis points drove 387x volume leverage. The cheapest growth channel in DeFi.",
  },
  {
    id: "transform",
    label: "05 / TRANSFORM",
    headline: "Change User Behavior",
    description:
      "Incentives don\u2019t rent behavior. They change it. The data proves it.",
    icon: Sparkles,
    keyStat: "9.4x",
    keyStatLabel: "Power user conversion",
    supportingStats: [
      { value: "13x", label: "Creator conversion" },
      { value: "17.2x", label: "Claimer trade volume multiplier" },
      { value: "28.3x", label: "Token creation multiplier" },
    ],
    primitives: ["The compounding effect across all operations"],
    insight:
      "Users who engage with rewards become fundamentally different users. 161% weighted retention for small trader raffle claimers.",
  },
];

// =============================================================================
// Playbooks Page
// =============================================================================
export default function PlaybooksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar />

      <main className="relative z-10 min-h-screen bg-white pt-24 md:pt-32">
        {/* ================================================================= */}
        {/* Hero Section */}
        {/* ================================================================= */}
        <header className="w-full px-6 md:px-12 lg:px-20 pb-16 md:pb-24 border-b border-black/10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div
              data-animate="fade-up"
              className="inline-flex items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-wider text-black/40"
            >
              <span className="w-1 h-1 bg-blue rounded-full" />
              The Playbook
            </div>

            {/* Title */}
            <h1
              data-animate="fade-up"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-black leading-[1.05] tracking-tight mb-6"
            >
              The Growth{" "}
              <span className="text-blue">Operating System</span>
            </h1>

            {/* Subtitle */}
            <p
              data-animate="fade-up"
              className="text-lg md:text-xl text-black/60 max-w-2xl mb-8"
            >
              Campaigns end. Systems compound. Here&apos;s the framework behind $3B+ in volume driven.
            </p>

            {/* Strategy Library Link */}
            <Link
              href="/playbooks-old"
              data-animate="fade-up"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-blue hover:text-blue-dark transition-colors"
            >
              View Strategy Library
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* ================================================================= */}
        {/* Operation Sections */}
        {/* ================================================================= */}
        <div className="w-full">
          {OPERATIONS.map((op, index) => (
            <OperationSection key={op.id} operation={op} index={index} />
          ))}
        </div>

        {/* ================================================================= */}
        {/* Bottom CTA */}
        {/* ================================================================= */}
        <section className="w-full py-24 md:py-32 bg-white border-t border-black/10">
          <div className="w-full px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto text-center">
              {/* Tag */}
              <div
                data-animate="fade-up"
                className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]"
              >
                <Rocket className="w-3 h-3" />
                <span>Get Started</span>
              </div>

              {/* Heading */}
              <SplitText
                tag="h2"
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-black leading-[1.1] tracking-tight mb-4"
              >
                <span>Ready to run your </span>
                <span className="text-blue">first operation?</span>
              </SplitText>

              {/* Description */}
              <p
                data-animate="fade-up"
                className="text-lg text-black/60 mb-8 max-w-xl mx-auto"
              >
                Talk to our team. First campaign live in under 24 hours.
              </p>

              {/* CTA Buttons */}
              <div
                data-animate="fade-up"
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  variant="accent"
                  onClick={() => setIsModalOpen(true)}
                  className="group"
                >
                  Book a Demo
                  <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
                <Button variant="outline" href="/playbooks-old">
                  View Strategy Library
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="h-screen" />
      <Footer />

      {/* Integration Request Modal */}
      <IntegrationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// =============================================================================
// Operation Section Component
// =============================================================================
interface OperationSectionProps {
  operation: Operation;
  index: number;
}

function OperationSection({ operation, index }: OperationSectionProps) {
  const Icon = operation.icon;
  const isEven = index % 2 === 0;

  return (
    <section
      className={`w-full py-16 md:py-24 border-b border-black/10 ${
        isEven ? "bg-white" : "bg-black/[0.02]"
      }`}
    >
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Label */}
          <div
            data-animate="fade-up"
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-8 rounded-[3px] bg-blue/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">
              {operation.label}
            </span>
          </div>

          {/* Headline + Description */}
          <div data-animate="fade-up" className="mb-10 md:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight mb-3">
              {operation.headline}
            </h2>
            <p className="text-base md:text-lg text-black/60 max-w-2xl">
              {operation.description}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Key Stat */}
            <div
              data-animate="fade-up"
              className="lg:col-span-4"
            >
              <div className="border-l-2 border-blue pl-6 py-2">
                <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-black tracking-tight leading-none mb-2">
                  {operation.keyStat}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-black/50">
                  {operation.keyStatLabel}
                </div>
              </div>
            </div>

            {/* Supporting stats + primitives */}
            <div className="lg:col-span-8 space-y-8">
              {/* Supporting Stats Grid */}
              <div
                data-animate="fade-up"
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {operation.supportingStats.map((stat, i) => (
                  <div
                    key={i}
                    className="p-4 border border-black/10 rounded-[3px]"
                  >
                    <div className="font-display text-xl sm:text-2xl font-medium text-black mb-1">
                      {stat.value}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-black/40 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Primitives */}
              <div data-animate="fade-up">
                <div className="font-mono text-[10px] uppercase tracking-wider text-black/40 mb-3">
                  Primitives
                </div>
                <div className="flex flex-wrap gap-2">
                  {operation.primitives.map((primitive) => (
                    <span
                      key={primitive}
                      className="inline-flex items-center px-3 py-1.5 bg-blue/5 text-blue text-xs font-mono rounded-[3px] border border-blue/10"
                    >
                      {primitive}
                    </span>
                  ))}
                </div>
              </div>

              {/* Insight */}
              <div
                data-animate="fade-up"
                className="border-t border-black/10 pt-6"
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-black/40 mb-2">
                  Insight
                </div>
                <p className="text-sm text-black/70 leading-relaxed max-w-xl">
                  {operation.insight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
