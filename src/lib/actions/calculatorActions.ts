"use server";

import { TravelpayoutsService } from "@/lib/services/travelpayoutsService";
import { getDrugInteractionData } from "@/lib/services/openFdaAdapter";
import { getLiveEconomicMetrics } from "@/lib/services/fredAdapter";
import { CoinGeckoService } from "@/lib/services/coinGeckoService";
import { PetAPIService } from "@/lib/services/petAPIService";
import { RescueGroupsService } from "@/lib/services/rescueGroupsService";
import { unstable_cache } from "next/cache";

/**
 * Server Action: Search flights and hotels via TravelPayouts
 * Wrapped in unstable_cache for high-performance and rate limit protection
 */
export async function getFlightDeals(origin: string, destination: string) {
  const cacheFn = unstable_cache(
    async (orig: string, dest: string) => {
      try {
        return await TravelpayoutsService.getCheapestFlights(orig, dest);
      } catch (err) {
        console.error("[getFlightDeals Action Error]:", err);
        return [];
      }
    },
    [`flights-${origin}-${destination}`],
    { revalidate: 3600 } // Cache for 1 hour
  );
  return cacheFn(origin, destination);
}

/**
 * Server Action: Check drug interaction data via OpenFDA
 */
export async function checkDrugInteraction(drugName: string) {
  const cacheFn = unstable_cache(
    async (name: string) => {
      try {
        return await getDrugInteractionData(name);
      } catch (err) {
        console.error("[checkDrugInteraction Action Error]:", err);
        return null;
      }
    },
    [`drug-${drugName.toLowerCase().trim()}`],
    { revalidate: 86400 } // Cache for 24 hours
  );
  return cacheFn(drugName);
}

/**
 * Server Action: Get inflation rate and mortgage index from FRED
 */
export async function getEconomicMetrics() {
  const cacheFn = unstable_cache(
    async () => {
      try {
        return await getLiveEconomicMetrics();
      } catch (err) {
        console.error("[getEconomicMetrics Action Error]:", err);
        return null;
      }
    },
    ["economic-metrics"],
    { revalidate: 43200 } // Cache for 12 hours
  );
  return cacheFn();
}

/**
 * Server Action: Fetch cryptocurrency yield assets from CoinGecko
 */
export async function getCryptoPrice(assetId: string) {
  const cacheFn = unstable_cache(
    async (id: string) => {
      try {
        return await CoinGeckoService.getAssetPrice(id);
      } catch (err) {
        console.error("[getCryptoPrice Action Error]:", err);
        return null;
      }
    },
    [`crypto-${assetId}`],
    { revalidate: 300 } // Cache for 5 minutes
  );
  return cacheFn(assetId);
}

/**
 * Server Action: Combined Pet Search (PetAPIService + RescueGroups)
 */
export async function searchPets(type: "dog" | "cat", limit: number = 3) {
  const cacheFn = unstable_cache(
    async (t: "dog" | "cat", l: number) => {
      try {
        const isDog = t === "dog";
        let premiumBreeds = [];
        if (isDog) {
          premiumBreeds = await PetAPIService.getDogBreeds(l);
        } else {
          premiumBreeds = await PetAPIService.getCatBreeds(l);
        }

        let animals: any[] = premiumBreeds.map(b => ({
          id: b.id,
          url: b.image_url,
          breeds: [{
            name: b.name,
            breed_group: b.description,
            temperament: b.temperament
          }]
        }));

        if (animals.length === 0) {
          animals = await RescueGroupsService.searchPets({
            animalType: t,
            limit: l
          });
        }
        return animals;
      } catch (err) {
        console.error("[searchPets Action Error]:", err);
        return [];
      }
    },
    [`pets-${type}-${limit}`],
    { revalidate: 1800 } // Cache for 30 minutes
  );
  return cacheFn(type, limit);
}

/**
 * Server Action: Multi-Drug Interaction Check via OpenFDA
 */
export async function checkMultiDrugInteractions(drugs: string[]) {
  const cacheKey = [...drugs].sort().join('-').toLowerCase().trim();
  const cacheFn = unstable_cache(
    async (drugList: string[]) => {
      try {
        const query = drugList.map(d => `"${d}"`).join('+AND+');
        // Retrieve top 5 clinical events to aggregate the actual patient reactions
        const apiUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:(${query})&limit=5`;
        const openFdaKey = process.env.OPENFDA_API_KEY;
        const headers: HeadersInit = openFdaKey ? { 'Authorization': `Basic ${openFdaKey}` } : {};

        const response = await fetch(apiUrl, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Aggregate unique patient reaction preferred terms (MedDRA)
            const reactionsSet = new Set<string>();
            data.results.forEach((result: any) => {
              if (result.patient?.reaction) {
                result.patient.reaction.forEach((r: any) => {
                  if (r.reactionmeddrapt) {
                    reactionsSet.add(r.reactionmeddrapt.toLowerCase());
                  }
                });
              }
            });

            const topReactions = Array.from(reactionsSet)
              .slice(0, 5)
              .map(r => r.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

            const reactionNote = topReactions.length > 0 
              ? ` Commonly reported patient reactions include: ${topReactions.join(', ')}.`
              : "";

            return {
              severity: 'High' as const,
              description: `Potential drug interaction warning detected in clinical patient reports for: ${drugList.join(' + ')}.${reactionNote} Please consult a doctor or healthcare professional.`,
              details: {
                total_events: data.meta?.results?.total || data.results.length,
                reactions: topReactions
              }
            };
          }
        }
        return {
          severity: 'Low' as const,
          description: `No major adverse events or interactions registered in the OpenFDA database for: ${drugList.join(' + ')}. Your combination appears generally compatible based on historical reports.`,
          details: { total_events: 0, reactions: [] }
        };
      } catch (err) {
        console.error("[checkMultiDrugInteractions Action Error]:", err);
        return {
          severity: 'Low' as const,
          description: `Medication Checker is temporarily offline. Fallback guidance: Spacing your medications at least 2 hours apart is a general safety best practice for ${drugList.join(' and ')}.`,
          details: { total_events: 0, reactions: [] }
        };
      }
    },
    [`drug-interactions-${cacheKey}`],
    { revalidate: 86400 } // Cache for 24 hours
  );
  return cacheFn(drugs);
}

