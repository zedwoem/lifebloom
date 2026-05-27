import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RescueGroupsService } from '@/lib/services/rescueGroupsService';
import { PetAPIService } from '@/lib/services/petAPIService';
import { secureLogger } from '@/lib/utils/secureLogger';

const PetSearchSchema = z.object({
  type: z.enum(['dog', 'cat']).default('dog'),
  limit: z.coerce.number().min(1).max(50).default(10)
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedParams = PetSearchSchema.parse({
      type: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || undefined
    });

    const isDog = parsedParams.type === 'dog';
    const limit = parsedParams.limit;

    // Try fetching high-quality breed imagery from PetAPIService first
    let premiumBreeds = [];
    if (isDog) {
      premiumBreeds = await PetAPIService.getDogBreeds(limit);
    } else {
      premiumBreeds = await PetAPIService.getCatBreeds(limit);
    }

    // Map premium breeds to the expected response format
    let animals: any[] = premiumBreeds.map(b => ({
      id: b.id,
      url: b.image_url,
      breeds: [{
        name: b.name,
        breed_group: b.description,
        temperament: b.temperament
      }]
    }));

    // If premium APIs return nothing, fallback to RescueGroups API
    if (animals.length === 0) {
      animals = await RescueGroupsService.searchPets({
        animalType: parsedParams.type,
        limit: limit
      });
    }

    return NextResponse.json({ animals });
  } catch (error: any) {
    secureLogger.error("Pet search route error", error);
    return NextResponse.json({ error: "PET_SEARCH_FAILED", animals: [] }, { status: 400 });
  }
}
