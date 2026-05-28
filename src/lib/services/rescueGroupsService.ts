import { fetchWithTimeout } from '@/lib/utils/apiTimeout';
import { secureLogger } from '@/lib/utils/secureLogger';

export interface PetSearchRequest {
  animalType: string;
  limit: number;
  zipCode?: string;
  radius?: number; // defaults to 50 miles
}

export interface PetBreed {
  name: string;
  breed_group?: string;
  temperament?: string;
}

export interface PetSearchResult {
  id: string;
  name: string;
  url: string;
  breeds: PetBreed[];
  age?: string;
  size?: string;
  gender?: string;
  bio?: string;
  adoptionFee?: number;
  rescueOrg?: string;
}

export class RescueGroupsService {
  static async searchPets(request: PetSearchRequest): Promise<PetSearchResult[]> {
    const apiKey = process.env.RESCUE_GROUPS_API_KEY;
    if (!apiKey) {
      secureLogger.error("RESCUE_GROUPS_API_KEY is missing. Falling back to local data.");
      return this.getFallbackData(request.animalType);
    }

    try {
      const species = request.animalType === 'cat' ? 'cats' : 'dogs';
      const radius = request.radius || 50;
      
      // Building RescueGroups.org v5 location-aware search query
      let url = `https://api.rescuegroups.org/v5/public/animals/search/available/${species}?limit=${request.limit}`;
      
      if (request.zipCode) {
        url += `&location=${request.zipCode}&distance=${radius}`;
      }

      const options = {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/vnd.api+json'
        }
      };

      const response = await fetchWithTimeout<any>(url, options, 4000);
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any): PetSearchResult => {
          const attr = item.attributes || {};
          return {
            id: item.id || Math.random().toString(),
            name: attr.name || 'Lovely Companion',
            url: attr.pictureThumbnailUrl || attr.pictureUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
            breeds: [{
              name: attr.breedPrimary || 'Mixed Breed',
              breed_group: attr.breedGroup || 'Rescue',
              temperament: attr.descriptionText?.substring(0, 100) || 'Sweet natured, loving, and calm.'
            }],
            age: attr.ageGroup || 'Young',
            size: attr.sizeGroup || 'Medium',
            gender: attr.sex || 'Male',
            bio: attr.descriptionText || `Meet this lovely pet. A healthy animal looking for a safe harbor and stable home.`,
            adoptionFee: attr.adoptionFee || 150,
            rescueOrg: attr.orgName || 'Local Animal Shelter Network'
          };
        });
      }

      return this.getFallbackData(request.animalType);
    } catch (error: any) {
      secureLogger.error("RescueGroups API search failed", error);
      return this.getFallbackData(request.animalType);
    }
  }

  private static getFallbackData(species: string): PetSearchResult[] {
    return [
      { 
        id: 'fallback-rg-1', 
        name: species === 'cat' ? 'Luna' : 'Max',
        url: species === 'cat' 
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80', 
        breeds: [{ name: species === 'cat' ? 'Domestic Shorthair' : 'Labrador Mix', breed_group: 'Mixed', temperament: 'Friendly, Gentle, Loyal' }],
        age: 'Young',
        size: 'Medium',
        gender: 'Female',
        bio: 'A beautiful rescue companion with soft eyes and an extremely loyal disposition. Perfect for family settings.',
        adoptionFee: 120,
        rescueOrg: 'Safe Harbor Rescue Shelter Network'
      }
    ];
  }
}
