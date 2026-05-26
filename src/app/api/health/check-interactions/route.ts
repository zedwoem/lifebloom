import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { drugs } = await req.json();

    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return NextResponse.json({ error: 'Sediakan setidaknya dua jenis obat untuk dianalisis.' }, { status: 400 });
    }

    const query = drugs.map(d => `"${d}"`).join('+AND+');
    const apiUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:(${query})&limit=1`;
    const openFdaKey = process.env.OPENFDA_API_KEY;
    const headers: HeadersInit = openFdaKey ? { 'Authorization': `Basic ${openFdaKey}` } : {};

    // Utilitas timeout ketat 4 detik untuk melindungi sistem dari pembekuan (app crash)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(apiUrl, {
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Cek apakah ada interaksi tercatat dari OpenFDA
        if (data.results && data.results.length > 0) {
           return NextResponse.json({
             severity: 'High',
             description: `Ditemukan potensi interaksi obat (Adverse Events) untuk kombinasi: ${drugs.join(', ')}. Konsultasikan dengan tenaga medis segera.`,
             details: data.results[0]
           });
        }
      }
      
      // Jika request berhasil tapi tidak ada hasil, fallback ke status rendah secara halus
      return NextResponse.json({
        severity: 'Low',
        description: `Tidak ditemukan riwayat interaksi mayor pada database OpenFDA untuk kombinasi: ${drugs.join(', ')}.`
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Graceful degradation: Fallback lokal jika API time out atau limit quota
      return NextResponse.json({
        severity: 'Low',
        description: `Fallback Sistem Lokal: Data interaksi untuk ${drugs.join(', ')} saat ini tidak dapat ditarik dari OpenFDA. Silakan gunakan panduan medis standar.`
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem internal saat memproses interaksi.' }, { status: 500 });
  }
}
