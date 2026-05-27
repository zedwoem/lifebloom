import { NextResponse } from 'next/server';
import { TravelpayoutsService } from '@/lib/services/travelpayoutsService';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'CGK';
    const destination = searchParams.get('destination') || 'DPS';
    const departDate = searchParams.get('depart_date') || undefined;
    const returnDate = searchParams.get('return_date') || undefined;

    // Fetch flight deals from the backend service using our database cache and Aviasales v3 API
    const rates = await TravelpayoutsService.getCheapestFlights(
      origin,
      destination,
      departDate,
      returnDate
    );

    return NextResponse.json({ rates });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'An internal error occurred in the travel rates metasearch router.' },
      { status: 500 }
    );
  }
}
