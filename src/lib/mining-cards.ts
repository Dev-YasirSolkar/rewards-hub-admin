export interface MiningCardDef {
  id: string;
  name: string;
  category: 'Gadgets' | 'Friends' | 'Future Tech' | 'Specials';
  icon: string;
  emoji: string;
  description: string;
  baseCost: number;
  costMult: number;
  baseProfit: number;
  profitMult: number;
  requiredLevel: number;        // User character tier required (1..7)
  maxLevel: number;             // Maximum upgradable level cap (12..30)
  requiredCardId?: string;      // Prerequisite card ID needed to unlock
  requiredCardLevel?: number;   // Prerequisite card level needed to unlock
}

export const MINING_CARDS: MiningCardDef[] = [
  // ── 1. FAST FOOD & TREATS (9 Cards) ──────────────────────────────────────
  {
    id: 'fan_token',
    name: 'Gold Burger',
    category: 'Gadgets',
    icon: '🍔',
    emoji: '🍔',
    description: 'Juicy flame-grilled burger generating steady Yasir Fest dividends.',
    baseCost: 150,
    costMult: 1.6,
    baseProfit: 25,
    profitMult: 1.25,
    requiredLevel: 1,
    maxLevel: 30,
  },
  {
    id: 'staking_pool',
    name: 'Cheese Pizza',
    category: 'Gadgets',
    icon: '🍕',
    emoji: '🍕',
    description: 'Wood-fired molten cheese pizza boosting hourly earnings.',
    baseCost: 450,
    costMult: 1.65,
    baseProfit: 75,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 28,
    requiredCardId: 'fan_token',
    requiredCardLevel: 3,
  },
  {
    id: 'dex_listing',
    name: 'Crispy Fries',
    category: 'Gadgets',
    icon: '🍟',
    emoji: '🍟',
    description: 'Golden salted potato fries loved by all crypto foodies.',
    baseCost: 1400,
    costMult: 1.7,
    baseProfit: 220,
    profitMult: 1.3,
    requiredLevel: 2,
    maxLevel: 25,
    requiredCardId: 'staking_pool',
    requiredCardLevel: 4,
  },
  {
    id: 'margin_trading',
    name: 'Taco Feast',
    category: 'Gadgets',
    icon: '🌮',
    emoji: '🌮',
    description: 'Spicy Mexican taco wrap delivering high-yield crunch.',
    baseCost: 3800,
    costMult: 1.75,
    baseProfit: 600,
    profitMult: 1.32,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'staking_pool',
    requiredCardLevel: 6,
  },
  {
    id: 'dress_up_camera',
    name: 'Donut Glaze',
    category: 'Gadgets',
    icon: '🍩',
    emoji: '🍩',
    description: 'Sweet strawberry glazed donuts fueling high-roller kitchens.',
    baseCost: 7500,
    costMult: 1.78,
    baseProfit: 1200,
    profitMult: 1.33,
    requiredLevel: 3,
    maxLevel: 20,
    requiredCardId: 'staking_pool',
    requiredCardLevel: 8,
  },
  {
    id: 'hot_dog',
    name: 'Hot Dog',
    category: 'Gadgets',
    icon: '🌭',
    emoji: '🌭',
    description: 'Classic gourmet hot dog packed with savory goodness.',
    baseCost: 900,
    costMult: 1.65,
    baseProfit: 150,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 24,
    requiredCardId: 'fan_token',
    requiredCardLevel: 4,
  },
  {
    id: 'hopter_boost',
    name: 'Waffle Stack',
    category: 'Gadgets',
    icon: '🧇',
    emoji: '🧇',
    description: 'Honey-dripped crispy waffles boosting kitchen momentum.',
    baseCost: 2600,
    costMult: 1.7,
    baseProfit: 420,
    profitMult: 1.3,
    requiredLevel: 2,
    maxLevel: 20,
    requiredCardId: 'hot_dog',
    requiredCardLevel: 4,
  },
  {
    id: 'choco_bar',
    name: 'Choco Bar',
    category: 'Gadgets',
    icon: '🍫',
    emoji: '🍫',
    description: 'Rich dark Belgian chocolate bar running automated returns.',
    baseCost: 6500,
    costMult: 1.75,
    baseProfit: 1050,
    profitMult: 1.33,
    requiredLevel: 3,
    maxLevel: 16,
    requiredCardId: 'hot_dog',
    requiredCardLevel: 6,
  },
  {
    id: 'gourmet_tablecloth',
    name: 'Boba Tea',
    category: 'Gadgets',
    icon: '🧋',
    emoji: '🧋',
    description: 'Refreshing boba milk tea keeping chef stamina at peak levels.',
    baseCost: 3200,
    costMult: 1.72,
    baseProfit: 520,
    profitMult: 1.31,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'staking_pool',
    requiredCardLevel: 5,
  },

  // ── 2. KITCHEN SQUAD (9 Cards) ───────────────────────────────────────────
  {
    id: 'telegram_channel',
    name: 'Master Chef',
    category: 'Friends',
    icon: '👨‍🍳',
    emoji: '👨‍🍳',
    description: 'Expert culinary captain directing all line operations.',
    baseCost: 200,
    costMult: 1.6,
    baseProfit: 35,
    profitMult: 1.25,
    requiredLevel: 1,
    maxLevel: 30,
  },
  {
    id: 'influencer_collab',
    name: 'Grill Bot',
    category: 'Friends',
    icon: '🤖',
    emoji: '🤖',
    description: 'Automated AI grill assistant cooking burgers to perfection.',
    baseCost: 650,
    costMult: 1.65,
    baseProfit: 110,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 28,
    requiredCardId: 'telegram_channel',
    requiredCardLevel: 3,
  },
  {
    id: 'meme_campaign',
    name: 'Waiter Drone',
    category: 'Friends',
    icon: '🛸',
    emoji: '🛸',
    description: 'High-speed aerial delivery drone serving VIP diners.',
    baseCost: 1900,
    costMult: 1.7,
    baseProfit: 300,
    profitMult: 1.3,
    requiredLevel: 2,
    maxLevel: 25,
    requiredCardId: 'influencer_collab',
    requiredCardLevel: 4,
  },
  {
    id: 'podcast',
    name: 'Delivery Boy',
    category: 'Friends',
    icon: '🛵',
    emoji: '🛵',
    description: 'Lightning-fast courier rushing hot meals across the city.',
    baseCost: 4800,
    costMult: 1.75,
    baseProfit: 760,
    profitMult: 1.32,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'influencer_collab',
    requiredCardLevel: 6,
  },
  {
    id: 'cashier_ai',
    name: 'Cashier AI',
    category: 'Friends',
    icon: '💻',
    emoji: '💻',
    description: 'Intelligent POS terminal optimizing profit calculations.',
    baseCost: 9500,
    costMult: 1.78,
    baseProfit: 1500,
    profitMult: 1.34,
    requiredLevel: 3,
    maxLevel: 20,
    requiredCardId: 'influencer_collab',
    requiredCardLevel: 8,
  },
  {
    id: 'recipe_guru',
    name: 'Recipe Guru',
    category: 'Friends',
    icon: '📜',
    emoji: '📜',
    description: 'Mastermind food scholar inventing legendary fusion dishes.',
    baseCost: 1200,
    costMult: 1.68,
    baseProfit: 190,
    profitMult: 1.29,
    requiredLevel: 1,
    maxLevel: 24,
    requiredCardId: 'telegram_channel',
    requiredCardLevel: 5,
  },
  {
    id: 'food_critic',
    name: 'Food Critic',
    category: 'Friends',
    icon: '🧐',
    emoji: '🧐',
    description: '5-star food reviews creating viral customer hype.',
    baseCost: 5500,
    costMult: 1.75,
    baseProfit: 880,
    profitMult: 1.32,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'recipe_guru',
    requiredCardLevel: 4,
  },
  {
    id: 'sensei_class',
    name: 'Safety Guard',
    category: 'Friends',
    icon: '🛡️',
    emoji: '🛡️',
    description: 'Strict kitchen discipline keeping uptime at 99.9%.',
    baseCost: 3500,
    costMult: 1.72,
    baseProfit: 550,
    profitMult: 1.31,
    requiredLevel: 2,
    maxLevel: 18,
    requiredCardId: 'recipe_guru',
    requiredCardLevel: 6,
  },
  {
    id: 'vip_butler',
    name: 'VIP Butler',
    category: 'Friends',
    icon: '🤵',
    emoji: '🤵',
    description: 'Elite hospitality concierge catering to billionaire patrons.',
    baseCost: 15000,
    costMult: 1.8,
    baseProfit: 2400,
    profitMult: 1.35,
    requiredLevel: 4,
    maxLevel: 15,
    requiredCardId: 'recipe_guru',
    requiredCardLevel: 8,
  },

  // ── 3. KITCHEN TECH (9 Cards) ────────────────────────────────────────────
  {
    id: 'cloud_nodes',
    name: 'Smart Oven',
    category: 'Future Tech',
    icon: '♨️',
    emoji: '♨️',
    description: 'High-precision digital oven baking batches at 10x speed.',
    baseCost: 250,
    costMult: 1.6,
    baseProfit: 45,
    profitMult: 1.25,
    requiredLevel: 1,
    maxLevel: 30,
  },
  {
    id: 'small_light',
    name: 'Blast Freezer',
    category: 'Future Tech',
    icon: '❄️',
    emoji: '❄️',
    description: 'Sub-zero rapid freezer preserving ingredients at peak freshness.',
    baseCost: 750,
    costMult: 1.65,
    baseProfit: 130,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 28,
    requiredCardId: 'cloud_nodes',
    requiredCardLevel: 3,
  },
  {
    id: 'security_audit',
    name: 'Auto Fryer',
    category: 'Future Tech',
    icon: '🍳',
    emoji: '🍳',
    description: 'Automated oil bath frying golden crispy appetizers.',
    baseCost: 2400,
    costMult: 1.7,
    baseProfit: 380,
    profitMult: 1.3,
    requiredLevel: 2,
    maxLevel: 24,
    requiredCardId: 'small_light',
    requiredCardLevel: 4,
  },
  {
    id: 'ai_bot',
    name: 'Juice Press',
    category: 'Future Tech',
    icon: '🧃',
    emoji: '🧃',
    description: 'Cold-pressed extractor squeezing fresh organic juices.',
    baseCost: 850,
    costMult: 1.65,
    baseProfit: 145,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 28,
  },
  {
    id: 'shock_gun',
    name: 'Solar Grill',
    category: 'Future Tech',
    icon: '☀️',
    emoji: '☀️',
    description: 'Solar thermal BBQ searing steaks with clean energy.',
    baseCost: 2100,
    costMult: 1.7,
    baseProfit: 330,
    profitMult: 1.3,
    requiredLevel: 1,
    maxLevel: 25,
    requiredCardId: 'ai_bot',
    requiredCardLevel: 3,
  },
  {
    id: 'ton_bridge',
    name: 'Spice Lab',
    category: 'Future Tech',
    icon: '🌶️',
    emoji: '🌶️',
    description: 'Molecular spice synthesizer blending exotic flavors.',
    baseCost: 6800,
    costMult: 1.75,
    baseProfit: 1100,
    profitMult: 1.32,
    requiredLevel: 3,
    maxLevel: 20,
    requiredCardId: 'small_light',
    requiredCardLevel: 6,
  },
  {
    id: 'copy_robot',
    name: '3D Food Rig',
    category: 'Future Tech',
    icon: '🖨️',
    emoji: '🖨️',
    description: '3D bio-printer fabricating intricate culinary delicacies.',
    baseCost: 4200,
    costMult: 1.73,
    baseProfit: 660,
    profitMult: 1.31,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'shock_gun',
    requiredCardLevel: 4,
  },
  {
    id: 'weather_box',
    name: 'Steam Boiler',
    category: 'Future Tech',
    icon: '💨',
    emoji: '💨',
    description: 'Industrial steam station cooking dim sums and delicate soups.',
    baseCost: 8200,
    costMult: 1.78,
    baseProfit: 1300,
    profitMult: 1.33,
    requiredLevel: 3,
    maxLevel: 18,
    requiredCardId: 'shock_gun',
    requiredCardLevel: 6,
  },
  {
    id: 'dream_director',
    name: 'Hydro Farm',
    category: 'Future Tech',
    icon: '🥬',
    emoji: '🥬',
    description: 'Vertical aeroponic greenhouse growing crisp organic greens.',
    baseCost: 14000,
    costMult: 1.8,
    baseProfit: 2250,
    profitMult: 1.35,
    requiredLevel: 4,
    maxLevel: 15,
    requiredCardId: 'shock_gun',
    requiredCardLevel: 8,
  },

  // ── 4. ROYAL SPECIALS (8 Cards) ──────────────────────────────────────────
  {
    id: 'global_license',
    name: 'Solkar Secret',
    category: 'Specials',
    icon: '👑',
    emoji: '👑',
    description: "Yasir Solkar's secret spice recipe unlocking massive feast yield.",
    baseCost: 300,
    costMult: 1.6,
    baseProfit: 50,
    profitMult: 1.25,
    requiredLevel: 1,
    maxLevel: 30,
  },
  {
    id: 'translation_jelly',
    name: 'Golden Feast',
    category: 'Specials',
    icon: '🏆',
    emoji: '🏆',
    description: 'Grand royal banquet dish attracting global food connoisseurs.',
    baseCost: 1100,
    costMult: 1.65,
    baseProfit: 180,
    profitMult: 1.28,
    requiredLevel: 1,
    maxLevel: 26,
    requiredCardId: 'global_license',
    requiredCardLevel: 3,
  },
  {
    id: 'anti_fraud_shield',
    name: 'Michelin Star',
    category: 'Specials',
    icon: '⭐',
    emoji: '⭐',
    description: 'Prestigious culinary award doubling franchise valuation.',
    baseCost: 3200,
    costMult: 1.7,
    baseProfit: 500,
    profitMult: 1.3,
    requiredLevel: 2,
    maxLevel: 24,
    requiredCardId: 'translation_jelly',
    requiredCardLevel: 4,
  },
  {
    id: 'dictator_switch',
    name: 'Secret Sauce',
    category: 'Specials',
    icon: '🥫',
    emoji: '🥫',
    description: 'Proprietary gourmet glaze outperforming all competing diners.',
    baseCost: 7200,
    costMult: 1.76,
    baseProfit: 1150,
    profitMult: 1.33,
    requiredLevel: 3,
    maxLevel: 20,
    requiredCardId: 'translation_jelly',
    requiredCardLevel: 7,
  },
  {
    id: 'invisibility_cape',
    name: 'Trophy Dish',
    category: 'Specials',
    icon: '🥇',
    emoji: '🥇',
    description: 'World Championship winning plating with unmatched rewards.',
    baseCost: 4500,
    costMult: 1.72,
    baseProfit: 720,
    profitMult: 1.31,
    requiredLevel: 2,
    maxLevel: 22,
    requiredCardId: 'translation_jelly',
    requiredCardLevel: 5,
  },
  {
    id: 'vc_fund',
    name: 'Mega Buffet',
    category: 'Specials',
    icon: '🍱',
    emoji: '🍱',
    description: 'Infinite 100-dish buffet serving hundreds of hungry guests.',
    baseCost: 9800,
    costMult: 1.78,
    baseProfit: 1600,
    profitMult: 1.34,
    requiredLevel: 3,
    maxLevel: 18,
    requiredCardId: 'translation_jelly',
    requiredCardLevel: 9,
  },
  {
    id: 'dimension_trash',
    name: 'Royal Palace',
    category: 'Specials',
    icon: '🏰',
    emoji: '🏰',
    description: 'Opulent dining palace hosting world dignitaries and VIPs.',
    baseCost: 12500,
    costMult: 1.8,
    baseProfit: 2000,
    profitMult: 1.35,
    requiredLevel: 3,
    maxLevel: 16,
    requiredCardId: 'global_license',
    requiredCardLevel: 6,
  },
  {
    id: 'tier1_exchange',
    name: 'Food Empire',
    category: 'Specials',
    icon: '🌐',
    emoji: '🌐',
    description: 'Worldwide multinational food empire generating boundless $SOLK wealth.',
    baseCost: 20000,
    costMult: 1.82,
    baseProfit: 3200,
    profitMult: 1.36,
    requiredLevel: 4,
    maxLevel: 12,
    requiredCardId: 'dimension_trash',
    requiredCardLevel: 5,
  },
];

