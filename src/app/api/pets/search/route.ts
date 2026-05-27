import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RescueGroupsService } from '@/lib/services/rescueGroupsService';
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

    // Isolated service layer call with strictly typed TS interfaces
    const animals = await RescueGroupsService.searchPets({
      animalType: parsedParams.type,
      limit: parsedParams.limit
    });

    return NextResponse.json({ animals });
  } catch (error: any) {
    secureLogger.error("Pet search route error", error);
    // Prevent sensitive backend trace leakage
    return NextResponse.json({ error: "PET_SEARCH_FAILED", animals: [] }, { status: 400 });
  }
}
