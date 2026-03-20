import { Zap, Trophy, Users, type LucideIcon } from "lucide-react";

export interface PlaybookFormula {
  trigger: string;
  condition: string;
  reward: string;
}

export interface Playbook {
  id: string;
  type: "RECIPE" | "CASE_STUDY" | "FRAMEWORK";
  title: string;
  sector: string;
  description: string;
  formula?: PlaybookFormula;
  metricBadge?: string;
  icon: LucideIcon;
  visualType: "raffle" | "network" | "growth";
  visualFill?: "box" | "full";
}

export const featuredPlaybooks: Playbook[] = [
  {
    id: "01",
    type: "CASE_STUDY",
    title: "Winners Arc",
    sector: "Multi-Protocol",
    description:
      "$204M in volume at 5x ROI. Daily leaderboard across Axiom, WLFI, and Raydium.",
    metricBadge: "5x ROI",
    icon: Trophy,
    visualType: "network",
    visualFill: "full",
  },
  {
    id: "02",
    type: "RECIPE",
    title: "Dynamic Rebates",
    sector: "DEX",
    description:
      "$625M in volume from 165K participants. Proportional daily rebates that scale with activity.",
    formula: {
      trigger: "Daily Trading Volume",
      condition: "Proportional Allocation",
      reward: "Dynamic Rebate (bips)",
    },
    metricBadge: "$625M Volume",
    icon: Zap,
    visualType: "raffle",
    visualFill: "full",
  },
  {
    id: "03",
    type: "FRAMEWORK",
    title: "Power User Conversion",
    sector: "Retention",
    description:
      "Reward claimers are 9.4x more likely to become power users.",
    metricBadge: "9.4x Conversion",
    icon: Users,
    visualType: "growth",
    visualFill: "full",
  },
];
