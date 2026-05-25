export const PILLARS = {
  HOME: { id: 'home', label: 'Home & Safety', slug: 'home-living' },
  MONEY: { id: 'money', label: 'Money & Retirement', slug: 'money-future' },
  PET: { id: 'pet', label: 'Pet Companions', slug: 'pet-family' },
  SENIOR: { id: 'senior', label: 'Senior Wellness', slug: 'senior' },
  TRAVEL: { id: 'travel', label: 'Accessible Travel', slug: 'travel' }
} as const;

export type PillarId = keyof typeof PILLARS;
