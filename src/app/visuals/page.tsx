"use client";

import React from "react";
import { VisualCard } from "@/components/card-visuals/VisualCard";

import { AcceleratorPath } from "@/components/card-visuals/AcceleratorPath";
import { AnchorLock } from "@/components/card-visuals/AnchorLock";
import { BuilderCanvas } from "@/components/card-visuals/BuilderCanvas";
import { CampaignRadar } from "@/components/card-visuals/CampaignRadar";
import { CircuitPattern } from "@/components/card-visuals/CircuitPattern";
import { CodeStream } from "@/components/card-visuals/CodeStream";
import { DataLens } from "@/components/card-visuals/DataLens";
import { DiamondHold } from "@/components/card-visuals/DiamondHold";
import { DistributionWeb } from "@/components/card-visuals/DistributionWeb";
import { DurationLock } from "@/components/card-visuals/DurationLock";
import { GrowthBars } from "@/components/card-visuals/GrowthBars";
import { IntegrationPlug } from "@/components/card-visuals/IntegrationPlug";
import { LeverageSpiral } from "@/components/card-visuals/LeverageSpiral";
import { LiquidityPool } from "@/components/card-visuals/LiquidityPool";
import { LoyaltyLayers } from "@/components/card-visuals/LoyaltyLayers";
import { MetricPulse } from "@/components/card-visuals/MetricPulse";
import { NetworkPattern } from "@/components/card-visuals/NetworkPattern";
import { NeuralPulse } from "@/components/card-visuals/NeuralPulse";
import { OddsMatrix } from "@/components/card-visuals/OddsMatrix";
import { ParticleMesh } from "@/components/card-visuals/ParticleMesh";
import { RafflePattern } from "@/components/card-visuals/RafflePattern";
import { RaffleWheel } from "@/components/card-visuals/RaffleWheel";
import { RankOrbit } from "@/components/card-visuals/RankOrbit";
import { ReferralTree } from "@/components/card-visuals/ReferralTree";
import { RetentionLoop } from "@/components/card-visuals/RetentionLoop";
import { RewardFlow } from "@/components/card-visuals/RewardFlow";
import { RisingBars } from "@/components/card-visuals/RisingBars";
import { ROICascade } from "@/components/card-visuals/ROICascade";
import { SDKModules } from "@/components/card-visuals/SDKModules";
import { StandardsGrid } from "@/components/card-visuals/StandardsGrid";
import { StreakChain } from "@/components/card-visuals/StreakChain";
import { TokenPairLink } from "@/components/card-visuals/TokenPairLink";
import { TrophyBurst } from "@/components/card-visuals/TrophyBurst";
import { UtilizationMeter } from "@/components/card-visuals/UtilizationMeter";
import { VelocityFlow } from "@/components/card-visuals/VelocityFlow";
import { WelcomeGate } from "@/components/card-visuals/WelcomeGate";

const visuals = [
  { name: "AcceleratorPath", element: <AcceleratorPath /> },
  { name: "AnchorLock", element: <AnchorLock /> },
  { name: "BuilderCanvas", element: <BuilderCanvas /> },
  { name: "CampaignRadar", element: <CampaignRadar /> },
  { name: "CircuitPattern", element: <CircuitPattern /> },
  { name: "CodeStream", element: <CodeStream /> },
  { name: "DataLens", element: <DataLens /> },
  { name: "DiamondHold", element: <DiamondHold /> },
  { name: "DistributionWeb", element: <DistributionWeb /> },
  { name: "DurationLock", element: <DurationLock /> },
  { name: "GrowthBars", element: <GrowthBars /> },
  { name: "IntegrationPlug", element: <IntegrationPlug /> },
  { name: "LeverageSpiral", element: <LeverageSpiral /> },
  { name: "LiquidityPool", element: <LiquidityPool /> },
  { name: "LoyaltyLayers", element: <LoyaltyLayers /> },
  { name: "MetricPulse", element: <MetricPulse /> },
  { name: "NetworkPattern", element: <NetworkPattern /> },
  { name: "NeuralPulse", element: <NeuralPulse /> },
  { name: "OddsMatrix", element: <OddsMatrix /> },
  { name: "ParticleMesh", element: <ParticleMesh /> },
  { name: "RafflePattern", element: <RafflePattern /> },
  { name: "RaffleWheel", element: <RaffleWheel /> },
  { name: "RankOrbit", element: <RankOrbit /> },
  { name: "ReferralTree", element: <ReferralTree /> },
  { name: "RetentionLoop", element: <RetentionLoop /> },
  { name: "RewardFlow", element: <RewardFlow /> },
  { name: "RisingBars", element: <RisingBars /> },
  { name: "ROICascade", element: <ROICascade /> },
  { name: "SDKModules", element: <SDKModules /> },
  { name: "StandardsGrid", element: <StandardsGrid /> },
  { name: "StreakChain", element: <StreakChain /> },
  { name: "TokenPairLink", element: <TokenPairLink /> },
  { name: "TrophyBurst", element: <TrophyBurst /> },
  { name: "UtilizationMeter", element: <UtilizationMeter /> },
  { name: "VelocityFlow", element: <VelocityFlow /> },
  { name: "WelcomeGate", element: <WelcomeGate /> },
];

export default function VisualsPage() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-12 lg:p-20">
      <div className="mb-12">
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-black mb-2">
          Visual Catalog
        </h1>
        <p className="text-base text-black/60">
          {visuals.length} animations in <code className="text-xs bg-black/5 px-1.5 py-0.5 rounded">src/components/card-visuals/</code>
          <span className="ml-2 text-black/40">— hover to play</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visuals.map(({ name, element }) => (
          <VisualCard
            key={name}
            visual={element}
            filename={`card-visuals/${name}.tsx`}
            className="aspect-square"
            visualFill="full"
          >
            <h3 className="relative font-mono text-xs font-medium text-black">{name}</h3>
          </VisualCard>
        ))}
      </div>
    </main>
  );
}
