import { chromium } from 'playwright';

async function testRooms() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(12);
    window.__APP_STORE__.getState().enterApartment3D('flat-12-a');
  });
  await page.waitForTimeout(2500);

  // Click Living & Dining
  const livingBtn = page.locator('button:has-text("Living")').first();
  await livingBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_living_clicked_no_post.png' });

  // Click Master Suite
  const masterBtn = page.locator('button:has-text("Master")').first();
  await masterBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_master_clicked_no_post.png' });

  // Click Sky Deck
  const deckBtn = page.locator('button:has-text("Sky Deck")').first();
  await deckBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_deck_clicked_no_post.png' });

  await browser.close();
  console.log('All room click tests completed successfully!');
}

testRooms().catch(console.error);
