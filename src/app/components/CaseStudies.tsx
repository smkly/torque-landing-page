"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { featuredPlaybooks, type Playbook } from "@/app/data/playbooks";
import { VisualCard } from "@/components/card-visuals/VisualCard";
import { SplitText } from "@/components/animations/SplitText";

const RafflePattern = dynamic(
  () => import("@/components/card-visuals/RafflePattern").then(mod => ({ default: mod.RafflePattern })),
  { ssr: false }
);
const NetworkPattern = dynamic(
  () => import("@/components/card-visuals/NetworkPattern").then(mod => ({ default: mod.NetworkPattern })),
  { ssr: false }
);
const GrowthBars = dynamic(
  () => import("@/components/card-visuals/GrowthBars").then(mod => ({ default: mod.GrowthBars })),
  { ssr: false }
);

const visualComponents: Record<Playbook["visualType"], React.ComponentType<{ color?: string; paused?: boolean }>> = {
  raffle: RafflePattern,
  network: NetworkPattern,
  growth: GrowthBars,
};

export default function CaseStudies() {
  return (
    <section className="w-full py-32 md:py-52 bg-white">
      <div className="w-full px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]">
            <TrendingUp className="w-3 h-3" />
            <span>Results</span>
          </div>
          <SplitText tag="h2" className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight">
            <span>Real campaigns.</span>
            <span className="text-black/40">Real numbers.</span>
          </SplitText>
          <p data-animate="fade-up" className="text-base md:text-lg text-black/60 mt-4 max-w-xl">
            Built from $10M+ in live campaigns.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {featuredPlaybooks.map((item) => (
            <div key={item.id} data-animate="fade-up">
              <CaseStudyCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface CaseStudyCardProps {
  item: (typeof featuredPlaybooks)[number];
}

function CaseStudyCard({ item }: CaseStudyCardProps) {
  const Icon = item.icon;
  const VisualComponent = visualComponents[item.visualType];

  return (
    <VisualCard
      visual={<VisualComponent />}
      filename={`${item.type === "CASE_STUDY" ? "case_study" : item.type.toLowerCase()}.${item.sector.toLowerCase()}`}
      layout="adaptive"
      visualFill={item.visualFill}
    >
      <div className="relative w-8 h-8 rounded-[3px] bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-blue/10 transition-colors">
        <Icon className="w-4 h-4 text-black group-hover:text-blue transition-colors" />
      </div>

      <h3 className="relative font-display text-lg md:text-xl font-medium text-black mb-2 group-hover:text-blue transition-colors">
        {item.title}
      </h3>

      <p className="relative text-sm text-black/60 leading-relaxed mb-4">
        {item.description}
      </p>

      {item.metricBadge && (
        <div className="relative pt-4 border-t border-black/10">
          <span className="inline-flex items-center px-2.5 py-1.5 bg-white/80 backdrop-blur-sm text-blue text-sm font-medium rounded-[2px]">
            {item.metricBadge}
          </span>
        </div>
      )}

      <span className="relative inline-flex items-center text-xs text-blue hover:text-black transition-colors font-medium mt-4">
        View Details <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </VisualCard>
  );
}
