"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { CardVisualWrapper } from "@/components/card-visuals/CardVisualWrapper";

// Each visual loaded individually with ssr: false
const loaders: Record<string, () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>> = {
  AcceleratorPath: () => import("@/components/card-visuals/AcceleratorPath").then(m => ({ default: m.AcceleratorPath as React.ComponentType<Record<string, unknown>> })),
  AnchorLock: () => import("@/components/card-visuals/AnchorLock").then(m => ({ default: m.AnchorLock as React.ComponentType<Record<string, unknown>> })),
  BuilderCanvas: () => import("@/components/card-visuals/BuilderCanvas").then(m => ({ default: m.BuilderCanvas as React.ComponentType<Record<string, unknown>> })),
  CampaignRadar: () => import("@/components/card-visuals/CampaignRadar").then(m => ({ default: m.CampaignRadar as React.ComponentType<Record<string, unknown>> })),
  CircuitPattern: () => import("@/components/card-visuals/CircuitPattern").then(m => ({ default: m.CircuitPattern as React.ComponentType<Record<string, unknown>> })),
  CodeStream: () => import("@/components/card-visuals/CodeStream").then(m => ({ default: m.CodeStream as React.ComponentType<Record<string, unknown>> })),
  DataLens: () => import("@/components/card-visuals/DataLens").then(m => ({ default: m.DataLens as React.ComponentType<Record<string, unknown>> })),
  DiamondHold: () => import("@/components/card-visuals/DiamondHold").then(m => ({ default: m.DiamondHold as React.ComponentType<Record<string, unknown>> })),
  DistributionWeb: () => import("@/components/card-visuals/DistributionWeb").then(m => ({ default: m.DistributionWeb as React.ComponentType<Record<string, unknown>> })),
  DurationLock: () => import("@/components/card-visuals/DurationLock").then(m => ({ default: m.DurationLock as React.ComponentType<Record<string, unknown>> })),
  GrowthBars: () => import("@/components/card-visuals/GrowthBars").then(m => ({ default: m.GrowthBars as React.ComponentType<Record<string, unknown>> })),
  IntegrationPlug: () => import("@/components/card-visuals/IntegrationPlug").then(m => ({ default: m.IntegrationPlug as React.ComponentType<Record<string, unknown>> })),
  LeverageSpiral: () => import("@/components/card-visuals/LeverageSpiral").then(m => ({ default: m.LeverageSpiral as React.ComponentType<Record<string, unknown>> })),
  LiquidityPool: () => import("@/components/card-visuals/LiquidityPool").then(m => ({ default: m.LiquidityPool as React.ComponentType<Record<string, unknown>> })),
  LoyaltyLayers: () => import("@/components/card-visuals/LoyaltyLayers").then(m => ({ default: m.LoyaltyLayers as React.ComponentType<Record<string, unknown>> })),
  MetricPulse: () => import("@/components/card-visuals/MetricPulse").then(m => ({ default: m.MetricPulse as React.ComponentType<Record<string, unknown>> })),
  NetworkPattern: () => import("@/components/card-visuals/NetworkPattern").then(m => ({ default: m.NetworkPattern as React.ComponentType<Record<string, unknown>> })),
  NeuralPulse: () => import("@/components/card-visuals/NeuralPulse").then(m => ({ default: m.NeuralPulse as React.ComponentType<Record<string, unknown>> })),
  OddsMatrix: () => import("@/components/card-visuals/OddsMatrix").then(m => ({ default: m.OddsMatrix as React.ComponentType<Record<string, unknown>> })),
  ParticleMesh: () => import("@/components/card-visuals/ParticleMesh").then(m => ({ default: m.ParticleMesh as React.ComponentType<Record<string, unknown>> })),
  RafflePattern: () => import("@/components/card-visuals/RafflePattern").then(m => ({ default: m.RafflePattern as React.ComponentType<Record<string, unknown>> })),
  RaffleWheel: () => import("@/components/card-visuals/RaffleWheel").then(m => ({ default: m.RaffleWheel as React.ComponentType<Record<string, unknown>> })),
  RankOrbit: () => import("@/components/card-visuals/RankOrbit").then(m => ({ default: m.RankOrbit as React.ComponentType<Record<string, unknown>> })),
  ReferralTree: () => import("@/components/card-visuals/ReferralTree").then(m => ({ default: m.ReferralTree as React.ComponentType<Record<string, unknown>> })),
  RetentionLoop: () => import("@/components/card-visuals/RetentionLoop").then(m => ({ default: m.RetentionLoop as React.ComponentType<Record<string, unknown>> })),
  RewardFlow: () => import("@/components/card-visuals/RewardFlow").then(m => ({ default: m.RewardFlow as React.ComponentType<Record<string, unknown>> })),
  RisingBars: () => import("@/components/card-visuals/RisingBars").then(m => ({ default: m.RisingBars as React.ComponentType<Record<string, unknown>> })),
  ROICascade: () => import("@/components/card-visuals/ROICascade").then(m => ({ default: m.ROICascade as React.ComponentType<Record<string, unknown>> })),
  SDKModules: () => import("@/components/card-visuals/SDKModules").then(m => ({ default: m.SDKModules as React.ComponentType<Record<string, unknown>> })),
  StandardsGrid: () => import("@/components/card-visuals/StandardsGrid").then(m => ({ default: m.StandardsGrid as React.ComponentType<Record<string, unknown>> })),
  StreakChain: () => import("@/components/card-visuals/StreakChain").then(m => ({ default: m.StreakChain as React.ComponentType<Record<string, unknown>> })),
  TokenPairLink: () => import("@/components/card-visuals/TokenPairLink").then(m => ({ default: m.TokenPairLink as React.ComponentType<Record<string, unknown>> })),
  TrophyBurst: () => import("@/components/card-visuals/TrophyBurst").then(m => ({ default: m.TrophyBurst as React.ComponentType<Record<string, unknown>> })),
  UtilizationMeter: () => import("@/components/card-visuals/UtilizationMeter").then(m => ({ default: m.UtilizationMeter as React.ComponentType<Record<string, unknown>> })),
  VelocityFlow: () => import("@/components/card-visuals/VelocityFlow").then(m => ({ default: m.VelocityFlow as React.ComponentType<Record<string, unknown>> })),
  WelcomeGate: () => import("@/components/card-visuals/WelcomeGate").then(m => ({ default: m.WelcomeGate as React.ComponentType<Record<string, unknown>> })),
  // New visuals
  EpochCycle: () => import("@/components/card-visuals/EpochCycle").then(m => ({ default: m.EpochCycle as React.ComponentType<Record<string, unknown>> })),
  SybilFilter: () => import("@/components/card-visuals/SybilFilter").then(m => ({ default: m.SybilFilter as React.ComponentType<Record<string, unknown>> })),
  MilestoneStairs: () => import("@/components/card-visuals/MilestoneStairs").then(m => ({ default: m.MilestoneStairs as React.ComponentType<Record<string, unknown>> })),
  BudgetDrain: () => import("@/components/card-visuals/BudgetDrain").then(m => ({ default: m.BudgetDrain as React.ComponentType<Record<string, unknown>> })),
  ChurnCliff: () => import("@/components/card-visuals/ChurnCliff").then(m => ({ default: m.ChurnCliff as React.ComponentType<Record<string, unknown>> })),
  QuestPath: () => import("@/components/card-visuals/QuestPath").then(m => ({ default: m.QuestPath as React.ComponentType<Record<string, unknown>> })),
  WalletTiers: () => import("@/components/card-visuals/WalletTiers").then(m => ({ default: m.WalletTiers as React.ComponentType<Record<string, unknown>> })),
  CrossProtocol: () => import("@/components/card-visuals/CrossProtocol").then(m => ({ default: m.CrossProtocol as React.ComponentType<Record<string, unknown>> })),
  CompoundRatchet: () => import("@/components/card-visuals/CompoundRatchet").then(m => ({ default: m.CompoundRatchet as React.ComponentType<Record<string, unknown>> })),
  AirdropShower: () => import("@/components/card-visuals/AirdropShower").then(m => ({ default: m.AirdropShower as React.ComponentType<Record<string, unknown>> })),
};

