"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function PlaybooksSection() {
  return (
    <section className="w-full py-32 md:py-52 bg-white">
      <div className="w-full px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div data-animate="fade-up" className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-wider text-black/60 border border-black/10 px-3 py-1.5 rounded-[3px]">
              <BookOpen className="w-3 h-3" />
              <span>Growth Playbooks</span>
            </div>
            <SplitText tag="h2" className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight">
              <span>Battle-tested and</span>
              <span className="text-black/40">ready to deploy</span>
            </SplitText>
            <p data-animate="fade-up" className="text-base md:text-lg text-black/60 mt-4 max-w-xl">
              Built from $10M+ in live campaigns. One-click deploy.
            </p>
          </div>
          <div data-animate="fade-up">
            <Button variant="outline" href="/playbooks" className="w-fit">
              View All Playbooks
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Playbooks Grid — 3 vertical cols at xl, single-col horizontal at 3xl */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {featuredPlaybooks.map((playbook) => (
            <div key={playbook.id} data-animate="fade-up">
              <PlaybookCard playbook={playbook} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Playbook Card Component
// =============================================================================
interface PlaybookCardProps {
  playbook: (typeof featuredPlaybooks)[number];
}

function PlaybookCard({ playbook }: PlaybookCardProps) {
  const Icon = playbook.icon;
  const VisualComponent = visualComponents[playbook.visualType];

  return (
    <VisualCard
      visual={<VisualComponent />}
      filename={`${playbook.type === "CASE_STUDY" ? "case_study" : playbook.type.toLowerCase()}.${playbook.sector.toLowerCase()}`}
      layout="adaptive"
      visualFill={playbook.visualFill}
      href="/playbooks"
    >
      <div className="relative w-8 h-8 rounded-[3px] bg-white/80 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-blue/10 transition-colors">
        <Icon className="w-4 h-4 text-black group-hover:text-blue transition-colors" />
      </div>

      <h3 className="relative font-display text-lg md:text-xl font-medium text-black mb-2 group-hover:text-blue transition-colors">
        {playbook.title}
      </h3>

      <p className="relative text-sm text-black/60 leading-relaxed mb-4">
        {playbook.description}
      </p>

      {/* Formula or Metric */}
      <div className="relative">
      {playbook.formula ? (
        <PlaybookFormula formula={playbook.formula} />
      ) : playbook.metricBadge ? (
        <div className="pt-4 border-t border-black/10">
          <span className="inline-flex items-center px-2.5 py-1.5 bg-white/80 backdrop-blur-sm text-blue text-sm font-medium rounded-[2px]">
            {playbook.metricBadge}
          </span>
        </div>
      ) : null}
      </div>

      <span className="relative inline-flex items-center text-xs text-blue hover:text-black transition-colors font-medium mt-4">
        View Strategy <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </VisualCard>
  );
}

// =============================================================================
// Playbook Formula Component
// =============================================================================
interface PlaybookFormulaProps {
  formula: {
    trigger: string;
    condition: string;
    reward: string;
  };
}

function PlaybookFormula({ formula }: PlaybookFormulaProps) {
  return (
    <div className="space-y-2 pt-4 border-t border-black/10">
      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono text-black/40 w-16">Trigger</span>
        <span className="text-black/70">{formula.trigger}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono text-black/40 w-16">Condition</span>
        <span className="text-black/70">{formula.condition}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono text-blue w-16">Reward</span>
        <span className="text-blue">{formula.reward}</span>
      </div>
    </div>
  );
}
