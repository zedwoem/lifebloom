export class ApiTimeoutError extends Error {
  constructor(message: string = 'API request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * Fetches with a strict timeout and fallback mechanism
 * @param url The API URL to fetch
 * @param options Fetch options
 * @param timeoutMs Strict timeout in milliseconds (default: 4000)
 * @param fallbackData Fallback JSON data if timeout or error occurs
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 4000,
  fallbackData: T | null = null
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error: any) {
    clearTimeout(id);
    
    if (error.name === 'AbortError') {
      console.warn(`[API TIMEOUT] ${url} exceeded ${timeoutMs}ms. Using fallback.`);
      if (fallbackData) return fallbackData;
      throw new ApiTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`);
    }

    console.warn(`[API ERROR] ${url}: ${error.message}. Using fallback.`);
    if (fallbackData) return fallbackData;
    throw error;
  }
}
