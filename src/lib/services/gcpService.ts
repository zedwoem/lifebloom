import { google } from "googleapis";

// Properly parse the double-stringified JSON payload injected from environment
// The JSON includes embedded newlines for private_key which JSON.parse handles securely
const loadGcpCredentials = () => {
  try {
    if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
      throw new Error("GCP_SERVICE_ACCOUNT_KEY environment variable is missing.");
    }
    // Need to parse twice because we injected it as stringified string to survive env processing
    const credsStr = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
    return typeof credsStr === "string" ? JSON.parse(credsStr) : credsStr;
  } catch (error) {
    console.error("Failed to parse GCP credentials:", error);
    return null;
  }
};

let cachedAuth: any = null;

const getAuth = () => {
  if (cachedAuth) return cachedAuth;
  const credentials = loadGcpCredentials();
  if (!credentials) return null;

  try {
    cachedAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/bigquery.insertdata",
        "https://www.googleapis.com/auth/webmasters.readonly"
      ],
    });
    return cachedAuth;
  } catch (error) {
    console.error("Failed to initialize Google Auth:", error);
    return null;
  }
};

// 1. BigQuery Telemetry for Calculator Interactions
export async function streamCalculationMetricToBigQuery(
  calculationType: string,
  anonymizedUserId: string,
  interactionData: Record<string, any>
) {
  const auth = getAuth();
  const credentials = loadGcpCredentials();
  if (!auth || !credentials) return { success: false, error: "GCP Credentials not loaded" };

  try {
    const bigquery = google.bigquery({ version: "v2", auth });
    const datasetId = "lifebloom_telemetry";
    const tableId = "calculator_interactions";

    const row = {
      json: {
        timestamp: new Date().toISOString(),
        calculation_type: calculationType,
        user_id: anonymizedUserId,
        interaction_data: JSON.stringify(interactionData)
      }
    };

    const response = await bigquery.tabledata.insertAll({
      projectId: credentials.project_id,
      datasetId,
      tableId,
      requestBody: {
        rows: [row],
      },
    });

    if (response.data.insertErrors && response.data.insertErrors.length > 0) {
      console.error("BigQuery Insert Errors:", response.data.insertErrors);
      return { success: false, error: response.data.insertErrors };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to stream to BigQuery:", error);
    return { success: false, error: error.message };
  }
}

// 2. PageSpeed Insights Automated Auditing
export async function runPageSpeedAudit(url: string, strategy: 'mobile' | 'desktop' = 'mobile') {
  const auth = getAuth();
  const credentials = loadGcpCredentials();
  if (!auth || !credentials) return { success: false, error: "GCP Credentials not loaded" };

  try {
    const pagespeed = google.pagespeedonline({ version: "v5", auth });
    
    const response = await pagespeed.pagespeedapi.runpagespeed({
      url,
      strategy,
      category: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    const metrics = {
      performance: response.data.lighthouseResult?.categories?.performance?.score || 0,
      accessibility: response.data.lighthouseResult?.categories?.accessibility?.score || 0,
      bestPractices: response.data.lighthouseResult?.categories?.['best-practices']?.score || 0,
      seo: response.data.lighthouseResult?.categories?.seo?.score || 0,
      lcp: response.data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue || null
    };

    return { success: true, metrics };
  } catch (error: any) {
    console.error("PageSpeed Audit Failed:", error);
    return { success: false, error: error.message };
  }
}
