import { openFdaBreaker, fetchWithTimeout } from "@/lib/utils/apiTimeout";

export interface DrugInteraction {
  brandName: string;
  genericName: string;
  purpose: string;
  warnings: string[];
  adverseReactions: string;
  dosageAndAdministration: string;
  EEATLegibleWarning: string; // Stripped jargon, large-font Plain English
}

// Simple but comprehensive medical jargon translator
export function translateMedicalJargon(text: string): string {
  if (!text) return "";

  const jargonMap: Record<string, string> = {
    "anaphylaxis": "severe, life-threatening allergic reaction (anaphylaxis)",
    "dyspnea": "shortness of breath",
    "myocardial infarction": "heart attack",
    "urticaria": "severe hives and itchy skin rash",
    "hepatic impairment": "serious liver damage",
    "renal impairment": "kidney failure or damage",
    "somnolence": "extreme sleepiness or drowsiness",
    "xerostomia": "severe dry mouth",
    "pruritus": "intense skin itching",
    "alopecia": "hair loss",
    "dyspepsia": "acid indigestion or upset stomach",
    "emesis": "vomiting",
    "nausea": "feeling sick to your stomach",
    "cephalalgia": "headache",
    "arrhythmia": "irregular heartbeat",
    "hypertension": "high blood pressure",
    "hypotension": "dangerously low blood pressure"
  };

  let translated = text;
  Object.entries(jargonMap).forEach(([jargon, plainText]) => {
    const regex = new RegExp(`\\b${jargon}\\b`, "gi");
    translated = translated.replace(regex, plainText);
  });

  return translated;
}

const FALLBACK_DRUG_DATA: Record<string, DrugInteraction> = {
  aspirin: {
    brandName: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    purpose: "Pain reliever and fever reducer",
    warnings: [
      "Keep out of reach of children.",
      "Reye's syndrome: Children and teenagers who have or are recovering from chicken pox or flu-like symptoms should not use this product."
    ],
    adverseReactions: "Upset stomach, mild heartburn, nausea, and vomiting.",
    dosageAndAdministration: "Take 1 to 2 tablets every 4 hours with a full glass of water, not exceeding 12 tablets in 24 hours.",
    EEATLegibleWarning: "Warning: Children and teenagers recovering from chicken pox or flu-like symptoms should NOT take this medicine because of the risk of Reye's Syndrome, a rare but life-threatening brain and liver condition."
  },
  acetaminophen: {
    brandName: "Tylenol",
    genericName: "Acetaminophen",
    purpose: "Pain reliever and fever reducer",
    warnings: [
      "Liver warning: This product contains acetaminophen. Severe liver damage may occur if you take more than 4,000 mg in 24 hours."
    ],
    adverseReactions: "Skin redness, hives, or breathing difficulties (extremely rare).",
    dosageAndAdministration: "Take 1 to 2 gelcaps every 6 hours while symptoms last. Do not exceed 6 gelcaps in 24 hours.",
    EEATLegibleWarning: "Warning: Taking more than the maximum daily dose (4,000 milligrams) can cause severe, permanent liver damage. Do NOT combine with other medicines containing Acetaminophen."
  }
};

/**
 * Ingests drug specifications and label warnings from OpenFDA API,
 * translates clinical medical jargon, and yields highly-legible instructions.
 */
export async function getDrugInteractionData(drugName: string): Promise<DrugInteraction> {
  const query = drugName.toLowerCase().trim();
  const fallback = FALLBACK_DRUG_DATA[query] || {
    brandName: drugName,
    genericName: "Unknown",
    purpose: "General Medication",
    warnings: ["Consult your clinical provider before use."],
    adverseReactions: "Information unavailable.",
    dosageAndAdministration: "Use strictly as directed by your physician.",
    EEATLegibleWarning: "Please consult a certified medical practitioner before taking this medication."
  };

  const fetchFdaData = async (): Promise<DrugInteraction> => {
    // OpenFDA API public endpoint (with rate limit limits)
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=1`;
    
    const data = await fetchWithTimeout<any>(url, { method: "GET" }, 4000);
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`No drug records found for "${drugName}" on OpenFDA.`);
    }

    const result = data.results[0];
    const brandName = result.openfda?.brand_name?.[0] || drugName;
    const genericName = result.openfda?.generic_name?.[0] || "Unknown";
    const purpose = result.purpose?.[0] || "General treatment";
    const warnings = result.warnings || ["Consult a doctor before use."];
    const adverseReactions = result.adverse_reactions?.[0] || "No recorded adverse reactions.";
    const dosageAndAdministration = result.dosage_and_administration?.[0] || "Use strictly as directed.";

    // Refine clinical texts with Atkinson Hyperlegible jargon remover
    const parsedWarnings = warnings.map((w: string) => translateMedicalJargon(w));
    const EEATLegibleWarning = translateMedicalJargon(
      result.warnings?.[0] || result.warnings_and_cautions?.[0] || "Use with absolute caution."
    );

    return {
      brandName,
      genericName,
      purpose,
      warnings: parsedWarnings,
      adverseReactions: translateMedicalJargon(adverseReactions),
      dosageAndAdministration: translateMedicalJargon(dosageAndAdministration),
      EEATLegibleWarning
    };
  };

  // Wrapped in stateful circuit-breaker to guarantee zero page-load blocks
  return openFdaBreaker.execute(fetchFdaData, fallback);
}
