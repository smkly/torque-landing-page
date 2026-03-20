"use client";

import React from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductTerminal from "../components/ProductTerminal";
import { Button } from "@/components/ui/button";
import { CardVisualWrapper } from "@/components/card-visuals/CardVisualWrapper";
import { ImageGradient } from "@/components/ascii/ImageGradient";
import {
  ArrowUpRight,
  Code,
  Trophy,
  Brain,
  Zap,
  Network,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  Database,
  Gauge,
  Users,
  Terminal,
  Check,
} from "lucide-react";

const DataLens = dynamic(
  () => import("@/components/card-visuals/DataLens").then(mod => ({ default: mod.DataLens })),
  { ssr: false }
);
const CampaignRadar = dynamic(
  () => import("@/components/card-visuals/CampaignRadar").then(mod => ({ default: mod.CampaignRadar })),
  { ssr: false }
);
const SDKModules = dynamic(
  () => import("@/components/card-visuals/SDKModules").then(mod => ({ default: mod.SDKModules })),
  { ssr: false }
);
const IntegrationPlug = dynamic(
  () => import("@/components/card-visuals/IntegrationPlug").then(mod => ({ default: mod.IntegrationPlug })),
  { ssr: false }
);
const BuilderCanvas = dynamic(
  () => import("@/components/card-visuals/BuilderCanvas").then(mod => ({ default: mod.BuilderCanvas })),
  { ssr: false }
);
const MetricPulse = dynamic(
  () => import("@/components/card-visuals/MetricPulse").then(mod => ({ default: mod.MetricPulse })),
  { ssr: false }
);

// =============================================================================
// Platform Page
// =============================================================================
export default function PlatformPage() {
  return (
    <>
      <Navbar />

      <main className="relative z-10 min-h-screen bg-white pt-24 md:pt-32">
        {/* Page Header */}
        <header className="w-full px-6 md:px-12 lg:px-20 pb-12 md:pb-16 border-b border-black/10">
          <div className="max-w-4xl">
            <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-black/40">
              <span className="w-1 h-1 bg-blue rounded-full" />
              Platform
            </div>
            <h1 data-animate="fade-up" className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-black leading-[1.1] tracking-tight mb-4">
              The Growth Operating System
            </h1>
            <p data-animate="fade-up" className="text-base md:text-lg text-black/60 max-w-2xl">
              On-Chain CRM and Incentive Engine that helps you identify high-value users,
              predict their behavior, and retain them with surgical precision.
            </p>
            <div data-animate="fade-up" className="flex flex-wrap items-center gap-4 mt-6">
              <Button variant="accent" href="https://platform.torque.so/">
                Launch Platform
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" href="https://docs.torque.so/">
                Documentation
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="w-full px-6 md:px-12 lg:px-20 py-8 border-b border-black/10 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            {[
              { value: "100%", label: "Whitelabel" },
              { value: "5min", label: "Integration" },
              { value: "Real-time", label: "AI Optimization" },
            ].map((stat, index) => (
              <div key={index} data-animate="fade-up" className="flex items-baseline gap-2">
                <span className="font-display text-xl font-semibold text-black">
                  {stat.value}
                </span>
                <span className="text-xs text-black/50">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Section */}
        <FeatureSection
          icon={Brain}
          label="Torque Intelligence"
          title="Turn Raw Data into Revenue"
          description="Stop guessing. Surface actionable campaigns to drive engagement and retention."
          visual={<DataLens color="#0008FF" />}
          features={[
            {
              icon: Database,
              title: "Natural Language Queries",
              description: "Ask questions like \"Show me whales at risk of churning\" and get actionable recommendations.",
            },
            {
              icon: Shield,
              title: "Sybil Protection",
              description: "Identify wash traders and bot clusters. 15K+ sybils filtered and counting.",
            },
            {
              icon: Gauge,
              title: "ROI Simulation",
              description: "Simulate incentive logic against historical data before deploying.",
            },
            {
              icon: TrendingUp,
              title: "Analytics Dashboard",
              description: "Track cohorts, reward efficiency, and campaign ROI in real-time.",
            },
          ]}
        />

        {/* Growth Mechanics Section */}
        <FeatureSection
          icon={Zap}
          label="Growth Engines"
          title="Launch High-ROI Campaigns"
          description="Deploy mechanics that drive viral loops and retention."
          visual={<CampaignRadar color="#0008FF" />}
          features={[
            {
              icon: Code,
              title: "Conditional Incentives",
              description: "Rewards that trigger on specific high-value actions—raffles, rebates, and transfers.",
            },
            {
              icon: Trophy,
              title: "Embedded Leaderboards",
              description: "Real-time rankings that drive competition directly in your interface. 2.1x volume lift.",
            },
            {
              icon: Network,
              title: "On-Chain Referrals",
              description: "Native referral programs with multi-tier attribution. $50M+ volume driven.",
            },
            {
              icon: TrendingUp,
              title: "Dynamic Budget Allocation",
              description: "Auto-shift spend to top-performing campaigns. Maximize ROI without manual tuning.",
            },
          ]}
        />

        {/* Integration Section */}
        <FeatureSection
          icon={Layers}
          label="Native Experience"
          title="Your Brand. Your UI. Our Engine."
          description="Embed directly into your dApp. Users never leave."
          visual={<SDKModules color="#0008FF" />}
          features={[
            {
              icon: Terminal,
              title: "Embeddable SDK",
              description: "React, Vue, Vanilla JS support. Integrate in minutes with full TypeScript support.",
            },
            {
              icon: Users,
              title: "Customizable UI",
              description: "Every component is themeable to match your brand's colors and layouts.",
            },
            {
              icon: Zap,
              title: "Zero-Redirect Claims",
              description: "Users claim rewards without leaving your app. Zero friction.",
            },
            {
              icon: Code,
              title: "Full API Access",
              description: "REST API, webhooks, and SDK for complete programmatic control.",
            },
          ]}
        />

        {/* How It Works */}
        <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-black/10">
          <div className="mb-12">
            <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40">
              <BarChart3 className="w-3 h-3" />
              How It Works
            </div>
            <h2 data-animate="fade-up" className="font-display text-xl sm:text-2xl font-medium text-black leading-[1.1] tracking-tight">
              Three Steps to Growth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { step: "01", title: "Connect", description: "Integrate with our SDK. No engineering resources required." },
              { step: "02", title: "Build", description: "Create incentive programs with our visual builder." },
              { step: "03", title: "Optimize", description: "Monitor metrics and reallocate budgets dynamically." },
            ].map((item, index) => (
              <HowItWorksCard key={item.step} item={item} index={index} />
            ))}
          </div>
        </section>

        {/* MCP Terminal */}
        <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-black/10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40 border border-black/10 px-2 py-1 rounded-[3px]">
                <span className="w-1 h-1 bg-blue rounded-full" />
                MCP / API
              </span>
              <h2 data-animate="fade-up" className="font-display text-2xl sm:text-3xl font-medium text-black leading-[1.1] tracking-tight mt-3">
                See It Working
              </h2>
              <p data-animate="fade-up" className="text-base text-black/60 mt-3">
                Create campaigns, measure ROI, and segment users. All from the terminal.
              </p>
            </div>
            <ProductTerminal />
          </div>
        </section>

        {/* CTA */}
        <section className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-black/10">
          <div className="max-w-xl mx-auto text-center">
            <h2 data-animate="fade-up" className="font-display text-2xl sm:text-3xl font-medium text-black leading-[1.1] tracking-tight mb-4">
              Ready to embed growth into your protocol?
            </h2>
            <p data-animate="fade-up" className="text-base text-black/60 mb-6">
              Join leading protocols using Torque to drive sustainable growth.
            </p>
            <div data-animate="fade-up" className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="accent" href="https://platform.torque.so/">
                Get API Keys
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" href="https://docs.torque.so/">
                Read Docs
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div className="h-screen" />
      <Footer />
    </>
  );
}

