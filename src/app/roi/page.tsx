"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";

// =============================================================================
// Types
// =============================================================================
type Objective = "volume" | "capital" | "ecosystem";
type Scenario = "bear" | "base" | "bull";
type Duration = 1 | 3 | 6;

interface ProtocolOption {
  value: string;
  label: string;
}

interface ScenarioResult {
  projectedValue: number;
  newUsers: number;
  feeRevenue: number;
  roiMultiplier: number;
  paybackDays: number;
  monthlyBreakdown: number[];
}

// =============================================================================
// Constants
// =============================================================================
const OBJECTIVES: Record<
  Objective,
  {
    label: string;
    baselineLabel: string;
    baselinePlaceholder: string;
    valueLabel: string;
    usersLabel: string;
    protocols: ProtocolOption[];
  }
> = {
  volume: {
    label: "Trading Volume",
    baselineLabel: "Current Daily Volume",
    baselinePlaceholder: "$5M",
    valueLabel: "Projected Volume",
    usersLabel: "New Traders",
    protocols: [
      { value: "dex", label: "DEXs" },
      { value: "terminal", label: "Trading Terminals" },
      { value: "perps", label: "Perps" },
      { value: "prediction", label: "Prediction Markets" },
      { value: "launchpad", label: "Launchpads" },
    ],
  },
  capital: {
    label: "Capital (TVL)",
    baselineLabel: "Current TVL",
    baselinePlaceholder: "$50M",
    valueLabel: "Projected TVL",
    usersLabel: "New Participants",
    protocols: [
      { value: "tokens", label: "Tokens & Stablecoins" },
      { value: "lending", label: "Lending" },
      { value: "staking", label: "Staking" },
    ],
  },
  ecosystem: {
    label: "Ecosystem",
    baselineLabel: "Current Daily Launches",
    baselinePlaceholder: "100",
    valueLabel: "Projected Activity",
    usersLabel: "New Creators",
    protocols: [
      { value: "launchpad", label: "Launchpads" },
      { value: "prediction", label: "Prediction Markets" },
    ],
  },
};

const MULTIPLIERS: Record<Objective, Record<Scenario, number>> = {
  volume: { bear: 2.5, base: 5.9, bull: 13 },
  capital: { bear: 2, base: 5, bull: 10 },
  ecosystem: { bear: 3, base: 6, bull: 15 },
};

const USER_RATE: Record<Objective, number> = {
  volume: 3, // per $100
  capital: 2.5,
  ecosystem: 1.5,
};

const FEE_RATE: Record<Objective, number> = {
  volume: 0.0015,
  capital: 0.04 / 12, // 4% annualized, monthly
  ecosystem: 0.0075,
};

const RETENTION: Record<Objective, number> = {
  volume: 0.6,
  capital: 0.75,
  ecosystem: 0.5,
};

const DECAY: Record<Objective, number> = {
  volume: 0.4,
  capital: 1.0, // TVL retained users carry full value
  ecosystem: 1.0,
};

const BUDGET_MIN = 10_000;
const BUDGET_MAX = 500_000;
const BUDGET_STEP = 10_000;

const SCENARIO_META: Record<
  Scenario,
  { label: string; color: string; bgClass: string; borderClass: string; textClass: string; dotClass: string; chartColor: string }
> = {
  bear: {
    label: "Bear",
    color: "#D97706",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    textClass: "text-amber-700",
    dotClass: "bg-amber-500",
    chartColor: "#D97706",
  },
  base: {
    label: "Base",
    color: "#0008FF",
    bgClass: "bg-blue/5",
    borderClass: "border-blue/20",
    textClass: "text-blue",
    dotClass: "bg-blue",
    chartColor: "#0008FF",
  },
  bull: {
    label: "Bull",
    color: "#059669",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-700",
    dotClass: "bg-emerald-500",
    chartColor: "#059669",
  },
};

// =============================================================================
// Utility: Budget efficiency
// =============================================================================
function getEfficiency(budget: number): number {
  if (budget <= 50_000) return 1.0;
  if (budget <= 200_000) return 0.85;
  return 0.65;
}

