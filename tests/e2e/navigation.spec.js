/**
 * End-to-End Navigation Tests
 */

const { test, expect } = require('@playwright/test');

test.describe('Site Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should load main page', async ({ page }) => {
    await expect(page).toHaveTitle(/tanhiowyatt/);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should navigate to crypto page', async ({ page }) => {
    const cryptoLink = page.locator('a[href*="crypto"]').first();
    if (await cryptoLink.count() > 0) {
      await cryptoLink.click();
      await expect(page).toHaveURL(/crypto/);
    }
  });
});

test.describe('Links Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should display link cards', async ({ page }) => {
    const linkCards = page.locator('.link-card');
    await expect(linkCards.first()).toBeVisible();
    const count = await linkCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper security attributes on external links', async ({ page }) => {
    const externalLink = page.locator('a[href^="https://"]').first();
    if (await externalLink.count() > 0) {
      const rel = await externalLink.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });
});