const names = Object.keys(loaders);

const agentBuilt = new Set([
  "EpochCycle", "SybilFilter", "MilestoneStairs", "BudgetDrain", "ChurnCliff",
  "QuestPath", "WalletTiers", "CrossProtocol", "CompoundRatchet", "AirdropShower",
]);

// Lazy-load a single visual when it enters viewport
function LazyVisual({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !Comp) {
        loaders[name]().then(mod => setComp(() => mod.default));
        observer.disconnect();
      }
    }, { rootMargin: "200px" });

    observer.observe(el);
    return () => observer.disconnect();
  }, [name, Comp]);

  return (
    <div ref={ref} className="group rounded-[3px] border border-black/10 hover:border-blue/30 transition-colors overflow-hidden">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {Comp && (
          <CardVisualWrapper color="#0008FF" className="absolute inset-0" previewDuration={0}>
            <Comp />
          </CardVisualWrapper>
        )}
      </div>
      <div className="p-3 border-t border-black/5 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs font-medium text-black">{name}</p>
          <p className="font-mono text-[10px] text-black/40 mt-0.5">card-visuals/{name}.tsx</p>
        </div>
        {agentBuilt.has(name) && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] bg-blue/10 text-blue">NEW</span>
        )}
      </div>
    </div>
  );
}

export default function VisualsPage() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-black mb-2">
          Visual Catalog
        </h1>
        <p className="text-base text-black/60">
          {names.length} animations — hover to play
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {names.map(name => (
          <LazyVisual key={name} name={name} />
        ))}
      </div>
    </main>
  );
}