// =============================================================================
// Feature Section Component
// =============================================================================
interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
  features: FeatureItem[];
  visual?: React.ReactElement;
}

function FeatureSection({
  icon: Icon,
  label,
  title,
  description,
  features,
  visual,
}: FeatureSectionProps) {
  return (
    <section
      className="group relative w-full px-6 md:px-12 lg:px-20 py-20 md:py-32 border-t border-black/10 overflow-hidden min-h-[600px] lg:min-h-[700px]"
    >
      {/* Background Visual — always playing */}
      {visual && (
        <div className="absolute inset-0 transition-opacity duration-700 opacity-50 group-hover:opacity-100">
          <div className="relative w-full h-full">
            {React.cloneElement(visual as React.ReactElement<Record<string, unknown>>, { paused: false, color: "#0008FF" })}
          </div>
        </div>
      )}

      {/* White gradient — top for header */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white via-white/90 to-transparent z-[1] pointer-events-none" />
      {/* White gradient — bottom for features */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-white via-white/90 to-transparent z-[1] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between min-h-[inherit]">
        {/* Header - top */}
        <div>
          <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40">
            <Icon className="w-3 h-3" />
            {label}
          </div>
          <h2 data-animate="fade-up" className="font-display text-xl sm:text-2xl font-medium text-black leading-[1.1] tracking-tight mb-2">
            {title}
          </h2>
          <p data-animate="fade-up" className="text-sm text-black/60 max-w-md">{description}</p>
        </div>

        {/* 2x2 Feature Grid - pinned to bottom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mt-auto pt-12">
          {features.map((feature, index) => (
            <div key={index} data-animate="fade-up" className="flex items-start gap-3 py-4 border-t border-black/6">
              <feature.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-black/30" />
              <div>
                <h3 className="font-display text-sm font-medium text-black mb-0.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-black/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// How It Works Card Component
// =============================================================================
function HowItWorksCard({ item, index }: { item: { step: string; title: string; description: string }; index: number }) {
  const visuals = [
    <IntegrationPlug key="plug" />,
    <BuilderCanvas key="builder" />,
    <MetricPulse key="metric" />,
  ];

  return (
    <div
      data-animate="fade-up"
      className="group relative border-t md:border-t-0 md:border-l first:border-l-0 first:border-t-0 border-black/8"
    >
      {/* Text */}
      <div className="px-5 pt-5 pb-3">
        <span className="font-mono text-[10px] text-black/25 tracking-wider">{item.step}</span>
        <h3 className="font-display text-lg font-medium text-black mt-1 mb-1 group-hover:text-blue transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-black/50 leading-relaxed">{item.description}</p>
      </div>

      {/* Visual */}
      <div className="relative h-[200px] mx-5 mb-5 rounded-[3px] bg-gray-50/60 overflow-hidden">
        <div className="absolute inset-0 transition-all duration-500 opacity-50 group-hover:opacity-100">
          <CardVisualWrapper color="#0008FF" className="relative w-full h-full">
            {visuals[index]}
          </CardVisualWrapper>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/30 to-transparent transition-opacity duration-500 group-hover:opacity-0 pointer-events-none" />
      </div>
    </div>
  );
}
