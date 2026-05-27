import { fetchWithTimeout } from '@/lib/utils/apiTimeout';
import { secureLogger } from '@/lib/utils/secureLogger';

export interface PetSearchRequest {
  animalType: string;
  limit: number;
}

export interface PetBreed {
  name: string;
  breed_group?: string;
  temperament?: string;
}

export interface PetSearchResult {
  id: string;
  url: string;
  breeds: PetBreed[];
}

export class RescueGroupsService {
  static async searchPets(request: PetSearchRequest): Promise<PetSearchResult[]> {
    const apiKey = process.env.RESCUE_GROUPS_API_KEY;
    if (!apiKey) {
      secureLogger.error("RESCUE_GROUPS_API_KEY is missing. Falling back to local data.");
      return this.getFallbackData();
    }

    try {
      // Map 'cat'/'dog' to RescueGroups strict species names
      const species = request.animalType === 'cat' ? 'cats' : 'dogs';
      
      const url = `https://api.rescuegroups.org/v5/public/animals/search/available/${species}?limit=${request.limit}`;
      const options = {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/vnd.api+json'
        }
      };

      // 4-second timeout to ensure robust UX
      const response = await fetchWithTimeout<any>(url, options, 4000);
      
      // Strict mapping from RescueGroups JSON:API format to our PetMatchmaker component data contract
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any): PetSearchResult => ({
          id: item.id || Math.random().toString(),
          url: item.attributes?.pictureThumbnailUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
          breeds: [{
            name: item.attributes?.breedPrimary || 'Unknown Rescue Breed',
            breed_group: 'Rescue',
            temperament: item.attributes?.descriptionText?.substring(0, 50) || 'Friendly and loving'
          }]
        }));
      }

      return this.getFallbackData();
    } catch (error: any) {
      secureLogger.error("RescueGroups API search failed", error);
      return this.getFallbackData();
    }
  }

  private static getFallbackData(): PetSearchResult[] {
    return [
      { 
        id: 'fallback-1', 
        url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80', 
        breeds: [{ name: 'Rescue Partner Dog', breed_group: 'Mixed', temperament: 'Friendly' }] 
      }
    ];
  }
}
