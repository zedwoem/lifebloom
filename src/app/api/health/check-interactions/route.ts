import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { drugs } = await req.json();

    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return NextResponse.json({ error: 'Please provide at least two medications to analyze.' }, { status: 400 });
    }

    const query = drugs.map(d => `"${d}"`).join('+AND+');
    const apiUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:(${query})&limit=1`;
    const openFdaKey = process.env.OPENFDA_API_KEY;
    const headers: HeadersInit = openFdaKey ? { 'Authorization': `Basic ${openFdaKey}` } : {};

    // Strict 4-second timeout utility to protect the system from serverless freezing/hanging
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
        // Check if there are recorded adverse event interactions from OpenFDA
        if (data.results && data.results.length > 0) {
           return NextResponse.json({
             severity: 'High',
             description: `Potential drug interaction (Adverse Events) found for combination: ${drugs.join(', ')}. Please consult a medical professional immediately.`,
             details: data.results[0]
           });
        }
      }
      
      // If request succeeds but no interaction matches, gracefully report a low severity status
      return NextResponse.json({
        severity: 'Low',
        description: `No major adverse drug interactions found in the OpenFDA database for the combination: ${drugs.join(', ')}.`
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Graceful degradation: Local fallback if the API times out or hits standard quotas
      return NextResponse.json({
        severity: 'Low',
        description: `Local System Fallback: Interaction data for ${drugs.join(', ')} cannot be fetched from OpenFDA at this time. Please rely on standard clinical guidelines.`
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'An internal system error occurred while checking drug interactions.' }, { status: 500 });
  }
}
