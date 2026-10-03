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
  requiredLevel: number;
}

export const MINING_CARDS: MiningCardDef[] = [
  // ── 1. 22ND CENTURY GADGETS ────────────────────────────────────────────────
  {
    id: 'fan_token',
    name: 'Take-Copter (Bamboo Copter)',
    category: 'Gadgets',
    icon: '/icons/take_copter.png',
    emoji: '🚁',
    description: 'Fly over obstacles and passively collect DoraPoints from the sky.',
    baseCost: 150,
    costMult: 1.6,
    baseProfit: 25,
    profitMult: 1.25,
    requiredLevel: 1,
  },
  {
    id: 'staking_pool',
    name: 'Dokodemo Door (Anywhere Door)',
    category: 'Gadgets',
    icon: '/icons/anywhere_door.png',
    emoji: '🚪',
    description: 'Instant dimensional portal to fast-yield 22nd century Dora nodes.',
    baseCost: 400,
    costMult: 1.65,
    baseProfit: 65,
    profitMult: 1.28,
    requiredLevel: 1,
  },
  {
    id: 'dex_listing',
    name: 'Time Machine Coordinates',
    category: 'Gadgets',
    icon: '/icons/time_machine.png',
    emoji: '⏳',
    description: 'Travel through time streams to harvest future mining rewards.',
    baseCost: 1200,
    costMult: 1.7,
    baseProfit: 200,
    profitMult: 1.3,
    requiredLevel: 2,
  },
  {
    id: 'margin_trading',
    name: 'Pass Loop Dimensional Ring',
    category: 'Gadgets',
    icon: '/icons/pass_loop.png',
    emoji: '⭕',
    description: 'Pass through any obstacle to extract deep 22nd century liquidity.',
    baseCost: 3500,
    costMult: 1.75,
    baseProfit: 550,
    profitMult: 1.32,
    requiredLevel: 3,
  },
  {
    id: 'dress_up_camera',
    name: 'Dress-Up Camera',
    category: 'Gadgets',
    icon: '/icons/dressup_camera.png',
    emoji: '📷',
    description: 'Equip futuristic miner suits to increase mining productivity.',
    baseCost: 6500,
    costMult: 1.78,
    baseProfit: 1050,
    profitMult: 1.33,
    requiredLevel: 4,
  },

  // ── 2. DORA SQUAD & FRIENDS ────────────────────────────────────────────────
  {
    id: 'telegram_channel',
    name: 'Nobita Homework AI Assistant',
    category: 'Friends',
    icon: '/icons/nobita_study.png',
    emoji: '👓',
    description: 'Automated study AI converting study hours into passive Dora income.',
    baseCost: 200,
    costMult: 1.6,
    baseProfit: 35,
    profitMult: 1.25,
    requiredLevel: 1,
  },
  {
    id: 'influencer_collab',
    name: 'Shizuka Melody Lab',
    category: 'Friends',
    icon: '/icons/shizuka_melody.png',
    emoji: '🌸',
    description: 'Soothing violin harmonic frequencies boosting ecosystem cheer.',
    baseCost: 600,
    costMult: 1.65,
    baseProfit: 100,
    profitMult: 1.28,
    requiredLevel: 1,
  },
  {
    id: 'meme_campaign',
    name: 'Suneo Luxury Tech Garage',
    category: 'Friends',
    icon: '/icons/suneo_tech.png',
    emoji: '🏎️',
    description: 'High-end custom RC tech and exotic gadgets boosting squad clout.',
    baseCost: 1800,
    costMult: 1.7,
    baseProfit: 280,
    profitMult: 1.3,
    requiredLevel: 2,
  },
  {
    id: 'podcast',
    name: 'Gian Power Concert Stage',
    category: 'Friends',
    icon: '/icons/gian_concert.png',
    emoji: '🎤',
    description: 'Earth-shattering vocal power supercharging block confirmation speed.',
    baseCost: 4500,
    costMult: 1.75,
    baseProfit: 700,
    profitMult: 1.32,
    requiredLevel: 3,
  },
  {
    id: 'dorami_unit',
    name: 'Dorami Smart Support Unit',
    category: 'Friends',
    icon: '/icons/dorami_unit.png',
    emoji: '🎀',
    description: 'Dorami high-efficiency advice stabilizing continuous reward yield.',
    baseCost: 8500,
    costMult: 1.78,
    baseProfit: 1350,
    profitMult: 1.34,
    requiredLevel: 4,
  },

  // ── 3. FUTURE TECH & 22ND CENTURY LAB ──────────────────────────────────────
  {
    id: 'cloud_nodes',
    name: 'Big Light & Small Light Nodes',
    category: 'Future Tech',
    icon: '/icons/big_light.png',
    emoji: '🔦',
    description: 'Scale up reward volume while shrinking battery consumption.',
    baseCost: 250,
    costMult: 1.6,
    baseProfit: 45,
    profitMult: 1.25,
    requiredLevel: 1,
  },
  {
    id: 'ai_bot',
    name: 'Air Cannon Shockwave Reactor',
    category: 'Future Tech',
    icon: '/icons/air_cannon.png',
    emoji: '💨',
    description: 'High-pressure kinetic bursts shattering difficult mining blocks.',
    baseCost: 800,
    costMult: 1.65,
    baseProfit: 140,
    profitMult: 1.28,
    requiredLevel: 1,
  },
  {
    id: 'security_audit',
    name: 'Gulliver Tunnel Micro-Core',
    category: 'Future Tech',
    icon: '/icons/gulliver_tunnel.png',
    emoji: '🚇',
    description: 'Miniaturize data packets for zero-resistance atomic transmissions.',
    baseCost: 2200,
    costMult: 1.7,
    baseProfit: 350,
    profitMult: 1.3,
    requiredLevel: 2,
  },
  {
    id: 'ton_bridge',
    name: 'Robotic Cat Automated Factory',
    category: 'Future Tech',
    icon: '/icons/robotic_cat.png',
    emoji: '🤖',
    description: '22nd Century autonomous factory building helper droids 24/7.',
    baseCost: 6000,
    costMult: 1.75,
    baseProfit: 950,
    profitMult: 1.32,
    requiredLevel: 3,
  },

  // ── 4. SECRET SPECIAL GADGETS ──────────────────────────────────────────────
  {
    id: 'anti_fraud_shield',
    name: 'What-If Phone Booth (Moshimo Box)',
    category: 'Specials',
    icon: '/icons/moshimo_box.png',
    emoji: '☎️',
    description: 'Manifest an alternate reality where your hourly profits multiply.',
    baseCost: 300,
    costMult: 1.6,
    baseProfit: 50,
    profitMult: 1.25,
    requiredLevel: 1,
  },
  {
    id: 'global_license',
    name: 'Memory Bread Knowledge Vault',
    category: 'Specials',
    icon: '/icons/memory_bread.png',
    emoji: '🍞',
    description: 'Absorb high-yield mining mastery instantly with zero learning curve.',
    baseCost: 1000,
    costMult: 1.65,
    baseProfit: 170,
    profitMult: 1.28,
    requiredLevel: 2,
  },
  {
    id: 'vc_fund',
    name: 'Time Cloth Chrono Restorer',
    category: 'Specials',
    icon: '/icons/time_cloth.png',
    emoji: '🧣',
    description: 'Reverse hardware aging and restore max peak output performance.',
    baseCost: 3000,
    costMult: 1.7,
    baseProfit: 480,
    profitMult: 1.3,
    requiredLevel: 3,
  },
  {
    id: 'tier1_exchange',
    name: '4D Pocket Ultimate Dimensional Vault',
    category: 'Specials',
    icon: '/icons/4d_pocket.png',
    emoji: '🔔',
    description: 'Doraemon legendary 4D pocket granting infinite earning potential.',
    baseCost: 10000,
    costMult: 1.8,
    baseProfit: 1600,
    profitMult: 1.35,
    requiredLevel: 4,
  },
];

