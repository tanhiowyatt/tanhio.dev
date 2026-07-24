/**
 * Visual Regression Tests
 */

const { test, expect } = require('@playwright/test');

test.describe('Visual Comparison', () => {
  test('home page should look correct', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Ждем, пока загрузятся основные элементы
    await page.waitForSelector('h1');
    // Сравниваем скриншот
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('projects page should look correct', async ({ page }) => {
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('projects-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('mobile view should look correct', async ({ page, viewport }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('h1');
    await expect(page).toHaveScreenshot('mobile-home.png', {
      fullPage: true,
    });
  });
});
