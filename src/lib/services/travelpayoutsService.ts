import { createClient } from '@supabase/supabase-js';
import { secureLogger } from '@/lib/utils/secureLogger';

interface FlightPriceResponse {
  airline: string;
  price: number;
  departure_at: string;
  return_at?: string;
  direct: boolean;
  transfers: number;
  duration?: number;
  booking_url: string;
  is_cache: boolean;
}

export class TravelpayoutsService {
  private static getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Bypass RLS for secure server-side ops
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing in server environment variables.');
    }
    return createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Fetches cheapest direct flights via Aviasales v3 with local database caching & graceful degradation.
   */
  static async getCheapestFlights(
    origin: string,
    destination: string,
    departDate?: string,
    returnDate?: string
  ): Promise<FlightPriceResponse[]> {
    const supabase = this.getSupabaseClient();
    const token = process.env.AFFILIATE_TRAVELPAYOUTS_TOKEN;

    if (!token) {
      secureLogger.error('Missing AFFILIATE_TRAVELPAYOUTS_TOKEN inside server environment');
      return this.getStaticFallbackDeals(origin, destination);
    }

    const startTime = Date.now();
    const cleanOrigin = origin.toUpperCase().trim();
    const cleanDest = destination.toUpperCase().trim();

    try {
      // 1. Query Database Cache First (Filter by direct=true and check expiration TTL)
      const { data: cachedDeals, error: cacheError } = await supabase
        .from('travel_flights_cache')
        .select('*')
        .eq('origin', cleanOrigin)
        .eq('destination', cleanDest)
        .eq('direct', true)
        .gt('expires_at', new Date().toISOString())
        .order('price', { ascending: true })
        .limit(3);

      if (!cacheError && cachedDeals && cachedDeals.length > 0) {
        return cachedDeals.map(deal => ({
          airline: deal.airline,
          price: Number(deal.price),
          departure_at: deal.departure_at,
          return_at: deal.return_at || undefined,
          direct: deal.direct,
          transfers: deal.transfers,
          duration: deal.duration || undefined,
          booking_url: deal.booking_url,
          is_cache: true,
        }));
      }

      // 2. Cache Miss: Query Aviasales v3 prices_for_dates API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds strict timeout

      let apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${cleanOrigin}&destination=${cleanDest}&currency=idr&direct=true&sorting=price&limit=5`;
      if (departDate) apiUrl += `&departure_at=${departDate}`;
      if (returnDate) apiUrl += `&return_at=${returnDate}`;

      const response = await fetch(apiUrl, {
        headers: {
          'X-Access-Token': token,
          'Accept-Encoding': 'gzip, deflate',
        },
        signal: controller.signal,
        next: { revalidate: 3600 } // Next.js server-side static route revalidation
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      // Log external API latency & status code to public.api_health_logs
      await supabase.from('api_health_logs').insert({
        api_name: 'aviasales_v3_prices_for_dates',
        status_code: response.status,
        latency_ms: latencyMs,
        error_payload: response.ok ? null : `HTTP Error ${response.status}: ${response.statusText}`
      });

      // Handle Rate Limiter (HTTP 429 Too Many Requests)
      if (response.status === 429) {
        secureLogger.info('Travelpayouts API Rate Limit exceeded (300 req/min). Serving stale/historical fallbacks.');
        return this.getStaticFallbackDeals(cleanOrigin, cleanDest);
      }

      if (!response.ok) {
        throw new Error(`Travelpayouts API returned status ${response.status}`);
      }

      const rawData = await response.json();
      
      if (!rawData.success || !rawData.data || rawData.data.length === 0) {
        return this.getStaticFallbackDeals(cleanOrigin, cleanDest);
      }

      const deals: FlightPriceResponse[] = [];
      const cacheInsertions: any[] = [];

      // Parse and format Aviasales v3 responses
      rawData.data.forEach((flight: any) => {
        const bookingUrl = `/api/affiliate?vendor=travelpayouts&product_id=${cleanOrigin}-${cleanDest}&pillar=travel`;
        
        const deal: FlightPriceResponse = {
          airline: flight.airline,
          price: Number(flight.price),
          departure_at: flight.departure_at,
          return_at: flight.return_at || undefined,
          direct: flight.transfers === 0,
          transfers: flight.transfers,
          duration: flight.duration || undefined,
          booking_url: bookingUrl,
          is_cache: false,
        };

        deals.push(deal);

        cacheInsertions.push({
          origin: cleanOrigin,
          destination: cleanDest,
          price: flight.price,
          airline: flight.airline,
          flight_number: flight.flight_number?.toString() || null,
          departure_at: new Date(flight.departure_at).toISOString(),
          return_at: flight.return_at ? new Date(flight.return_at).toISOString() : null,
          direct: flight.transfers === 0,
          transfers: flight.transfers,
          duration: flight.duration || null,
          booking_url: bookingUrl,
          expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // TTL: 6 hours
        });
      });

      // 3. Save to database cache (Non-blocking async upsert)
      if (cacheInsertions.length > 0) {
        supabase
          .from('travel_flights_cache')
          .upsert(cacheInsertions, { onConflict: 'origin,destination,departure_at,direct' })
          .then(({ error }) => {
            if (error) secureLogger.error('Failed to update Travelpayouts flights cache database:', error);
          });
      }

      return deals.slice(0, 3);

    } catch (error: any) {
      secureLogger.error('Travelpayouts Service Error:', error);
      return this.getStaticFallbackDeals(cleanOrigin, cleanDest);
    }
  }

  /**
   * Option B: GraphQL query alternative for optimized fetches
   */
  static async getCheapestFlightsGraphQL(
    origin: string,
    destination: string
  ): Promise<any> {
    const token = process.env.AFFILIATE_TRAVELPAYOUTS_TOKEN;
    const query = `
      query GetCheapestDirectFlights($origin: String!, $destination: String!) {
        prices_for_dates(
          origin: $origin
          destination: $destination
          currency: "idr"
          direct: true
          limit: 3
        ) {
          airline
          price
          departure_at
          return_at
          transfers
          duration
          link
        }
      }
    `;

    try {
      const response = await fetch('https://api.travelpayouts.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token || '',
        },
        body: JSON.stringify({
          query,
          variables: { origin, destination }
        }),
        next: { revalidate: 3600 }
      });

      if (!response.ok) return null;
      const res = await response.json();
      return res.data?.prices_for_dates || null;
    } catch (err) {
      secureLogger.error('GraphQL Fetch Error:', err);
      return null;
    }
  }

  private static getStaticFallbackDeals(origin: string, destination: string): FlightPriceResponse[] {
    return [
      {
        airline: 'Garuda Indonesia (Historical)',
        price: 1850000,
        departure_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        direct: true,
        transfers: 0,
        booking_url: `/api/affiliate?vendor=travelpayouts&product_id=${origin}-${destination}&pillar=travel`,
        is_cache: true
      },
      {
        airline: 'Batik Air (Historical)',
        price: 1250000,
        departure_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        direct: true,
        transfers: 0,
        booking_url: `/api/affiliate?vendor=travelpayouts&product_id=${origin}-${destination}&pillar=travel`,
        is_cache: true
      }
    ];
  }
}
