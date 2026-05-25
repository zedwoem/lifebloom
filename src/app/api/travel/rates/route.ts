import { NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/utils/apiTimeout';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin') || 'NYC';
  const destination = searchParams.get('destination') || 'LON';

  try {
    // Amadeus Self-Service API Mock
    const amadeusUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&adults=1`;
    
    // Travelpayouts Mock URL
    // const tpUrl = `https://api.travelpayouts.com/v1/prices/cheap?origin=${origin}&destination=${destination}`;

    const fallbackData = {
      rates: [
        { airline: 'Amadeus Mock Air', price: 450, accessible: true },
        { airline: 'Travelpayouts Fallback', price: 380, accessible: false }
      ]
    };

    const options = {
      headers: {
        'Authorization': `Bearer ${process.env.AMADEUS_MOCK_TOKEN || 'mock-token'}`
      }
    };

    // Strict 4s timeout
    const data = await fetchWithTimeout<any>(amadeusUrl, options, 4000, fallbackData);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
