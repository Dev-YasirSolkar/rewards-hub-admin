import { adminDb } from '@/lib/firebase-admin';
import { MINING_CARDS, MiningCardDef, autoCalculateCardMetrics } from './mining-cards';

let dynamicCardsCache: { data: MiningCardDef[]; cachedAt: number } | null = null;
const CACHE_TTL_MS = 3 * 1000;

/**
 * Server-only function to fetch dynamic mining cards from Firestore.
 * Merges default static cards with custom / edited cards created by Admin in Firestore.
 */
export async function getDynamicMiningCards(): Promise<MiningCardDef[]> {
  const now = Date.now();
  if (dynamicCardsCache && now - dynamicCardsCache.cachedAt < CACHE_TTL_MS) {
    return dynamicCardsCache.data;
  }

  try {
    const [cardsSnapshot, settingsDoc] = await Promise.all([
      adminDb.collection('miningCards').get().catch(() => null),
      adminDb.collection('adminSettings').doc('mining').get().catch(() => null),
    ]);

    const cardsMap = new Map<string, MiningCardDef>();

    // 1. Load default static cards
    for (const def of MINING_CARDS) {
      cardsMap.set(def.id, { ...def });
    }

    // 2. Override from adminSettings if any
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

    // 3. Override / merge from miningCards collection
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

/**
 * Server-only helper to get dynamic cards as a Record<string, MiningCardDef>
 */
export async function getDynamicMiningCardsMap(): Promise<Record<string, MiningCardDef>> {
  const cards = await getDynamicMiningCards();
  return cards.reduce((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {} as Record<string, MiningCardDef>);
}
