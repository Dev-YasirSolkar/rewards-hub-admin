export interface MultitapLevelConfig {
  level: number;
  earnPerTap: number;
  cost: number;
  requiredUserLevel: number;
}

export const MULTITAP_CONFIGS: Record<number, MultitapLevelConfig> = {
  1: { level: 1, earnPerTap: 1, cost: 0, requiredUserLevel: 1 },
  2: { level: 2, earnPerTap: 2, cost: 1_000, requiredUserLevel: 1 },
  3: { level: 3, earnPerTap: 3, cost: 3_000, requiredUserLevel: 2 },
  4: { level: 4, earnPerTap: 4, cost: 7_500, requiredUserLevel: 3 },
  5: { level: 5, earnPerTap: 5, cost: 15_000, requiredUserLevel: 3 },
  6: { level: 6, earnPerTap: 6, cost: 30_000, requiredUserLevel: 4 },
  7: { level: 7, earnPerTap: 7, cost: 60_000, requiredUserLevel: 5 },
  8: { level: 8, earnPerTap: 8, cost: 120_000, requiredUserLevel: 5 },
  9: { level: 9, earnPerTap: 9, cost: 250_000, requiredUserLevel: 6 },
  10: { level: 10, earnPerTap: 10, cost: 500_000, requiredUserLevel: 6 },
  11: { level: 11, earnPerTap: 11, cost: 1_000_000, requiredUserLevel: 7 },
  12: { level: 12, earnPerTap: 12, cost: 2_000_000, requiredUserLevel: 7 },
  13: { level: 13, earnPerTap: 13, cost: 3_500_000, requiredUserLevel: 8 },
  14: { level: 14, earnPerTap: 14, cost: 5_000_000, requiredUserLevel: 9 },
  15: { level: 15, earnPerTap: 15, cost: 7_500_000, requiredUserLevel: 10 },
};
