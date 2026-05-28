'use server';

import { ContextualMatcherService, ScoredProduct } from '@/lib/services/contextualMatcherService';

export async function fetchRecommendations(
  pillar: string, 
  calculatorSlug: string, 
  calculatorOutput: any, 
  limit: number = 1
): Promise<ScoredProduct[]> {
  try {
    return await ContextualMatcherService.getRecommendations({
      pillar,
      calculatorSlug,
      calculatorOutput,
      limit
    });
  } catch (error) {
    console.error("[CME Action Error]", error);
    return [];
  }
}
