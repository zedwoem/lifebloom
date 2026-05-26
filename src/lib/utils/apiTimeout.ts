export class ApiTimeoutError extends Error {
  constructor(message: string = 'API request timed out') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * Fetches with a strict timeout and fallback mechanism
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
      if (fallbackData !== null) return fallbackData;
      throw new ApiTimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`);
    }

    console.warn(`[API ERROR] ${url}: ${error.message}. Using fallback.`);
    if (fallbackData !== null) return fallbackData;
    throw error;
  }
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Stateful Circuit Breaker to enforce fault-tolerance on external open APIs
 */
export class CircuitBreaker {
  private name: string;
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private cooldownMs: number;
  private failureThreshold: number;

  constructor(name: string, failureThreshold = 3, cooldownMs = 30000) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }

  public checkState(): void {
    if (this.state === 'OPEN' && this.lastFailureTime) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF_OPEN';
        console.warn(`[CIRCUIT BREAKER - ${this.name}] Cooldown elapsed. Transitioning to HALF-OPEN.`);
      }
    }
  }

  public recordSuccess(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    console.log(`[CIRCUIT BREAKER - ${this.name}] Request succeeded. Resetting to CLOSED.`);
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`[CIRCUIT BREAKER - ${this.name}] Tripped to OPEN. Failure threshold reached (${this.failureCount}/${this.failureThreshold}).`);
    } else {
      console.warn(`[CIRCUIT BREAKER - ${this.name}] Request failed. Consecutive failures: ${this.failureCount}/${this.failureThreshold}.`);
    }
  }

  public getState(): CircuitState {
    this.checkState();
    return this.state;
  }

  /**
   * Executes a fetch or operation with circuit-breaking wrapping
   */
  public async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    this.checkState();

    if (this.state === 'OPEN') {
      console.warn(`[CIRCUIT BREAKER - ${this.name}] Circuit is OPEN. Fast-failing and returning fallback.`);
      return fallback;
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.recordSuccess();
      }
      return result;
    } catch (err: any) {
      this.recordFailure();
      return fallback;
    }
  }
}

// Pre-instantiated stateful circuit breakers for external open APIs
export const openFdaBreaker = new CircuitBreaker('OpenFDA', 3, 30000);
export const fredBreaker = new CircuitBreaker('FRED', 3, 30000);
export const usdaBreaker = new CircuitBreaker('USDA', 3, 30000);
