export interface MultitapLevelConfig {
  level: number;
  earnPerTap: number;
  cost: number;
  requiredUserLevel: number;
}

export const MULTITAP_CONFIGS: Record<number, MultitapLevelConfig> = {
  1: { level: 1, earnPerTap: 3, cost: 0, requiredUserLevel: 1 },
  2: { level: 2, earnPerTap: 4, cost: 2_000, requiredUserLevel: 1 },
  3: { level: 3, earnPerTap: 5, cost: 4_000, requiredUserLevel: 2 },
  4: { level: 4, earnPerTap: 6, cost: 8_000, requiredUserLevel: 3 },
  5: { level: 5, earnPerTap: 7, cost: 16_000, requiredUserLevel: 3 },
  6: { level: 6, earnPerTap: 8, cost: 32_000, requiredUserLevel: 4 },
  7: { level: 7, earnPerTap: 9, cost: 64_000, requiredUserLevel: 5 },
  8: { level: 8, earnPerTap: 10, cost: 128_000, requiredUserLevel: 5 },
  9: { level: 9, earnPerTap: 11, cost: 256_000, requiredUserLevel: 6 },
  10: { level: 10, earnPerTap: 12, cost: 512_000, requiredUserLevel: 6 },
  11: { level: 11, earnPerTap: 13, cost: 1_024_000, requiredUserLevel: 7 },
  12: { level: 12, earnPerTap: 14, cost: 2_048_000, requiredUserLevel: 8 },
  13: { level: 13, earnPerTap: 15, cost: 4_096_000, requiredUserLevel: 9 },
  14: { level: 14, earnPerTap: 16, cost: 8_192_000, requiredUserLevel: 10 },
  15: { level: 15, earnPerTap: 17, cost: 16_384_000, requiredUserLevel: 10 },
};
