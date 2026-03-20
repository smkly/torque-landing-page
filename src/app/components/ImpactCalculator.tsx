"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitText } from "@/components/animations/SplitText";

// =============================================================================
// Types
// =============================================================================
type Objective = "volume" | "capital" | "ecosystem";

interface ObjectiveConfig {
  label: string;
  multiplierKey: string;
  stats: [StatConfig, StatConfig, StatConfig];
}

interface StatConfig {
  label: string;
  format: "currency" | "number" | "multiplier";
  suffix?: string;
}

interface CalculationResult {
  primary: number;
  secondary: number;
  roi: number;
}

// =============================================================================
// Constants
// =============================================================================
const OBJECTIVES: Record<Objective, ObjectiveConfig> = {
  volume: {
    label: "Trading Volume",
    multiplierKey: "volume",
    stats: [
      { label: "Projected Volume", format: "currency" },
      { label: "Estimated Traders", format: "number" },
      { label: "Estimated ROI", format: "multiplier", suffix: "x" },
    ],
  },
  capital: {
    label: "Capital",
    multiplierKey: "capital",
    stats: [
      { label: "Projected TVL Impact", format: "currency" },
      { label: "Estimated Participants", format: "number" },
      { label: "Estimated ROI", format: "multiplier", suffix: "x" },
    ],
  },
  ecosystem: {
    label: "Ecosystem",
    multiplierKey: "ecosystem",
    stats: [
      { label: "Projected Activity Increase", format: "multiplier", suffix: "x" },
      { label: "New Creators", format: "number" },
      { label: "Estimated ROI", format: "multiplier", suffix: "x" },
    ],
  },
};

const BUDGET_MIN = 10_000;
const BUDGET_MAX = 500_000;
const BUDGET_STEP = 10_000;

// =============================================================================
// Calculation logic
// =============================================================================
function getEfficiency(budget: number): number {
  if (budget <= 50_000) return 1.0;
  if (budget <= 200_000) return 0.9;
  return 0.7;
}

function getRoiForBudget(budget: number, minRoi: number, maxRoi: number): number {
  // Peak ROI at $50K-$150K, diminishing at extremes
  if (budget <= 50_000) {
    // Ramp up from minRoi to maxRoi as budget increases to 50K
    const t = (budget - BUDGET_MIN) / (50_000 - BUDGET_MIN);
    return minRoi + t * (maxRoi - minRoi);
  }
  if (budget <= 150_000) {
    return maxRoi;
  }
  if (budget <= 350_000) {
    // Gradually decrease from max toward a mid-point
    const t = (budget - 150_000) / (350_000 - 150_000);
    return maxRoi - t * (maxRoi - minRoi) * 0.5;
  }
  // Above $350K, diminish further
  const t = (budget - 350_000) / (BUDGET_MAX - 350_000);
  const midRoi = maxRoi - (maxRoi - minRoi) * 0.5;
  return midRoi - t * (midRoi - minRoi) * 0.5;
}

function calculate(objective: Objective, budget: number): CalculationResult {
  const efficiency = getEfficiency(budget);

  switch (objective) {
    case "volume": {
      const volumeMultiplier = 387 * efficiency;
      const primary = budget * volumeMultiplier;
      const secondary = Math.round((budget / 100) * 3);
      const roi = getRoiForBudget(budget, 5, 13);
      return { primary, secondary, roi };
    }
    case "capital": {
      const tvlMultiplier = 165 * efficiency;
      const primary = budget * tvlMultiplier;
      const secondary = Math.round((budget / 100) * 2.5);
      const roi = getRoiForBudget(budget, 4, 8);
      return { primary, secondary, roi };
    }
    case "ecosystem": {
      const activityMultiplier = 6 * efficiency;
      const primary = activityMultiplier;
      const secondary = Math.round((budget / 100) * 1.5);
      const roi = getRoiForBudget(budget, 3, 7);
      return { primary, secondary, roi };
    }
  }
}

