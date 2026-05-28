import { RescueGroupsService, PetSearchResult } from './rescueGroupsService';
import { PetAPIService } from './petAPIService';
import { secureLogger } from '@/lib/utils/secureLogger';

export interface PetMatchQuery {
  species: 'dog' | 'cat';
  space: 'small' | 'large';
  time: 'low' | 'medium' | 'high';
  hasKids: boolean;
  hasPets: boolean;
  energy: 'low' | 'medium' | 'high';
  zipCode?: string;
  radius?: number; // In miles
}

export interface EnhancedPet {
  id: string;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  age: string; // 'Puppy' | 'Young' | 'Adult' | 'Senior'
  size: 'Small' | 'Medium' | 'Large';
  gender: 'Male' | 'Female';
  photos: string[];
  bio: string;
  compatibilityScore: number;
  adoptionFee: number;
  tags: string[];
  goodWithKids: boolean;
  goodWithCats: boolean;
  goodWithApartments: boolean;
  rescueOrg: string;
  contactUrl: string;
}

// In-Memory cache to respect API rates and Vercel edge/serverless execution parameters (5-10 minute caching)
const PETS_CACHE: Record<string, { timestamp: number; data: EnhancedPet[] }> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class PetService {
  /**
   * Main multi-tiered orchestrator query
   */
  static async searchAndMatch(query: PetMatchQuery): Promise<EnhancedPet[]> {
    const cacheKey = `${query.species}_${query.space}_${query.time}_${query.hasKids}_${query.hasPets}_${query.energy}_${query.zipCode || 'nationwide'}`;
    
    // Check local TTL cache
    if (PETS_CACHE[cacheKey] && (Date.now() - PETS_CACHE[cacheKey].timestamp < CACHE_TTL_MS)) {
      return PETS_CACHE[cacheKey].data;
    }

    let results: EnhancedPet[] = [];

    // TIER 1: RescueGroups.org API v5
    try {
      const radius = query.radius || 50;
      const apiResults = await RescueGroupsService.searchPets({
        animalType: query.species,
        limit: 16
      });

      if (apiResults && apiResults.length > 0 && !apiResults[0].id.includes('fallback')) {
        results = apiResults.map(p => this.mapToEnhancedPet(p, query));
      }
    } catch (err) {
      secureLogger.error("Tier 1 Pet Search (RescueGroups) failed", err);
    }

    // TIER 2: TheDogAPI / TheCatAPI
    if (results.length === 0) {
      try {
        let breeds = [];
        if (query.species === 'dog') {
          breeds = await PetAPIService.getDogBreeds(12);
        } else {
          breeds = await PetAPIService.getCatBreeds(12);
        }

        if (breeds && breeds.length > 0) {
          results = breeds.map((b, idx) => ({
            id: `breed-${b.id}-${idx}`,
            name: b.name,
            type: query.species,
            breed: b.name,
            age: idx % 3 === 0 ? 'Puppy' : idx % 2 === 0 ? 'Young' : 'Adult',
            size: b.description.toLowerCase().includes('small') ? 'Small' : b.description.toLowerCase().includes('large') ? 'Large' : 'Medium',
            gender: idx % 2 === 0 ? 'Female' : 'Male',
            photos: [b.image_url],
            bio: `${b.name} are known to be ${b.temperament.toLowerCase()}. Ideal for companion seekers.`,
            compatibilityScore: this.calculateScore(b, query),
            adoptionFee: 150,
            tags: b.temperament.split(', ').slice(0, 3),
            goodWithKids: query.hasKids,
            goodWithCats: !query.hasPets,
            goodWithApartments: query.space === 'small',
            rescueOrg: 'LifeBloom Curation Partner',
            contactUrl: '/support'
          }));
        }
      } catch (err) {
        secureLogger.error("Tier 2 Pet Search (Breed APIs) failed", err);
      }
    }

    // TIER 3: Local High-Fidelity Fallback
    if (results.length === 0) {
      results = this.getStaticFallbackPets(query);
    }

    // Sort by Compatibility Score descending
    results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Cache the result
    PETS_CACHE[cacheKey] = {
      timestamp: Date.now(),
      data: results
    };

    return results;
  }

  private static mapToEnhancedPet(raw: PetSearchResult, query: PetMatchQuery): EnhancedPet {
    const breedName = raw.breeds?.[0]?.name || 'Mixed Breed';
    const temp = raw.breeds?.[0]?.temperament || 'Friendly, Active, Alert';
    
    // Heuristic compatibility matching based on attributes
    let score = 75;
    if (query.space === 'small' && raw.breeds?.[0]?.breed_group?.toLowerCase().includes('toy')) score += 15;
    if (query.time === 'low' && temp.toLowerCase().includes('lazy')) score += 15;
    if (query.energy === 'high' && temp.toLowerCase().includes('energetic')) score += 15;
    
    score = Math.min(Math.max(score, 60), 98); // Bound score realistically

    return {
      id: raw.id,
      name: raw.name || breedName.split(' ')[0],
      type: query.species,
      breed: breedName,
      age: raw.age || 'Young',
      size: (raw.size === 'Small' || raw.size === 'Large' ? raw.size : 'Medium') as 'Small' | 'Medium' | 'Large',
      gender: (raw.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
      photos: [raw.url],
      bio: raw.bio || `Meet ${raw.name || 'this cute pet'}! A beautiful ${breedName} searching for their permanent cozy home. Extremely ${temp.toLowerCase()}.`,
      compatibilityScore: score,
      adoptionFee: raw.adoptionFee || 120,
      tags: temp.split(', ').slice(0, 3),
      goodWithKids: query.hasKids,
      goodWithCats: query.hasPets,
      goodWithApartments: query.space === 'small',
      rescueOrg: raw.rescueOrg || 'Kindness Animal Rescue Network',
      contactUrl: '/support'
    };
  }

  private static calculateScore(breed: any, query: PetMatchQuery): number {
    let score = 80;
    const temp = breed.temperament?.toLowerCase() || '';
    if (query.energy === 'low' && (temp.includes('calm') || temp.includes('gentle') || temp.includes('docile'))) score += 12;
    if (query.energy === 'high' && (temp.includes('active') || temp.includes('energetic') || temp.includes('playful'))) score += 12;
    if (query.space === 'small' && (temp.includes('quiet') || breed.description?.toLowerCase().includes('small'))) score += 8;
    return Math.min(Math.max(score, 65), 99);
  }

  private static getStaticFallbackPets(query: PetMatchQuery): EnhancedPet[] {
    const list: EnhancedPet[] = [
      {
        id: 'static-1',
        name: 'Buddy',
        type: 'dog',
        breed: 'Golden Retriever Mix',
        age: 'Young',
        size: 'Large',
        gender: 'Male',
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80'],
        bio: 'Buddy is a happy-go-lucky companion who loves water, fetch, and cozy evening cuddles. He is incredibly patient and excellent with children.',
        compatibilityScore: query.species === 'dog' ? 95 : 65,
        adoptionFee: 150,
        tags: ['Playful', 'Patient', 'Loving'],
        goodWithKids: true,
        goodWithCats: true,
        goodWithApartments: false,
        rescueOrg: 'Safe Harbor Rescue Shelter',
        contactUrl: '/support'
      },
      {
        id: 'static-2',
        name: 'Mochi',
        type: 'dog',
        breed: 'French Bulldog',
        age: 'Adult',
        size: 'Small',
        gender: 'Female',
        photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'],
        bio: 'Mochi is a professional couch potato. She loves short walks around the block, eating carrots, and snoring gently next to your desk.',
        compatibilityScore: query.species === 'dog' && query.space === 'small' ? 98 : 70,
        adoptionFee: 200,
        tags: ['Quiet', 'Friendly', 'Calm'],
        goodWithKids: true,
        goodWithCats: true,
        goodWithApartments: true,
        rescueOrg: 'Cozy Paws Shelter Network',
        contactUrl: '/support'
      },
      {
        id: 'static-3',
        name: 'Cleo',
        type: 'cat',
        breed: 'Ragdoll Mix',
        age: 'Adult',
        size: 'Medium',
        gender: 'Female',
        photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80'],
        bio: 'Cleo is a soft, fluffy princess who will follow you from room to room. She has beautiful blue eyes and loves chasing feather wands.',
        compatibilityScore: query.species === 'cat' ? 96 : 60,
        adoptionFee: 100,
        tags: ['Affectionate', 'Gentle', 'Fluffy'],
        goodWithKids: true,
        goodWithCats: true,
        goodWithApartments: true,
        rescueOrg: 'Happy Felines League',
        contactUrl: '/support'
      }
    ];

    return list.filter(p => p.type === query.species);
  }
}
