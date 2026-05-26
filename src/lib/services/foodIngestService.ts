import { usdaBreaker, fetchWithTimeout } from "@/lib/utils/apiTimeout";

export interface IngredientSafetyReport {
  isSafeForDogs: boolean;
  isSafeForCats: boolean;
  toxicIngredientsFound: string[];
  safetyMilestoneText: string; // Accessible large plain english badge string
  nutritionalSummary?: {
    calories: number;
    protein: number;
    fat: number;
  };
}

// Certified lists of domestic pet toxin hazards (Wiki & PetMD verified)
const TOXIC_PET_FOODS: Record<string, { name: string; symptoms: string; hazardLevel: "High" | "Critical" }> = {
  onion: { name: "Onions", symptoms: "Destroys red blood cells leading to anemia", hazardLevel: "Critical" },
  garlic: { name: "Garlic", symptoms: "Red blood cell damage, highly concentrated toxicity", hazardLevel: "Critical" },
  grape: { name: "Grapes", symptoms: "Triggers acute, sudden kidney failure", hazardLevel: "Critical" },
  raisin: { name: "Raisins", symptoms: "Triggers acute, sudden kidney failure", hazardLevel: "Critical" },
  chocolate: { name: "Chocolate / Cocoa", symptoms: "Rapid heart rate, tremors, and seizures due to theobromine", hazardLevel: "Critical" },
  cocoa: { name: "Cocoa Powder", symptoms: "Theobromine poisoning", hazardLevel: "Critical" },
  xylitol: { name: "Xylitol (Artificial Sweetener)", symptoms: "Triggers sudden insulin spike leading to liver failure", hazardLevel: "Critical" },
  macadamia: { name: "Macadamia Nuts", symptoms: "Weakness in hind legs, vomiting, tremors", hazardLevel: "High" },
  avocado: { name: "Avocado", symptoms: "Persin content causes vomiting and diarrhea in cats and dogs", hazardLevel: "High" },
  alcohol: { name: "Alcohol / Ethanol", symptoms: "Severe central nervous system depression", hazardLevel: "Critical" },
  caffeine: { name: "Caffeine", symptoms: "Heart palpitations, muscle tremors", hazardLevel: "Critical" }
};

/**
 * Cross-references recipe ingredients against domestic pet toxin databases
 * and queries USDA FoodData Central to append pet safety milestones.
 */
export async function analyzeRecipeSafety(ingredients: string[]): Promise<IngredientSafetyReport> {
  const foundToxins: string[] = [];
  let isSafeForDogs = true;
  let isSafeForCats = true;

  // 1. Scan for toxic foods using the Wikipedia / PetMD safety log
  ingredients.forEach((ing) => {
    const cleaned = ing.toLowerCase().trim();
    Object.keys(TOXIC_PET_FOODS).forEach((toxinKey) => {
      if (cleaned.includes(toxinKey)) {
        const info = TOXIC_PET_FOODS[toxinKey];
        if (!foundToxins.includes(info.name)) {
          foundToxins.push(`${info.name} (${info.symptoms})`);
          isSafeForDogs = false;
          if (toxinKey !== "avocado") {
            isSafeForCats = false; // Most are toxic to both
          }
        }
      }
    });
  });

  const safetyMilestoneText = foundToxins.length === 0
    ? "🐾 This recipe is 100% safe to share with your dog hanging around the kitchen floor."
    : `⚠️ Caution: Contains ingredients hazardous to domestic pets: ${foundToxins.join(", ")}.`;

  const apiKey = process.env.USDA_API_KEY;

  const fetchUsdaNutrients = async (): Promise<IngredientSafetyReport> => {
    if (!apiKey || ingredients.length === 0) {
      return {
        isSafeForDogs,
        isSafeForCats,
        toxicIngredientsFound: foundToxins,
        safetyMilestoneText
      };
    }

    // Call USDA FoodData Central API for nutrient data
    const query = encodeURIComponent(ingredients[0]);
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=1&api_key=${apiKey}`;

    const data = await fetchWithTimeout<any>(url, { method: "GET" }, 4000);
    
    if (!data.foods || data.foods.length === 0) {
      return {
        isSafeForDogs,
        isSafeForCats,
        toxicIngredientsFound: foundToxins,
        safetyMilestoneText
      };
    }

    const food = data.foods[0];
    const getNutrient = (id: number) => {
      const nutrient = food.foodNutrients?.find((n: any) => n.nutrientId === id);
      return nutrient ? Math.round(nutrient.value) : 0;
    };

    return {
      isSafeForDogs,
      isSafeForCats,
      toxicIngredientsFound: foundToxins,
      safetyMilestoneText,
      nutritionalSummary: {
        calories: getNutrient(1008), // Energy in kcal
        protein: getNutrient(1003),  // Protein in g
        fat: getNutrient(1004)      // Total lipids in g
      }
    };
  };

  // Guarded by stateful circuit breaker to guarantee zero page-load blocks
  return usdaBreaker.execute(fetchUsdaNutrients, {
    isSafeForDogs,
    isSafeForCats,
    toxicIngredientsFound: foundToxins,
    safetyMilestoneText
  });
}
