import { Zap, Users, TrendingUp, BookOpen, Layers, Trophy, Target, Gift, type LucideIcon } from "lucide-react";

export type CardType = 'RECIPE' | 'FRAMEWORK' | 'CASE_STUDY';

export interface StrategyCard {
  id: string;
  type: CardType;
  title: string;
  slug: string;
  sector: 'Lending' | 'Stablecoins' | 'DEX' | 'LST' | 'General' | 'Perps';
  difficulty?: 'Easy' | 'Intermediate' | 'Hard';
  tags: string[];
  description: string;
  formula?: {
    trigger: string;
    condition: string;
    reward: string;
  };
  metricBadge?: string;
  image: string;
  icon: LucideIcon;
}

export const STRATEGIES: StrategyCard[] = [
  // --- 1. A HIGH-ROI RECIPE (Technical) ---
  {
    id: '01',
    type: 'RECIPE',
    title: 'The "100x" Volume Raffle',
    slug: 'volume-raffle',
    sector: 'DEX',
    difficulty: 'Intermediate',
    tags: ['ROI', 'Gamification'],
    description: 'Stop paying linear rebates. Use "Lottery Psychology" to drive 100x volume per dollar spent.',
    formula: {
      trigger: 'Trade > $100',
      condition: 'User holds 1 Raffle Ticket',
      reward: 'Daily Jackpot (Non-Linear)'
    },
    image: '/generated/image/light-mono/ascending-platforms.jpg',
    icon: Zap
  },

  // --- 2. A BIG CASE STUDY (Social Proof) ---
  {
    id: '07',
    type: 'CASE_STUDY',
    title: 'Tier-1 Solana AMM',
    slug: 'dex-case-study',
    sector: 'DEX',
    tags: ['ROI', 'Volume'],
    description: 'How a top Solana DEX generated 102 SOL of volume for every 1 SOL spent on rewards using Torque raffles.',
    metricBadge: '100x ROI',
    image: '/generated/image/light-mono/floating-mass-02.jpg',
    icon: TrendingUp
  },

  // --- 3. A VIRAL RECIPE (Growth) ---
  {
    id: '02',
    type: 'RECIPE',
    title: 'The Social Distribution Engine',
    slug: 'social-distribution',
    sector: 'Stablecoins',
    difficulty: 'Easy',
    tags: ['Viral Growth', 'Referrals'],
    description: 'Turn passive holders into distribution nodes. Double-sided rewards with Sybil protection.',
    formula: {
      trigger: 'Referee Volume > $500',
      condition: 'Referee Balance > $10 (7d)',
      reward: '$75 Referrer / $40 Referee'
    },
    image: '/generated/image/light-mono/cluster-cubes-02.jpg',
    icon: Users
  },

  // --- 4. A FRAMEWORK (Authority) ---
  {
    id: '09',
    type: 'FRAMEWORK',
    title: 'The Incentive Standards',
    slug: 'incentive-standards',
    sector: 'General',
    tags: ['Strategy', 'Whitepaper'],
    description: 'The official guide to measuring Velocity, Quality, and Retention on Solana. Stop optimizing for vanity metrics.',
    image: '/generated/image/light-mono/infrastructure-light.jpg',
    icon: BookOpen
  },

  // --- 5. A DEFI RECIPE (Sophisticated) ---
  {
    id: '04',
    type: 'RECIPE',
    title: 'The "Looping" Multiplier',
    slug: 'looping-multiplier',
    sector: 'Lending',
    difficulty: 'Hard',
    tags: ['DeFi Composability', 'TVL Boost'],
    description: 'Incentivize sophisticated users to leverage up. Every $1 of incentives generates $3-$5 of TVL.',
    formula: {
      trigger: 'Open Leveraged Position',
      condition: 'Leverage > 3x AND Hold > 7d',
      reward: 'Tiered Bonus (100 - 350 Tokens)'
    },
    image: '/generated/image/light-mono/value-stack-light.jpg',
    icon: Layers
  },

  // --- 6. A STABLECOIN CASE STUDY (Results) ---
  {
    id: '08',
    type: 'CASE_STUDY',
    title: 'RWA Stablecoin Issuer',
    slug: 'stablecoin-case-study',
    sector: 'Stablecoins',
    tags: ['Velocity', 'Growth'],
    description: 'By incentivizing creators, this issuer saw a 42x surge in new token pairs and a 3.3x trading volume increase.',
    metricBadge: '+330% Volume',
    image: '/generated/image/light-mono/cluster-spheres.jpg',
    icon: TrendingUp
  },

  // --- 7. A RETENTION RECIPE (Defense) ---
  {
    id: '03',
    type: 'RECIPE',
    title: 'The "Sticky" LP Rebate',
    slug: 'sticky-lp',
    sector: 'DEX',
    difficulty: 'Hard',
    tags: ['Liquidity', 'Anti-Wash'],
    description: 'Prevent mercenary capital. Rebates only unlock after positions are held for a specific duration.',
    formula: {
      trigger: 'Provide LP > $500',
      condition: 'Position Age > 20 Hours',
      reward: '0.15% Daily Rebate'
    },
    image: '/generated/image/light-mono/vault-light.jpg',
    icon: Trophy
  },

  // --- 8. A B2B RECIPE (Expansion) ---
  {
    id: '05',
    type: 'RECIPE',
    title: 'The Collateral Anchor',
    slug: 'collateral-anchor',
    sector: 'Perps',
    difficulty: 'Intermediate',
    tags: ['B2B Growth', 'Volume'],
    description: 'Drive demand for your asset by subsidizing its use as collateral on Perps DEXs.',
    formula: {
      trigger: 'Deposit Token as Collateral',
      condition: 'Maintain > $1k Avg Balance',
      reward: '0.1% Weekly Rebate'
    },
    image: '/generated/image/light-mono/network-nodes-light.jpg',
    icon: Target
  },

  // --- 9. AN ONBOARDING RECIPE (Activation) ---
  {
    id: '06',
    type: 'RECIPE',
    title: 'The "First-Time" Hook',
    slug: 'first-time-winner',
    sector: 'General',
    difficulty: 'Easy',
    tags: ['Activation', 'Onboarding'],
    description: 'New users who win a reward trade 18x more volume. Hook them with a guaranteed first-time win.',
    formula: {
      trigger: 'First Trade > $10',
      condition: 'Wallet Age < 7 Days',
      reward: 'Guaranteed "Welcome" Bonus'
    },
    image: '/generated/image/light-mono/growth-bars-light.jpg',
    icon: Gift
  }
];