// =============================================================================
// Utility: Number formatting
// =============================================================================
function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    const v = value / 1_000_000_000;
    return `$${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return `$${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)}M`;
  }
  if (value >= 1_000) {
    const v = value / 1_000;
    return `$${v >= 10 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const v = value / 1_000;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatActivityCompact(value: number): string {
  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const v = value / 1_000;
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatBudget(value: number): string {
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function parseBaselineInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.kmb]/gi, "");
  const match = cleaned.match(/^([0-9.]+)\s*([kmb])?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return 0;
  const suffix = (match[2] || "").toLowerCase();
  if (suffix === "b") return num * 1_000_000_000;
  if (suffix === "m") return num * 1_000_000;
  if (suffix === "k") return num * 1_000;
  return num;
}

// =============================================================================
// Calculation Engine
// =============================================================================
function calculateScenario(
  objective: Objective,
  scenario: Scenario,
  budget: number,
  duration: Duration,
  baseline: number
): ScenarioResult {
  const multiplier = MULTIPLIERS[objective][scenario];
  const efficiency = getEfficiency(budget);
  const effectiveBudget = budget * efficiency;
  const retention = RETENTION[objective];
  const decay = DECAY[objective];
  const usersPerHundred = USER_RATE[objective];
  const feeRate = FEE_RATE[objective];

  const monthlyBreakdown: number[] = [];
  let cumulativeValue = 0;
  let totalNewUsers = 0;
  let totalFeeRevenue = 0;

  for (let month = 0; month < duration; month++) {
    // New value generated this month from fresh spend
    const newMonthValue = effectiveBudget * multiplier;

    // Carried-over value from all previous months
    let carriedValue = 0;
    for (let prev = 0; prev < month; prev++) {
      const monthsBack = month - prev;
      const retainedFraction = Math.pow(retention, monthsBack) * decay;
      const prevMonthNewValue = effectiveBudget * multiplier;
      carriedValue += prevMonthNewValue * retainedFraction;
    }

    const monthTotal = newMonthValue + carriedValue;
    cumulativeValue += monthTotal;
    monthlyBreakdown.push(cumulativeValue);

    // Users
    const newUsers = (effectiveBudget / 100) * usersPerHundred;
    totalNewUsers += newUsers;

    // Fee revenue
    if (objective === "volume") {
      totalFeeRevenue += monthTotal * feeRate;
    } else if (objective === "capital") {
      totalFeeRevenue += monthTotal * feeRate;
    } else {
      totalFeeRevenue += monthTotal * feeRate * 100; // creator volume estimate
    }
  }

  const totalSpend = budget * duration;
  const roiMultiplier = totalSpend > 0 ? cumulativeValue / totalSpend : 0;

  // Payback: how many days into the campaign to recoup spend via fee revenue
  const dailyFeeRevenue = totalFeeRevenue / (duration * 30);
  const paybackDays =
    dailyFeeRevenue > 0 ? Math.min(Math.ceil(totalSpend / dailyFeeRevenue), duration * 30) : duration * 30;

  // For volume/capital, projected value is the final month's running total (cumulative)
  // For ecosystem, it's the activity level
  let projectedValue: number;
  if (objective === "ecosystem") {
    // Show the final monthly activity rate, not cumulative
    const lastMonthValue = monthlyBreakdown[monthlyBreakdown.length - 1] - (monthlyBreakdown.length > 1 ? monthlyBreakdown[monthlyBreakdown.length - 2] : 0);
    projectedValue = baseline + lastMonthValue;
  } else {
    projectedValue = baseline + cumulativeValue;
  }

  return {
    projectedValue,
    newUsers: Math.round(totalNewUsers),
    feeRevenue: totalFeeRevenue,
    roiMultiplier,
    paybackDays,
    monthlyBreakdown,
  };
}

// =============================================================================
// Hook: useAnimatedNumber
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
      const eased = 1 - Math.pow(1 - progress, 3);
      const value =
        startValueRef.current + (target - startValueRef.current) * eased;
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
// Component: AnimatedValue
// =============================================================================
function AnimatedValue({
  value,
  formatter,
  className,
}: {
  value: number;
  formatter: (v: number) => string;
  className?: string;
}) {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{formatter(animated)}</span>;
}

// =============================================================================
// Component: ProjectionChart (Canvas)
// =============================================================================
function ProjectionChart({
  results,
  duration,
  objective,
  baseline,
}: {
  results: Record<Scenario, ScenarioResult>;
  duration: Duration;
  objective: Objective;
  baseline: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationProgress = useRef(0);
  const animationRef = useRef<number | null>(null);
  const prevResultsRef = useRef<string>("");

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Padding
      const padLeft = 72;
      const padRight = 80;
      const padTop = 24;
      const padBottom = 40;
      const chartW = W - padLeft - padRight;
      const chartH = H - padTop - padBottom;

      // Data
      const scenarios: Scenario[] = ["bear", "base", "bull"];
      const allValues: number[] = [baseline];
      scenarios.forEach((s) => {
        results[s].monthlyBreakdown.forEach((v) => {
          if (objective === "ecosystem") {
            allValues.push(baseline + v);
          } else {
            allValues.push(baseline + v);
          }
        });
      });

      const maxVal = Math.max(...allValues) * 1.1;
      const minVal = Math.min(0, baseline * 0.5);

      // Grid lines
      const gridLines = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= gridLines; i++) {
        const y = padTop + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.font = "10px 'Geist Mono', monospace";
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= gridLines; i++) {
        const y = padTop + (chartH / gridLines) * i;
        const val = maxVal - ((maxVal - minVal) / gridLines) * i;
        let label: string;
        if (objective === "ecosystem") {
          label = formatActivityCompact(Math.max(0, val));
        } else {
          label = formatCompact(Math.max(0, val));
        }
        ctx.fillText(label, padLeft - 10, y);
      }

      // X-axis labels
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const months = duration;
      for (let i = 0; i <= months; i++) {
        const x = padLeft + (chartW / months) * i;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillText(i === 0 ? "Start" : `Mo ${i}`, x, padTop + chartH + 12);
      }

      // Vertical grid lines
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= months; i++) {
        const x = padLeft + (chartW / months) * i;
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + chartH);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Baseline dashed line
      const baselineY =
        padTop + chartH - ((baseline - minVal) / (maxVal - minVal)) * chartH;
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, baselineY);
      ctx.lineTo(padLeft + chartW, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline label
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.font = "9px 'Geist Mono', monospace";
      ctx.fillText("BASELINE", padLeft + 4, baselineY - 4);

      // Draw scenario lines
      const clampedProgress = Math.min(progress, 1);
      scenarios.forEach((s) => {
        const meta = SCENARIO_META[s];
        const breakdown = results[s].monthlyBreakdown;
        const points: { x: number; y: number }[] = [];

        // Start point at baseline
        points.push({
          x: padLeft,
          y:
            padTop +
            chartH -
            ((baseline - minVal) / (maxVal - minVal)) * chartH,
        });

        breakdown.forEach((cumVal, i) => {
          const val = objective === "ecosystem" ? baseline + cumVal : baseline + cumVal;
          points.push({
            x: padLeft + (chartW / months) * (i + 1),
            y: padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH,
          });
        });

        // Animated drawing
        const totalSegments = points.length - 1;
        const segmentsToDraw = clampedProgress * totalSegments;

        // Gradient fill under line
        const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
        gradient.addColorStop(0, meta.color + "18");
        gradient.addColorStop(1, meta.color + "02");

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let seg = 0; seg < Math.min(Math.ceil(segmentsToDraw), totalSegments); seg++) {
          const fraction =
            seg < Math.floor(segmentsToDraw) ? 1 : segmentsToDraw - seg;
          const p0 = points[seg];
          const p1 = points[seg + 1];
          const x = p0.x + (p1.x - p0.x) * fraction;
          const y = p0.y + (p1.y - p0.y) * fraction;
          ctx.lineTo(x, y);
        }
        // Close fill path
        const lastDrawnSeg = Math.min(Math.ceil(segmentsToDraw), totalSegments);
        const lastFrac = lastDrawnSeg > 0 ? (lastDrawnSeg <= segmentsToDraw ? 1 : segmentsToDraw - (lastDrawnSeg - 1)) : 0;
        let lastX: number, lastY: number;
        if (lastDrawnSeg > 0) {
          const p0 = points[lastDrawnSeg - 1];
          const p1 = points[Math.min(lastDrawnSeg, points.length - 1)];
          lastX = p0.x + (p1.x - p0.x) * lastFrac;
          lastY = p0.y + (p1.y - p0.y) * lastFrac;
        } else {
          lastX = points[0].x;
          lastY = points[0].y;
        }
        ctx.lineTo(lastX, padTop + chartH);
        ctx.lineTo(points[0].x, padTop + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let seg = 0; seg < Math.min(Math.ceil(segmentsToDraw), totalSegments); seg++) {
          const fraction =
            seg < Math.floor(segmentsToDraw) ? 1 : segmentsToDraw - seg;
          const p0 = points[seg];
          const p1 = points[seg + 1];
          const x = p0.x + (p1.x - p0.x) * fraction;
          const y = p0.y + (p1.y - p0.y) * fraction;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        // End dot and label
        if (clampedProgress >= 0.95 && points.length > 1) {
          const lastPt = points[points.length - 1];
          // Dot
          ctx.beginPath();
          ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = meta.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lastPt.x, lastPt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();

          // Label
          const finalVal = objective === "ecosystem"
            ? baseline + breakdown[breakdown.length - 1]
            : baseline + breakdown[breakdown.length - 1];
          const label = objective === "ecosystem"
            ? formatActivityCompact(finalVal)
            : formatCompact(finalVal);
          ctx.font = "bold 10px 'Geist Mono', monospace";
          ctx.fillStyle = meta.color;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label, lastPt.x + 10, lastPt.y);
        }
      });
    },
    [results, duration, objective, baseline]
  );

  // Trigger animation on data change
  useEffect(() => {
    const key = JSON.stringify({ results, duration, objective, baseline });
    if (key === prevResultsRef.current) return;
    prevResultsRef.current = key;

    animationProgress.current = 0;
    const startTime = performance.now();
    const animDuration = 800;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      animationProgress.current = eased;
      draw(eased);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [results, duration, objective, baseline, draw]);

  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      draw(animationProgress.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full h-[300px] relative">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

// =============================================================================
// Component: ScenarioCard
// =============================================================================
function ScenarioCard({
  scenario,
  result,
  objective,
}: {
  scenario: Scenario;
  result: ScenarioResult;
  objective: Objective;
}) {
  const meta = SCENARIO_META[scenario];
  const config = OBJECTIVES[objective];

  const valueFormatter =
    objective === "ecosystem" ? formatActivityCompact : formatCompact;

  return (
    <div
      className={`rounded-[3px] border ${meta.borderClass} ${meta.bgClass} p-5 transition-all duration-200 hover:shadow-card`}
    >
      {/* Scenario Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
        <span
          className={`font-mono text-[10px] uppercase tracking-wider font-medium ${meta.textClass}`}
        >
          {meta.label} Case
        </span>
      </div>

      {/* Primary Metric */}
      <div className="mb-4">
        <AnimatedValue
          value={result.projectedValue}
          formatter={valueFormatter}
          className="font-display text-2xl sm:text-3xl font-medium text-black tracking-tight leading-none"
        />
        <div className="text-[10px] font-mono uppercase tracking-wider text-black/40 mt-1">
          {config.valueLabel}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="space-y-3 pt-3 border-t border-black/5">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-black/50">{config.usersLabel}</span>
          <AnimatedValue
            value={result.newUsers}
            formatter={formatCount}
            className="font-mono text-sm font-medium text-black"
          />
        </div>

        {objective === "volume" && (
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-black/50">Fee Revenue</span>
            <AnimatedValue
              value={result.feeRevenue}
              formatter={formatCompact}
              className="font-mono text-sm font-medium text-black"
            />
          </div>
        )}

        <div className="flex justify-between items-baseline">
          <span className="text-xs text-black/50">ROI Multiplier</span>
          <AnimatedValue
            value={result.roiMultiplier}
            formatter={(v) => `${v.toFixed(1)}x`}
            className={`font-mono text-sm font-semibold ${meta.textClass}`}
          />
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xs text-black/50">Payback Period</span>
          <AnimatedValue
            value={result.paybackDays}
            formatter={(v) => `${Math.round(v)}d`}
            className="font-mono text-sm font-medium text-black"
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function ROIPage() {
  const [objective, setObjective] = useState<Objective>("volume");
  const [protocol, setProtocol] = useState("dex");
  const [baselineRaw, setBaselineRaw] = useState("5000000");
  const [budget, setBudget] = useState(100_000);
  const [duration, setDuration] = useState<Duration>(3);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const protocolRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (protocolRef.current && !protocolRef.current.contains(e.target as Node)) {
        setIsProtocolOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset protocol when objective changes
  useEffect(() => {
    setProtocol(OBJECTIVES[objective].protocols[0].value);
    // Set reasonable default baselines
    if (objective === "volume") setBaselineRaw("5000000");
    else if (objective === "capital") setBaselineRaw("50000000");
    else setBaselineRaw("100");
  }, [objective]);

  const baseline = useMemo(() => {
    const parsed = parseBaselineInput(baselineRaw);
    return parsed > 0 ? parsed : 0;
  }, [baselineRaw]);

  const results = useMemo(() => {
    const scenarios: Scenario[] = ["bear", "base", "bull"];
    const out: Record<Scenario, ScenarioResult> = {} as Record<Scenario, ScenarioResult>;
    scenarios.forEach((s) => {
      out[s] = calculateScenario(objective, s, budget, duration, baseline);
    });
    return out;
  }, [objective, budget, duration, baseline]);

  const sliderPercent =
    ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  const config = OBJECTIVES[objective];
  const selectedProtocol = config.protocols.find((p) => p.value === protocol);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBudget(Number(e.target.value));
    },
    []
  );

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-white pt-24 md:pt-32">
        <section className="w-full bg-[#F8F9FA]">
          <div className="w-full px-6 md:px-12 lg:px-20 py-20 md:py-32">
            {/* Page Header */}
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-wider text-black/40 border border-black/10 px-2 py-1 rounded-[3px]">
                <span className="w-1 h-1 bg-blue rounded-full" />
                ROI Calculator
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-black leading-[1.1] tracking-tight">
                Model Your{" "}
                <span className="text-black/40">Impact</span>
              </h1>
              <p className="text-base md:text-lg text-black/60 mt-4 max-w-xl">
                Projected returns across bear, base, and bull scenarios. Based
                on $10M+ in verified campaign data.
              </p>
            </div>

            {/* Calculator Body */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* ============================== */}
              {/* INPUT PANEL */}
              {/* ============================== */}
              <div className="w-full lg:w-[380px] lg:flex-shrink-0">
                <div className="bg-white rounded-[3px] border border-black/10 p-6 md:p-8 space-y-7 sticky top-32">
                  {/* 1. Objective Selector */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-black/40 mb-3">
                      Objective
                    </label>
                    <div className="flex gap-2">
                      {(Object.keys(OBJECTIVES) as Objective[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setObjective(key)}
                          className={[
                            "flex-1 px-2 py-2.5 rounded-[3px] font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
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

                  {/* 2. Protocol Type */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-black/40 mb-3">
                      Protocol Type
                    </label>
                    <div ref={protocolRef} className="relative">
                      <button
                        onClick={() => setIsProtocolOpen(!isProtocolOpen)}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-[3px] border border-black/10 hover:border-black/30 transition-colors text-sm text-black bg-white"
                      >
                        <span>{selectedProtocol?.label || "Select..."}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-black/40 transition-transform duration-200 ${isProtocolOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isProtocolOpen && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-black/10 rounded-[3px] shadow-card overflow-hidden">
                          {config.protocols.map((p) => (
                            <button
                              key={p.value}
                              onClick={() => {
                                setProtocol(p.value);
                                setIsProtocolOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                protocol === p.value
                                  ? "bg-blue/5 text-blue font-medium"
                                  : "text-black/70 hover:bg-black/5"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Current Baseline */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-black/40 mb-3">
                      {config.baselineLabel}
                    </label>
                    <input
                      type="text"
                      value={baselineRaw}
                      onChange={(e) => setBaselineRaw(e.target.value)}
                      placeholder={config.baselinePlaceholder}
                      className="w-full px-4 py-2.5 rounded-[3px] border border-black/10 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20 transition-all text-sm text-black placeholder:text-black/30 font-mono"
                    />
                    {baseline > 0 && (
                      <div className="mt-1.5 text-[10px] font-mono text-black/30">
                        {objective === "ecosystem"
                          ? `= ${formatActivityCompact(baseline)} daily`
                          : `= ${formatCompact(baseline)}`}
                      </div>
                    )}
                  </div>

                  {/* 4. Monthly Budget */}
                  <div>
                    <div className="flex items-baseline justify-between mb-3">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-black/40">
                        Monthly Budget
                      </label>
                      <span className="font-display text-xl font-medium text-black tracking-tight">
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
                        className="w-full h-1.5 appearance-none cursor-pointer rounded-full outline-none roi-slider"
                        style={{
                          background: `linear-gradient(to right, #0008FF ${sliderPercent}%, rgba(0,0,0,0.08) ${sliderPercent}%)`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-mono text-black/30">
                        $10K
                      </span>
                      <span className="text-[10px] font-mono text-black/30">
                        $500K
                      </span>
                    </div>
                    {budget > 200_000 && (
                      <div className="mt-2 px-2 py-1.5 rounded-[3px] bg-amber-50 border border-amber-200">
                        <span className="text-[10px] font-mono text-amber-700">
                          Diminishing returns above $200K (65% efficiency)
                        </span>
                      </div>
                    )}
                    {budget > 50_000 && budget <= 200_000 && (
                      <div className="mt-2 px-2 py-1.5 rounded-[3px] bg-blue/5 border border-blue/10">
                        <span className="text-[10px] font-mono text-blue/70">
                          85% efficiency at this spend level
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 5. Duration */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-black/40 mb-3">
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {([1, 3, 6] as Duration[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={[
                            "flex-1 px-3 py-2.5 rounded-[3px] font-mono text-[11px] uppercase tracking-wider transition-all duration-200",
                            duration === d
                              ? "bg-blue text-white border border-blue"
                              : "bg-transparent text-black/60 border border-black/10 hover:border-black/30 hover:text-black",
                          ].join(" ")}
                        >
                          {d} {d === 1 ? "Month" : "Months"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================== */}
              {/* RESULTS PANEL */}
              {/* ============================== */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* Scenario Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(["bear", "base", "bull"] as Scenario[]).map((s) => (
                    <ScenarioCard
                      key={s}
                      scenario={s}
                      result={results[s]}
                      objective={objective}
                    />
                  ))}
                </div>

                {/* Projection Chart */}
                <div className="bg-white rounded-[3px] border border-black/10 p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-black/40">
                      Cumulative Projection
                    </h3>
                    <div className="flex items-center gap-4">
                      {(["bear", "base", "bull"] as Scenario[]).map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: SCENARIO_META[s].color }}
                          />
                          <span className="font-mono text-[10px] text-black/40">
                            {SCENARIO_META[s].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ProjectionChart
                    results={results}
                    duration={duration}
                    objective={objective}
                    baseline={baseline}
                  />
                </div>

                {/* Methodology Note */}
                <div className="bg-white rounded-[3px] border border-black/10 p-5 md:p-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-black/40 mb-3">
                    Methodology
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-black/50 leading-relaxed">
                    <div>
                      <span className="font-medium text-black/70 block mb-1">
                        Multipliers
                      </span>
                      Bear {MULTIPLIERS[objective].bear}x / Base{" "}
                      {MULTIPLIERS[objective].base}x / Bull{" "}
                      {MULTIPLIERS[objective].bull}x on spend
                    </div>
                    <div>
                      <span className="font-medium text-black/70 block mb-1">
                        Compounding
                      </span>
                      {(RETENTION[objective] * 100).toFixed(0)}% user retention
                      month-over-month with decayed contribution
                    </div>
                    <div>
                      <span className="font-medium text-black/70 block mb-1">
                        Efficiency Curve
                      </span>
                      100% up to $50K, 85% at $50-200K, 65% above $200K
                      (diminishing returns)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-16 pt-8 border-t border-black/10">
              <p className="text-xs text-black/40 font-mono mb-6 max-w-2xl">
                Projections based on historical campaign data. Actual results
                vary by protocol, market conditions, and campaign design.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-sm text-black/60">
                  Ready to run these numbers for real?
                </span>
                <div className="flex gap-3">
                  <Button variant="accent" href="https://torque.so/contact">
                    Book a Demo
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" href="/solutions">
                    View Solutions
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="h-screen" />
      <Footer />

      {/* Scoped slider styles */}
      <style jsx>{`
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0008ff;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .roi-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .roi-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0008ff;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        .roi-slider::-moz-range-track {
          height: 6px;
          border-radius: 9999px;
        }
      `}</style>
    </>
  );
}
