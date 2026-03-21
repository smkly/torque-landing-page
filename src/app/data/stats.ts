export interface Stat {
  value: string;
  label: string;
}

export const heroStats: Stat[] = [
  { value: "5x", label: "ROI on Incentive Spend" },
  { value: "$10M+", label: "Incentives Distributed" },
  { value: "$5B+", label: "Incentivized Volume" },
];

// Rotating text phrases for hero
export const heroRotatingPhrases = [
  "100x ROI",
  "Real Users",
  "Zero Waste",
  "Sybil-Free Growth",
  "Proven Results",
];

// Scramble character sets
export const SCRAMBLE_CHARS = {
  stats: "0123456789$MK+%",
  text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&",
};
