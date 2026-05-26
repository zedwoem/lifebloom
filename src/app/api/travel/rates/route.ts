import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin') || 'NYC';
  const destination = searchParams.get('destination') || 'LON';

  try {
    const amadeusUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&adults=1`;
    const amadeusToken = process.env.AMADEUS_MOCK_TOKEN || ''; 

    // Utilitas timeout ketat 4 detik untuk memastikan API luar tidak memblokir render UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Degradasi anggun: Fallback memuat tautan yang dienkapsulasi pada edge proxy affiliate-url-rewrite
    // untuk menghindari pemblokiran pelacak skrip ekstensi peramban.
    const fallbackData = {
      rates: [
        { 
          airline: 'SkyTeam Alliance (Fallback)', 
          price: 450, 
          accessible: true,
          bookingUrl: `/api/affiliate?vendor=amadeus&product_id=${origin}-${destination}` 
        },
        { 
          airline: 'Oneworld (Fallback)', 
          price: 380, 
          accessible: false,
          bookingUrl: `/api/affiliate?vendor=travelpayouts&product_id=${origin}-${destination}` 
        }
      ]
    };

    try {
      const response = await fetch(amadeusUrl, {
        headers: { 'Authorization': `Bearer ${amadeusToken}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          const rates = data.data.slice(0, 3).map((flight: any) => ({
            airline: flight.validatingAirlineDictionaries?.[flight.validatingAirlineCodes[0]] || flight.validatingAirlineCodes[0],
            price: parseFloat(flight.price.total),
            accessible: true,
            bookingUrl: `/api/affiliate?vendor=amadeus&product_id=${flight.id}`
          }));
          return NextResponse.json({ rates });
        }
      }
      return NextResponse.json(fallbackData);

    } catch (err) {
      clearTimeout(timeoutId);
      // Tangani galat secara halus kembali ke data lokal yang ter-enkapsulasi
      return NextResponse.json(fallbackData);
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan internal pada layanan Travel.' }, { status: 500 });
  }
}
