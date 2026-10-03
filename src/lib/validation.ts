import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  icon: z.string().max(200).optional(),
  reward: z.number().positive().int(),
  taskType: z.enum([
    'telegram_channel',
    'telegram_group',
    'telegram',
    'website_visit',
    'social_follow',
    'promotional',
    'affiliate',
    'custom',
    'social'
  ]).default('custom'),
  targetUrl: z.string().optional().or(z.literal('')),
  verificationType: z.enum(['auto', 'manual', 'callback']).default('manual'),
  dailyLimit: z.number().int().positive().optional(),
  totalLimit: z.number().int().positive().optional(),
  order: z.number().int().optional().default(1),
  isRecurring: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const balanceAdjustmentSchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(2).max(500),
});

export const adminSettingsSchema = z.object({
  dailyCheckinRewards: z.array(z.number().int().nonnegative()).optional(),
  referralEnabled: z.boolean().optional(),
  referralReward: z.number().int().nonnegative().optional(),
  maxReferralReward: z.number().int().nonnegative().optional(),
  adEnabled: z.boolean().optional(),
  adProvider: z.string().optional(),
  adReward: z.number().int().nonnegative().optional(),
  adDailyLimit: z.number().int().nonnegative().optional(),
  adCooldownSeconds: z.number().int().nonnegative().optional(),
  spinDailyLimit: z.number().int().nonnegative().optional(),
  withdrawalEnabled: z.boolean().optional(),
  withdrawalMinimum: z.number().int().nonnegative().optional(),
  withdrawalMaximum: z.number().int().nonnegative().optional(),
  withdrawalCooldownHours: z.number().int().nonnegative().optional(),
  withdrawalMethods: z.array(z.string()).optional(),
  maintenanceMode: z.boolean().optional(),
});
