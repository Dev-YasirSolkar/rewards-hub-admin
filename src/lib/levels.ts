export interface LevelConfig {
  level: number;
  name: string;
  avatar: string;
  image: string;
  tagline: string;
  color: string;
  bgGradient: string;
  border: string;
  requiredPoints: number;
  maxEnergy: number;
  perks: string;
  description: string;
}

export const LEVEL_DETAILS: LevelConfig[] = [
  {
    level: 1,
    name: 'Food Noob',
    avatar: '🥄',
    image: '/images/characters/level1.png',
    tagline: 'Beginner',
    color: '#94A3B8',
    bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(148, 163, 184, 0.4)',
    requiredPoints: 0,
    maxEnergy: 1000,
    perks: '+3 Fest Coins/tap • 1,000 Energy Tank • 3 Free Turbos/day',
    description: 'Welcome to Yasir Fest! Starting fresh in the food industry as an eager beginner.',
  },
  {
    level: 2,
    name: 'Delivery Rider',
    avatar: '🛵',
    image: '/images/characters/level2.png',
    tagline: 'Food Delivery Worker',
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(245, 158, 11, 0.4)',
    requiredPoints: 5_000,
    maxEnergy: 1500,
    perks: '1,500 Max Energy • Multitap Lv.2 • Fast Delivery Bonus',
    description: 'Hitting the streets as an energetic food delivery worker delivering hot meals.',
  },
  {
    level: 3,
    name: 'Senior Rider',
    avatar: '⚡',
    image: '/images/characters/level3.png',
    tagline: 'Experienced Delivery Professional',
    color: '#EAB308',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(234, 179, 8, 0.4)',
    requiredPoints: 25_000,
    maxEnergy: 2000,
    perks: '2,000 Max Energy • Multitap Lv.3 • Top Route Speed',
    description: 'Master of city shortcuts, managing delivery fleets with high professionalism.',
  },
  {
    level: 4,
    name: 'Street Food Vendor',
    avatar: '🍢',
    image: '/images/characters/level4.png',
    tagline: 'Small Food Business',
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(16, 185, 129, 0.4)',
    requiredPoints: 100_000,
    maxEnergy: 2500,
    perks: '2,500 Max Energy • Multitap Lv.4-5 • Artisan Stall Boost',
    description: 'Operating your own small food business stall with delicious signature street recipes.',
  },
  {
    level: 5,
    name: 'Cafe Owner',
    avatar: '☕',
    image: '/images/characters/level5.png',
    tagline: 'Independent Business Owner',
    color: '#06B6D4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(6, 182, 212, 0.4)',
    requiredPoints: 1_000_000,
    maxEnergy: 3000,
    perks: '3,000 Max Energy • Multitap Lv.6 • 1M Club Perks',
    description: 'Proud independent business owner running a thriving, trendy urban cafe.',
  },
  {
    level: 6,
    name: 'Restaurant Manager',
    avatar: '📋',
    image: '/images/characters/level6.png',
    tagline: 'Restaurant Operations',
    color: '#3B82F6',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(59, 130, 246, 0.55)',
    requiredPoints: 2_000_000,
    maxEnergy: 4000,
    perks: '4,000 Max Energy • Multitap Lv.7-8 • Operations Royalty',
    description: 'Overseeing full-scale restaurant operations, staff management, and gourmet dining.',
  },
  {
    level: 7,
    name: 'Restaurant Director',
    avatar: '👔',
    image: '/images/characters/level7.png',
    tagline: 'Business Leadership',
    color: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(139, 92, 246, 0.55)',
    requiredPoints: 5_000_000,
    maxEnergy: 5000,
    perks: '5,000 Max Energy • Multitap Lv.9-10 • Executive Growth',
    description: 'Executive business leader strategizing multi-location restaurant expansion.',
  },
  {
    level: 8,
    name: 'Food Tycoon',
    avatar: '🏨',
    image: '/images/characters/level8.png',
    tagline: 'Restaurant Chain Owner',
    color: '#EC4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(236, 72, 153, 0.55)',
    requiredPoints: 10_000_000,
    maxEnergy: 6000,
    perks: '6,000 Max Energy • Multitap Lv.11-12 • Chain Franchise Perks',
    description: 'Dominating the dining landscape as a prominent national restaurant chain owner.',
  },
  {
    level: 9,
    name: 'Food Mogul',
    avatar: '🌟',
    image: '/images/characters/level9.png',
    tagline: 'Billionaire Entrepreneur',
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(239, 68, 68, 0.55)',
    requiredPoints: 50_000_000,
    maxEnergy: 7500,
    perks: '7,500 Max Energy • Multitap Lv.13-14 • Global Portfolio Boost',
    description: 'Billionaire food entrepreneur with an expansive international culinary empire.',
  },
  {
    level: 10,
    name: 'Global Food CEO',
    avatar: '👑',
    image: '/images/characters/level10.png',
    tagline: 'Ultimate Business Leader',
    color: '#FBBF24',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(15, 23, 42, 0.95) 100%)',
    border: 'rgba(251, 191, 36, 0.7)',
    requiredPoints: 100_000_000,
    maxEnergy: 10000,
    perks: '10,000 Max Energy • Multitap Lv.15 (Max) • Supreme $FEAST Airdrop Priority',
    description: 'The ultimate business leader commanding the worldwide Yasir Fest food empire!',
  },
];

export function resolveLevelFromPoints(points: number, storedLevel = 1): LevelConfig {
  let earnedLevel = 1;
  const p = Math.max(0, Number(points) || 0);

  if (p >= 100_000_000) earnedLevel = 10;
  else if (p >= 50_000_000) earnedLevel = 9;
  else if (p >= 10_000_000) earnedLevel = 8;
  else if (p >= 5_000_000) earnedLevel = 7;
  else if (p >= 2_000_000) earnedLevel = 6;
  else if (p >= 1_000_000) earnedLevel = 5;
  else if (p >= 100_000) earnedLevel = 4;
  else if (p >= 25_000) earnedLevel = 3;
  else if (p >= 5_000) earnedLevel = 2;
  else earnedLevel = 1;

  const finalLevel = Math.min(10, Math.max(earnedLevel, Number(storedLevel || 1)));
  return LEVEL_DETAILS.find((l) => l.level === finalLevel) || LEVEL_DETAILS[0];
}
