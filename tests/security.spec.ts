import { test, expect } from '@playwright/test';

test.describe('LifeBloom Hub - Security Hardening & Hacker QA E2E Test Suite', () => {

  const LOCALHOST_BASE = 'http://localhost:3000';

  // 1. Open Redirect Vulnerability Mitigation
  test('Mitigation: Should reject open redirect vectors on affiliate route', async ({ request }) => {
    // Try to trigger open redirect to an unauthorized malicious domain
    const response = await request.get(`${LOCALHOST_BASE}/api/affiliate`, {
      params: {
        vendor: 'editorial',
        product_id: 'https://evil-phishing-domain.com/scam'
      }
    });

    // The endpoint should block it (status 400 Bad Request)
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Domain tidak diizinkan');
  });

  test('Allowlist Check: Should allow approved affiliate domains on redirect', async ({ request }) => {
    // Standard approved domain (ncbi.nlm.nih.gov)
    const response = await request.get(`${LOCALHOST_BASE}/api/affiliate`, {
      params: {
        vendor: 'editorial',
        product_id: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC112345/'
      }
    });

    // Should redirect safely (status 307 Temporary Redirect or similar redirect status)
    expect([302, 307, 308]).toContain(response.status());
  });

  // 2. Health-Ping Secret Hardcoding Protection
  test('Mitigation: Should block unauthorized access to health-ping cron endpoint', async ({ request }) => {
    // Calling without secrets should return 401 or 503
    const response = await request.get(`${LOCALHOST_BASE}/api/admin/health-ping`);
    expect([401, 503]).toContain(response.status());
  });

  // 3. Admin Command Center Broken Access Control
  test('Mitigation: Unauthorized users should be redirected from the Admin Desk', async ({ page }) => {
    // Navigate to admin command center without credentials
    await page.goto(`${LOCALHOST_BASE}/id/admin`);

    // Hydration guard should trigger and route back to login or dashboard
    await page.waitForURL(url => !url.pathname.includes('/admin'));
    expect(page.url()).not.toContain('/admin');
  });

  // 4. RLS & SQL Injections Bypass / Points Farming Protection
  test('Mitigation: Should reject unauthorized direct points modification via Server Action simulated payload', async ({ request }) => {
    // Sending calculation save request without valid session / auth
    const response = await request.post(`${LOCALHOST_BASE}/api/user/calculations`, {
      data: {
        calculatorSlug: 'retirement-calculator',
        inputParams: { currentAge: 30 },
        outputResults: { projected: 100 }
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});