export const MINING_CARDS_MAP: Record<string, MiningCardDef> = MINING_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {} as Record<string, MiningCardDef>);

/**
 * Automatically calculates multipliers, base hourly profit, and required character tier
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

  // 4. Auto-assign Required Character Tier (Level 1..7)
  let requiredLevel = raw.requiredLevel;
  if (!requiredLevel || requiredLevel < 1 || requiredLevel > 7) {
    if (baseCost < 1000) requiredLevel = 1;      // Doracake
    else if (baseCost < 3000) requiredLevel = 2; // Nobita
    else if (baseCost < 6000) requiredLevel = 3; // Shizuka
    else if (baseCost < 10000) requiredLevel = 4;// Suneo
    else if (baseCost < 25000) requiredLevel = 5;// Gian
    else if (baseCost < 50000) requiredLevel = 6;// Dorami
    else requiredLevel = 7;                      // Doraemon
  }

  // 5. Category Default Emojis
  const categoryEmojis: Record<string, string> = {
    Gadgets: '🚁',
    Friends: '👥',
    'Future Tech': '⚡',
    Specials: '🌟',
  };

  const cleanId = (raw.id || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'card')
    .slice(0, 40);

  return {
    id: cleanId,
    name: raw.name.trim(),
    category,
    icon: raw.icon?.trim() || '/icons/take_copter.png',
    emoji: raw.emoji?.trim() || categoryEmojis[category] || '🧪',
    description: raw.description?.trim() || `22nd Century Doraemon secret gadget with passive profit yield.`,
    baseCost,
    costMult: Number(costMult.toFixed(2)),
    baseProfit: Math.floor(baseProfit),
    profitMult: Number(profitMult.toFixed(2)),
    requiredLevel,
    active: raw.active !== false,
  };
}

let dynamicCardsCache: { data: MiningCardDef[]; cachedAt: number } | null = null;
const CACHE_TTL_MS = 3 * 1000;

export async function getDynamicMiningCards(): Promise<MiningCardDef[]> {
  const now = Date.now();
  if (dynamicCardsCache && now - dynamicCardsCache.cachedAt < CACHE_TTL_MS) {
    return dynamicCardsCache.data;
  }

  try {
    const { adminDb } = await import('@/lib/firebase-admin');

    const [cardsSnapshot, settingsDoc] = await Promise.all([
      adminDb.collection('miningCards').get().catch(() => null),
      adminDb.collection('adminSettings').doc('mining').get().catch(() => null),
    ]);

    const cardsMap = new Map<string, MiningCardDef>();

    for (const def of MINING_CARDS) {
      cardsMap.set(def.id, { ...def });
    }

    if (settingsDoc && settingsDoc.exists) {
      const sData = settingsDoc.data();
      if (sData?.cards && typeof sData.cards === 'object') {
        const customList = Array.isArray(sData.cards) ? sData.cards : Object.values(sData.cards);
        for (const raw of customList) {
          if (raw && raw.name) {
            const calculated = autoCalculateCardMetrics(raw);
            if (raw.active !== false) {
              cardsMap.set(calculated.id, calculated);
            } else {
              cardsMap.delete(calculated.id);
            }
          }
        }
      }
    }

    if (cardsSnapshot && !cardsSnapshot.empty) {
      for (const doc of cardsSnapshot.docs) {
        const raw = doc.data();
        if (raw && (raw.name || raw.title)) {
          const calculated = autoCalculateCardMetrics({
            id: doc.id,
            name: raw.name || raw.title,
            icon: raw.icon || raw.image || '/icons/take_copter.png',
            baseCost: Number(raw.baseCost || raw.cost || raw.price || 100),
            category: raw.category,
            emoji: raw.emoji,
            description: raw.description,
            costMult: raw.costMult,
            baseProfit: raw.baseProfit,
            profitMult: raw.profitMult,
            requiredLevel: raw.requiredLevel || raw.userLevel,
            active: raw.active !== false && raw.status !== 'inactive',
          });

          if (raw.active !== false && raw.status !== 'inactive') {
            cardsMap.set(calculated.id, calculated);
          } else {
            cardsMap.delete(calculated.id);
          }
        }
      }
    }

    const mergedList = Array.from(cardsMap.values());
    dynamicCardsCache = { data: mergedList, cachedAt: now };
    return mergedList;
  } catch (err) {
    console.warn('Failed to load dynamic cards, falling back to default:', err);
    return MINING_CARDS;
  }
}

export async function getDynamicMiningCardsMap(): Promise<Record<string, MiningCardDef>> {
  const cards = await getDynamicMiningCards();
  return cards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {} as Record<string, MiningCardDef>);
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
