import {test,expect} from "@playwright/test";
test.use({ viewport: { width: 1920, height: 1080 } });
test('scrolls Shop by Category internal list', async ({ page }) => {
  await page.goto('https://www.bigbasket.com/');

page.locator("//span[text()='Shop by']//following::span[text()='Category'][2]").click();
await page.locator("//a[@href='/cl/food-court/?nc=nb']").nth(1).click();

// Manual approach - requires locating the scrollable container

const scrollContainer = page.locator('div[style*="overflow: scroll"]').first();
//await scrollContainer.evaluate((el) => el.scrollBy(0, 500));
await page.getByText('Product Rating', { exact: true }).scrollIntoViewIfNeeded();
const productRatingSection = page.locator('#side-filter-by-rating').filter({ hasText: 'Product Rating' });
const checkboxes = productRatingSection.locator('input[type="checkbox"]');

const count = await checkboxes.count();
for (let i = 0; i < count; i++) {
  await checkboxes.nth(i).click();
}
// Scroll to the bottom repeatedly until no new content loads
let previousHeight = 0;
while (true) {
  const currentHeight = await page.evaluate(() => document.body.scrollHeight);
  if (currentHeight === previousHeight) break; // no more content loaded, reached the end

  await page.mouse.wheel(0, 5000); // scroll down
  previousHeight = currentHeight;

  await page.waitForTimeout(1000); // give time for lazy-loaded products to render
}
 
const productCards = page.locator('//li[@class="PaginateItems___StyledLi2-sc-1yrbjdr-0 fysWhp"]');

// Filter to only cards that contain "28% OFF" badge text
const discount28Cards = productCards.filter({ hasText: '28% OFF' });

const count1 = await discount28Cards.count();
console.log(`Found ${count} products with 28% OFF`);

for (let i = 0; i < count1; i++) {
  const card = discount28Cards.nth(i);
  await card.scrollIntoViewIfNeeded();
  await card.locator('button', { hasText: /Add/i }).click(); // adjust based on actual button text/selector
}


});