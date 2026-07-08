import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
//test.use({ viewport: { width: 1920, height: 1080 } });

test('logging into AJio website:', async({ page }) =>
{
  await page.goto("https://www.zepto.com/");
 
await page.getByText('Fresh', { exact: true }).first().click();

// Scroll down first to force lazy-loaded content to render
let previousHeight = 0;
while (true) {
  const currentHeight = await page.evaluate(() => document.body.scrollHeight);
  if (currentHeight === previousHeight) break;
  await page.mouse.wheel(0, 3000);
  previousHeight = currentHeight;
  await page.waitForTimeout(800);
}

// Now filter — using a more robust CSS selector instead of strict XPath
const productCards = page.locator('div.relative.inline-block.cursor-pointer');
const matchingCards = productCards.filter({ 
  hasText: /1[0-9][0-9]\s*g|200\s*g/ 
});

const count = await matchingCards.count();
console.log(`Found ${count} products with 200 grams`);

for (let i = 0; i < count; i++) {
  const card = matchingCards.nth(i);
  await card.scrollIntoViewIfNeeded();

  const addButton = card.locator('button', { hasText: 'ADD' });
  const increaseButton = card.locator('button', { hasText: 'Increase quantity' });

  if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await addButton.click();
  } else if (await increaseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Item already in cart — increment quantity instead
    await increaseButton.click();
  } else {
    console.warn(`Card ${i}: neither ADD nor Increase quantity button found, skipping.`);
  }
}
await page.getByText('All',({exact:true})).click();
await page.locator('a[href*="meats-fish-eggs"]').first().click();

// More specific — targets sidebar only
const sidebar = page.locator('div.no-scrollbar');
await sidebar.getByText('Cold Cuts', { exact: true }).scrollIntoViewIfNeeded();
await sidebar.getByText('Cold Cuts', { exact: true }).click();



});