// =============================================================================
// Number formatting
// =============================================================================
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`.replace(".0K", "K");
  }
  return value.toLocaleString();
}

function formatBudget(value: number): string {
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatStat(value: number, format: StatConfig["format"], suffix?: string): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "number":
      return formatNumber(value);
    case "multiplier":
      return `${value.toFixed(1)}${suffix || ""}`;
  }
}

// =============================================================================
// Animated Number Hook
// =============================================================================
function useAnimatedNumber(target: number, duration = 500): number {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(target);

  useEffect(() => {
    startValueRef.current = current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValueRef.current + (target - startValueRef.current) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return current;
}

// =============================================================================
// AnimatedStat Component
// =============================================================================
function AnimatedStat({ value, config }: { value: number; config: StatConfig }) {
  const animated = useAnimatedNumber(value);
  const formatted = formatStat(animated, config.format, config.suffix);

  return (
    <div className="text-center md:text-left">
      <div className="font-display text-3xl sm:text-4xl font-medium text-black tracking-tight leading-none">
        {formatted}
      </div>
      <div className="text-xs text-black/40 mt-1.5 font-mono uppercase tracking-wider">
        {config.label}
      </div>
    </div>
  );
}

// =============================================================================
// Impact Calculator Component
// =============================================================================
export default function ImpactCalculator() {
  const [objective, setObjective] = useState<Objective>("volume");
  const [budget, setBudget] = useState(100_000);

  const results = useMemo(() => calculate(objective, budget), [objective, budget]);

  const objectiveConfig = OBJECTIVES[objective];

  const statValues = useMemo(() => {
    return [results.primary, results.secondary, results.roi] as const;
  }, [results]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  }, []);

  // Calculate slider fill percentage for styling
  const sliderPercent = ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  return (
    <section className="w-full bg-[#F8F9FA]">
      <div className="w-full px-6 md:px-12 lg:px-20 py-32 md:py-52">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 md:mb-14">
          <div
            data-animate="fade-up"
            className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40 border border-black/10 px-2 py-1 rounded-[3px]"
          >
            <span className="w-1 h-1 bg-blue rounded-full" />
            Impact Calculator
          </div>

          <SplitText
            tag="h2"
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-[1.1] tracking-tight"
          >
            <span>Model Your</span>
            <span className="text-black/40">ROI</span>
          </SplitText>

          <p
            data-animate="fade-up"
            className="text-base md:text-lg text-black/60 mt-4 max-w-xl"
          >
            Based on real campaign data from $10M+ in incentive spend.
          </p>
        </div>

        {/* Calculator Card */}
        <div
          data-animate="fade-up"
          className="bg-white rounded-[3px] border border-black/10 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left: Inputs */}
            <div className="flex-1 p-6 md:p-10 lg:border-r border-black/10">
              {/* Objective Selector */}
              <div className="mb-8">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-black/40 mb-3">
                  Objective
                </label>
                <div className="flex gap-2">
                  {(Object.keys(OBJECTIVES) as Objective[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setObjective(key)}
                      className={[
                        "flex-1 px-3 py-2.5 rounded-[3px] font-mono text-[11px] uppercase tracking-wider transition-all duration-200",
                        objective === key
                          ? "bg-blue text-white border border-blue"
                          : "bg-transparent text-black/60 border border-black/10 hover:border-black/30 hover:text-black",
                      ].join(" ")}
                    >
                      {OBJECTIVES[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">
                    Monthly Budget
                  </label>
                  <span className="font-display text-2xl font-medium text-black tracking-tight">
                    {formatBudget(budget)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={budget}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 appearance-none cursor-pointer rounded-full outline-none impact-slider"
                    style={{
                      background: `linear-gradient(to right, #0008FF ${sliderPercent}%, rgba(0,0,0,0.08) ${sliderPercent}%)`,
                    }}
                  />
                </div>

                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-mono text-black/30">$10K</span>
                  <span className="text-[10px] font-mono text-black/30">$500K</span>
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center border-t lg:border-t-0 border-black/10 bg-[#FAFBFC]">
              <div className="grid grid-cols-1 gap-8">
                {objectiveConfig.stats.map((stat, i) => (
                  <AnimatedStat key={stat.label} value={statValues[i]} config={stat} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-t border-black/10 px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-black/40 font-mono">
              These projections are based on verified campaign data.
            </p>
            <Button variant="accent" href="https://torque.so/contact">
              Book a Demo
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scoped slider styles */}
      <style jsx>{`
        .impact-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0008FF;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .impact-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .impact-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0008FF;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        .impact-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  );
}
