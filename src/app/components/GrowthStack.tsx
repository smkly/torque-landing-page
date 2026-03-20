"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Layers, Shield, BarChart3, Zap, ArrowUpRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGradient } from "@/components/ascii/ImageGradient";
import { CardVisualWrapper } from "@/components/card-visuals/CardVisualWrapper";
import { SplitText } from "@/components/animations/SplitText";

const RewardFlow = dynamic(
  () => import("@/components/card-visuals/RewardFlow").then(mod => ({ default: mod.RewardFlow })),
  { ssr: false }
);
const RankOrbit = dynamic(
  () => import("@/components/card-visuals/RankOrbit").then(mod => ({ default: mod.RankOrbit })),
  { ssr: false }
);
const NeuralPulse = dynamic(
  () => import("@/components/card-visuals/NeuralPulse").then(mod => ({ default: mod.NeuralPulse })),
  { ssr: false }
);
const CircuitPattern = dynamic(
  () => import("@/components/card-visuals/CircuitPattern").then(mod => ({ default: mod.CircuitPattern })),
  { ssr: false }
);

// =============================================================================
// Growth Stack Section
// =============================================================================
export default function GrowthStack() {
  return (
    <section id="growth-stack" className="w-full bg-white">
      <div className="w-full px-6 md:px-12 lg:px-20 py-32 md:py-52">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div className="max-w-2xl">
            <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40 border border-black/10 px-2 py-1 rounded-[3px]">
              <span className="w-1 h-1 bg-blue rounded-full" />
              Platform Features
            </div>
            <SplitText tag="h2" className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight">
              <span>The Incentive</span>
              <span className="text-black/40">Toolkit</span>
            </SplitText>
            <p data-animate="fade-up" className="text-base md:text-lg text-black/60 mt-4 max-w-xl">
              Solve retention and acquisition with five core mechanisms.
            </p>
          </div>
          <div data-animate="fade-up">
            <Button variant="outline" href="/platform" className="w-fit">
              Explore Platform
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Large Card - Incentive Primitives */}
          <div data-animate="fade-up" className="md:col-span-2 lg:col-span-2">
            <FeatureCard
              icon={Layers}
              title="Five mechanisms for retention, engagement, and acquisition"
              description="Leaderboards concentrate your best traders. Lotteries pull in everyone else. Gifts, rebates, and referrals handle activation, retention, and growth."
              visual={<RewardFlow color="#0008FF" />}
              filename="campaigns.config"
              features={[
                { icon: Zap, label: "Leaderboards" },
                { icon: Zap, label: "Lotteries" },
                { icon: Zap, label: "Gifts" },
                { icon: Zap, label: "Rebates" },
                { icon: Zap, label: "Referrals" },
              ]}
              large
              featured
            />
          </div>

          {/* Small Card - Sybil Protection */}
          <div data-animate="fade-up">
            <FeatureCard
              icon={Shield}
              title="Stop Paying Wallets That Don't Matter"
              description="Filter bots and zero-value wallets before they touch your budget."
              visual={<RankOrbit color="#0008FF" competitorCount={6} />}
              filename="sybil.guard"
              metric="15K+ sybils caught"
            />
          </div>

          {/* Small Card - Prove Your ROI */}
          <div data-animate="fade-up">
            <FeatureCard
              icon={BarChart3}
              title="Know What Each Dollar Produced"
              description="Numbers you can put in front of your board."
              visual={<NeuralPulse color="#0008FF" nodeCount={10} />}
              filename="analytics.roi"
              metric="Real-time measurement"
              speed={1.5}
            />
          </div>

          {/* Wide Card - Launch in Minutes */}
          <div data-animate="fade-up" className="md:col-span-2 lg:col-span-2">
            <APICard />
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Feature Card Component
// =============================================================================
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  visual?: React.ReactElement;
  filename: string;
  features?: Array<{ icon?: React.ComponentType<{ className?: string }>; dot?: boolean; label: string }>;
  metric?: string;
  large?: boolean;
  featured?: boolean;
  speed?: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  visual,
  filename,
  features,
  metric,
  large,
  featured,
  speed,
}: FeatureCardProps) {
  return (
    <div className={`relative rounded-[3px] group h-full border transition-all overflow-hidden ${large ? "min-h-[392px]" : "min-h-[336px]"} ${featured ? "border-blue/20 hover:border-blue/40 shadow-[0_0_40px_-10px_rgba(0,122,255,0.15)]" : "border-black/5 hover:border-black/15"}`}>

      {/* Procedural visual background */}
      <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-all duration-500">{visual && <CardVisualWrapper color="#0008FF" speed={speed} className="relative w-full h-full">{visual}</CardVisualWrapper>}</div>

      {/* White gradient overlay - fades out on hover to reveal visual */}
      <ImageGradient className={`transition-opacity duration-500 group-hover:opacity-0 ${featured ? "bg-gradient-to-t from-white/40 via-white/20 to-transparent" : "bg-gradient-to-t from-white/50 via-white/25 to-transparent"}`} />
      <ImageGradient className="bg-gradient-to-br from-white/15 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-0" />

      {/* Terminal Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-3 py-1.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
        <span className="font-mono text-[9px] text-black/30">{filename}</span>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col p-4 pt-8">
        <div className="mt-auto relative">
          {/* Soft white gradient backdrop behind text for readability */}
          <div className="absolute -inset-x-4 -top-8 -bottom-4 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />

          <div className={`relative w-8 h-8 rounded-[3px] backdrop-blur-sm flex items-center justify-center mb-3 transition-colors ${featured ? "bg-blue/15 group-hover:bg-blue/25" : "bg-white/80 group-hover:bg-blue/10"}`}>
            <Icon className={`w-4 h-4 transition-colors ${featured ? "text-blue" : "text-black group-hover:text-blue"}`} />
          </div>

          <h3 className="relative font-display text-base md:text-lg font-medium mb-1 text-black group-hover:text-blue transition-colors">
            {title}
          </h3>

          <p className="relative text-black/60 text-xs leading-relaxed mb-3">
            {description}
          </p>

          {features && (
            <div className="relative pt-3 border-t border-black/10 flex flex-wrap items-center gap-x-4 gap-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[10px] text-black/50">
                  {feature.icon && <feature.icon className="w-3 h-3" />}
                  {feature.dot && <span className="w-1 h-1 bg-blue rounded-full" />}
                  <span className="font-mono">{feature.label}</span>
                </div>
              ))}
            </div>
          )}

          {metric && (
            <div className="relative pt-3 border-t border-black/10">
              <span className="inline-flex items-center text-xs font-medium text-blue">
                {metric}
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// API Card Component
// =============================================================================
function APICard() {
  return (
    <div className="relative rounded-[3px] group h-full border border-black/5 hover:border-black/15 transition-colors overflow-hidden min-h-[280px]">

      {/* Procedural visual background */}
      <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-all duration-500">
        <CardVisualWrapper color="#0008FF" speed={1.5} className="relative w-full h-full">
          <CircuitPattern />
        </CardVisualWrapper>
      </div>

      {/* White gradient overlay - fades out on hover to reveal visual */}
      <ImageGradient className="bg-gradient-to-t from-white/50 via-white/25 to-transparent transition-opacity duration-500 group-hover:opacity-0" />
      <ImageGradient className="bg-gradient-to-br from-white/15 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-0" />

      {/* Terminal Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-3 py-1.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
        <span className="font-mono text-[9px] text-black/30">api.sdk</span>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col p-4 pt-8">
        <div className="mt-auto relative">
          {/* Soft white gradient backdrop behind text for readability */}
          <div className="absolute -inset-x-4 -top-8 -bottom-4 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />

          <div className="relative w-8 h-8 rounded-[3px] bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-blue/10 transition-colors">
            <Terminal className="w-4 h-4 text-black group-hover:text-blue transition-colors" />
          </div>

          <h3 className="relative font-display text-base md:text-lg font-medium mb-1 text-black group-hover:text-blue transition-colors">
            Live in 5 Minutes
          </h3>
          <p className="relative text-black/60 text-xs leading-relaxed mb-3">
            Whitelabel SDK. Your brand and UI, our engine.
          </p>

          <div className="relative pt-3 border-t border-black/10 flex flex-wrap items-center gap-1.5">
            {["Whitelabel SDK", "REST API", "Webhooks", "5-min Setup"].map((item) => (
              <span
                key={item}
                className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded-[2px] font-mono text-[10px] text-black/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
