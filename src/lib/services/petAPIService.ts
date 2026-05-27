import { fetchWithTimeout } from '@/lib/utils/apiTimeout';
import { secureLogger } from '@/lib/utils/secureLogger';

export interface PetApiResult {
  id: string;
  name: string;
  image_url: string;
  description: string;
  temperament: string;
}

export class PetAPIService {
  private static dogApiKey = process.env.THEDOGAPI_KEY || "";
  private static catApiKey = process.env.THECATAPI_KEY || "";

  static async getDogBreeds(limit: number = 3): Promise<PetApiResult[]> {
    if (!this.dogApiKey) {
      secureLogger.error("THEDOGAPI_KEY missing");
      return [];
    }

    try {
      const url = `https://api.thedogapi.com/v1/breeds?limit=${limit}`;
      const response = await fetchWithTimeout<any>(url, {
        headers: {
          'x-api-key': this.dogApiKey
        }
      }, 5000);

      if (Array.isArray(response)) {
        return response.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          image_url: item.image?.url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80",
          description: item.breed_group || "Companion Dog",
          temperament: item.temperament || "Friendly and energetic"
        }));
      }
      return [];
    } catch (error) {
      secureLogger.error("TheDogAPI fetch failed", error);
      return [];
    }
  }

  static async getCatBreeds(limit: number = 3): Promise<PetApiResult[]> {
    if (!this.catApiKey) {
      secureLogger.error("THECATAPI_KEY missing");
      return [];
    }

    try {
      const url = `https://api.thecatapi.com/v1/breeds?limit=${limit}`;
      const response = await fetchWithTimeout<any>(url, {
        headers: {
          'x-api-key': this.catApiKey
        }
      }, 5000);

      if (Array.isArray(response)) {
        return response.map((item) => ({
          id: item.id,
          name: item.name,
          image_url: item.image?.url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
          description: item.description || "Companion Cat",
          temperament: item.temperament || "Affectionate and intelligent"
        }));
      }
      return [];
    } catch (error) {
      secureLogger.error("TheCatAPI fetch failed", error);
      return [];
    }
  }
}
