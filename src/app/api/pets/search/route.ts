import { NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/utils/apiTimeout';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const animalType = searchParams.get('type') || 'dog'; // 'dog' or 'cat'
  const limit = searchParams.get('limit') || '10';

  try {
    let apiUrl = '';
    let apiKey = '';

    if (animalType === 'cat') {
      apiUrl = `https://api.thecatapi.com/v1/images/search?limit=${limit}&has_breeds=1`;
      apiKey = process.env.THECATAPI_KEY || '';
    } else {
      apiUrl = `https://api.thedogapi.com/v1/images/search?limit=${limit}&has_breeds=1`;
      apiKey = process.env.THEDOGAPI_KEY || '';
    }
    
    const fallbackData = [
      { id: 'fb1', url: '', breeds: [{ name: 'Local Fallback Dog', breed_group: 'Mixed', temperament: 'Friendly' }] }
    ];

    const options = {
      headers: {
        'x-api-key': apiKey
      }
    };

    const data = await fetchWithTimeout<any>(apiUrl, options, 4000, fallbackData);

    return NextResponse.json({ animals: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