export const MINING_CARDS_MAP: Record<string, MiningCardDef> = MINING_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {} as Record<string, MiningCardDef>);

/**
 * Calculates level-dependent cooldown duration in seconds after an upgrade.
 */
export function calculateCardCooldownSeconds(newLevel: number): number {
  if (newLevel <= 1) return 60; // 1 min (60s)
  if (newLevel === 2) return 180; // 3 min (180s)
  if (newLevel === 3) return 270; // 4.5 min (270s)
  if (newLevel === 4) return 720; // 12 min (720s)
  if (newLevel === 5) return 900; // 15 min (900s)
  if (newLevel === 6) return 1800; // 30 min (1800s)
  if (newLevel === 7) return 2250; // 37.5 min
  if (newLevel === 8) return 2700; // 45 min
  if (newLevel === 9) return 3150; // 52.5 min
  if (newLevel === 10) return 3600; // 60 min (1h)
  if (newLevel <= 15) return 3600 + (newLevel - 10) * 720; // Lv11-15: 1h to 2h
  if (newLevel <= 20) return 7200 + (newLevel - 15) * 4320; // Lv16-20: 2h to 8h max
  return 28800; // 8h max (28800s)
}

/**
 * Calculates full prerequisite chain up to root card.
 */
export function getCardPrerequisiteChain(
  cardId: string,
  cardsMap: Record<string, MiningCardDef> = MINING_CARDS_MAP
): Array<{ card: MiningCardDef; requiredLevel: number }> {
  const chain: Array<{ card: MiningCardDef; requiredLevel: number }> = [];
  let currentCard = cardsMap[cardId];
  const visited = new Set<string>();

  while (currentCard && currentCard.requiredCardId && !visited.has(currentCard.id)) {
    visited.add(currentCard.id);
    const parent = cardsMap[currentCard.requiredCardId];
    if (parent && currentCard.requiredCardLevel) {
      chain.unshift({ card: parent, requiredLevel: currentCard.requiredCardLevel });
      currentCard = parent;
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Automatically calculates multipliers, base hourly profit, and required character tier (1..10)
 * when the admin provides just Name, Icon, and Level 1 Base Cost.
 */
export function autoCalculateCardMetrics(raw: {
  id?: string;
  name: string;
  icon: string;
  baseCost: number;
  category?: 'Gadgets' | 'Friends' | 'Future Tech' | 'Specials';
  emoji?: string;
  description?: string;
  costMult?: number;
  baseProfit?: number;
  profitMult?: number;
  requiredLevel?: number;
  maxLevel?: number;
  requiredCardId?: string;
  requiredCardLevel?: number;
  active?: boolean;
}): MiningCardDef & { active?: boolean } {
  const baseCost = Math.max(10, Math.floor(Number(raw.baseCost || 100)));
  const category = raw.category || 'Gadgets';
  
  // 1. Auto-assign Cost Multiplier (Exponential Growth 1.60x - 1.78x)
  let costMult = raw.costMult;
  if (!costMult || costMult <= 1) {
    if (baseCost < 500) costMult = 1.60;
    else if (baseCost < 1500) costMult = 1.65;
    else if (baseCost < 4000) costMult = 1.70;
    else if (baseCost < 8000) costMult = 1.75;
    else costMult = 1.78;
  }

  // 2. Auto-calculate Level 1 Base Hourly Profit (~16.5% of baseCost)
  let baseProfit = raw.baseProfit;
  if (!baseProfit || baseProfit <= 0) {
    baseProfit = Math.max(5, Math.round(baseCost * 0.165));
  }

  // 3. Auto-assign Profit Multiplier (Compound Yield 1.25x - 1.34x)
  let profitMult = raw.profitMult;
  if (!profitMult || profitMult <= 1) {
    if (baseCost < 500) profitMult = 1.25;
    else if (baseCost < 1500) profitMult = 1.28;
    else if (baseCost < 4000) profitMult = 1.30;
    else if (baseCost < 8000) profitMult = 1.32;
    else profitMult = 1.34;
  }

  // 4. Auto-assign Required Character Tier (Level 1..10)
  let requiredLevel = raw.requiredLevel;
  if (!requiredLevel || requiredLevel < 1 || requiredLevel > 10) {
    if (baseCost < 1000) requiredLevel = 1;       // Food Noob
    else if (baseCost < 3000) requiredLevel = 2;  // Delivery Rider
    else if (baseCost < 6000) requiredLevel = 3;  // Senior Rider
    else if (baseCost < 10000) requiredLevel = 4; // Street Food Vendor
    else if (baseCost < 25000) requiredLevel = 5; // Cafe Owner
    else if (baseCost < 50000) requiredLevel = 6; // Restaurant Manager
    else if (baseCost < 100000) requiredLevel = 7;// Restaurant Director
    else if (baseCost < 250000) requiredLevel = 8;// Food Tycoon
    else if (baseCost < 500000) requiredLevel = 9;// Food Mogul
    else requiredLevel = 10;                      // Global Food CEO
  }

  // 5. Auto-assign Max Level Cap (Min 12 - Max 30)
  let maxLevel = raw.maxLevel;
  if (!maxLevel || maxLevel < 12 || maxLevel > 30) {
    if (baseCost < 500) maxLevel = 28;
    else if (baseCost < 2000) maxLevel = 24;
    else if (baseCost < 5000) maxLevel = 20;
    else if (baseCost < 10000) maxLevel = 16;
    else maxLevel = 12;
  }

  // 6. Category Default Emojis
  const categoryEmojis: Record<string, string> = {
    Gadgets: '🍔',
    Friends: '👨‍🍳',
    'Future Tech': '♨️',
    Specials: '👑',
  };

  const cleanId = (raw.id || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'card')
    .slice(0, 40);

  return {
    id: cleanId,
    name: raw.name.trim(),
    category,
    icon: raw.icon?.trim() || categoryEmojis[category] || '🍔',
    emoji: raw.emoji?.trim() || categoryEmojis[category] || '🍔',
    description: raw.description?.trim() || `Yasir Fest kitchen card with passive profit yield.`,
    baseCost,
    costMult: Number(costMult.toFixed(2)),
    baseProfit: Math.floor(baseProfit),
    profitMult: Number(profitMult.toFixed(2)),
    requiredLevel,
    maxLevel,
    requiredCardId: raw.requiredCardId,
    requiredCardLevel: raw.requiredCardLevel,
    active: raw.active !== false,
  };
}

export function calculateCardCost(card: MiningCardDef, currentLevel: number): number {
  if (currentLevel <= 0) return card.baseCost;
  return Math.floor(card.baseCost * Math.pow(card.costMult, currentLevel));
}

export function calculateCardProfitPerHour(card: MiningCardDef, level: number): number {
  if (level <= 0) return 0;
  return Math.floor(card.baseProfit * Math.pow(card.profitMult, level - 1));
}

export function calculateNextLevelProfitBoost(card: MiningCardDef, currentLevel: number): number {
  const currentProfit = calculateCardProfitPerHour(card, currentLevel);
  const nextProfit = calculateCardProfitPerHour(card, currentLevel + 1);
  return Math.max(1, nextProfit - currentProfit);
}

export function calculateTotalProfitPerHour(userCards: Record<string, number> = {}, cardsList?: MiningCardDef[]): number {
  const list = cardsList || MINING_CARDS;
  let total = 0;
  for (const card of list) {
    const level = Number(userCards[card.id] || 0);
    if (level > 0) {
      total += calculateCardProfitPerHour(card, level);
    }
  }
  return total;
}
