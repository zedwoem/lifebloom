import { NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/utils/apiTimeout';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location') || '10001';

  try {
    const apiUrl = `https://api.petfinder.com/v2/animals?location=${location}&status=adoptable`;
    
    // Fallback static JSON for strict timeout
    const fallbackData = {
      animals: [
        { id: 1, name: 'Local Fallback Dog', type: 'Dog', breeds: { primary: 'Mixed' } },
        { id: 2, name: 'Local Fallback Cat', type: 'Cat', breeds: { primary: 'Domestic Shorthair' } }
      ]
    };

    const options = {
      headers: {
        'Authorization': `Bearer ${process.env.PETFINDER_MOCK_TOKEN || 'mock-token'}`
      }
    };

    const data = await fetchWithTimeout<any>(apiUrl, options, 4000, fallbackData);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
