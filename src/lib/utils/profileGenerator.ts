import crypto from "crypto";

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  entityType: 'individual' | 'organization' | 'brand' | 'institution';
  hIndex?: number;
  citationCount?: number;
  avatarUrl?: string;
  verified: boolean;
}

const EXPERT_NAMES = [
  "Dr. Sarah Chen, MD",
  "Dr. Marcus Rossi, PhD",
  "Dr. Emily Thorne, MPH",
  "Prof. Alistair Vance",
  "Dr. Mei Ling, Gerontologist"
];

const EXPERT_TITLES = [
  "Senior Medical Reviewer",
  "Chief Financial Analyst",
  "Geriatric Care Specialist",
  "Veterinary Medicine Lead",
  "Accessibility Consultant"
];

const ORG_NAMES = [
  "Global Care Institute",
  "Senior Living Alliance",
  "Pinnacle Financial Advisory",
  "Paws & Whiskers Foundation",
  "Inclusive Mobility Group"
];

// Simple deterministic integer from string hash
function stringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function generateProfile(seed: string, forceOrg: boolean = false): ExpertProfile {
  const hashVal = stringToInt(seed);
  
  if (forceOrg) {
    const orgName = ORG_NAMES[hashVal % ORG_NAMES.length];
    return {
      id: `partner-${hashVal}`,
      name: orgName,
      title: "Supported by Partner Institution",
      entityType: "institution",
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=0D8ABC&color=fff&rounded=true`
    };
  }

  const name = EXPERT_NAMES[hashVal % EXPERT_NAMES.length];
  const title = EXPERT_TITLES[hashVal % EXPERT_TITLES.length];
  const hIndex = 12 + (hashVal % 30);
  const citationCount = 1500 + (hashVal % 8000);

  return {
    id: `expert-${hashVal}`,
    name,
    title,
    entityType: "individual",
    hIndex,
    citationCount,
    verified: true,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff&rounded=true`
  };
}

/**
 * Reconstructs an expert or partner profile directly from its clean URL ID.
 */
export function getProfileFromId(id: string): ExpertProfile | null {
  if (id.startsWith('partner-')) {
    const hashVal = parseInt(id.replace('partner-', ''), 10);
    if (isNaN(hashVal)) return null;
    const orgName = ORG_NAMES[hashVal % ORG_NAMES.length];
    return {
      id,
      name: orgName,
      title: "Supported by Partner Institution",
      entityType: "institution",
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=0D8ABC&color=fff&rounded=true`
    };
  } else if (id.startsWith('expert-')) {
    const hashVal = parseInt(id.replace('expert-', ''), 10);
    if (isNaN(hashVal)) return null;
    const name = EXPERT_NAMES[hashVal % EXPERT_NAMES.length];
    const title = EXPERT_TITLES[hashVal % EXPERT_TITLES.length];
    const hIndex = 12 + (hashVal % 30);
    const citationCount = 1500 + (hashVal % 8000);
    return {
      id,
      name,
      title,
      entityType: "individual",
      hIndex,
      citationCount,
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff&rounded=true`
    };
  }
  return null;
}

