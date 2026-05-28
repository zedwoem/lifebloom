import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PetService } from '@/lib/services/petService';
import { secureLogger } from '@/lib/utils/secureLogger';
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash";

// Strict validation schema for companion matching parameters
const PetSearchQuerySchema = z.object({
  species: z.enum(['dog', 'cat']).default('dog'),
  space: z.enum(['small', 'large']).default('large'),
  time: z.enum(['low', 'medium', 'high']).default('medium'),
  hasKids: z.preprocess(val => val === 'true' || val === '1', z.boolean()).default(false),
  hasPets: z.preprocess(val => val === 'true' || val === '1', z.boolean()).default(false),
  energy: z.enum(['low', 'medium', 'high']).default('medium'),
  zipCode: z.string().nullable().transform(val => val || undefined),
  radius: z.coerce.number().min(5).max(200).default(50)
});

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // DDoS protection / Rate Limiting: 45 queries per minute per IP for animal assets
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(45, "1 m"),
    });
    
    const { success } = await ratelimit.limit(`ratelimit_pet_search_${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const parsedParams = PetSearchQuerySchema.parse({
      species: searchParams.get('species') || undefined,
      space: searchParams.get('space') || undefined,
      time: searchParams.get('time') || undefined,
      hasKids: searchParams.get('hasKids') || undefined,
      hasPets: searchParams.get('hasPets') || undefined,
      energy: searchParams.get('energy') || undefined,
      zipCode: searchParams.get('zipCode'),
      radius: searchParams.get('radius') || undefined
    });

    // Call dynamic tiered service
    const matches = await PetService.searchAndMatch({
      species: parsedParams.species,
      space: parsedParams.space,
      time: parsedParams.time,
      hasKids: parsedParams.hasKids,
      hasPets: parsedParams.hasPets,
      energy: parsedParams.energy,
      zipCode: parsedParams.zipCode,
      radius: parsedParams.radius
    });

    // Return the matches wrapped under animals node (complying with front-end expectations)
    return NextResponse.json({ animals: matches });
  } catch (error: any) {
    secureLogger.error("Pet search endpoint failed", error);
    return NextResponse.json({ error: "PET_SEARCH_FAILED", animals: [] }, { status: 400 });
  }
}
