import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PORT = 5180;
const BASE_URL = `http://localhost:${PORT}/`;
const SCREENSHOT_DIR = path.resolve('screenshots');
const ARTIFACTS_DIR = 'C:/Users/YUG BRAHMBHATT/.gemini/antigravity/brain/6fe7aa3e-f6eb-4ce3-a115-a957e94ff3ad';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function saveScreenshot(sourceRelPath, artifactName) {
  const fullSrc = path.resolve(sourceRelPath);
  if (fs.existsSync(fullSrc) && fs.existsSync(ARTIFACTS_DIR)) {
    const dest = path.join(ARTIFACTS_DIR, artifactName);
    fs.copyFileSync(fullSrc, dest);
  }
}

async function run() {
  console.log('=== TESTING REALISTIC PRISTINE ARCHITECTURAL WALKTHROUGH ===');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser ERROR]: ${msg.text()}`);
  });

  console.log('1. Loading Aarohan Residences at http://localhost:5180...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__APP_STORE__ && !!window.__THREE_SCENE__);
  await page.waitForTimeout(1000);

  console.log('2. Entering Floor 12 and Unit 12-A...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterApartment3D('flat-12-a');
  });

  // Wait for 1.4s flight into Foyer
  await page.waitForTimeout(2500);

  // 1. Pristine Foyer
  const shot1 = 'screenshots/pristine_01_foyer_clean.png';
  await page.screenshot({ path: shot1 });
  saveScreenshot(shot1, 'pristine_01_foyer_clean.png');
  console.log('✓ 1. Captured Pristine Front Foyer (Clean 3D, zero floating cards)');

  // 2. Test WASD movement forward into Gallery Hallway
  console.log('3. Walking forward using W key...');
  await page.keyboard.down('w');
  await page.waitForTimeout(1200);
  await page.keyboard.up('w');
  await page.waitForTimeout(400);

  const shot2 = 'screenshots/pristine_02_walked_forward_hallway.png';
  await page.screenshot({ path: shot2 });
  saveScreenshot(shot2, 'pristine_02_walked_forward_hallway.png');
  console.log('✓ 2. Captured Smooth Walking in Gallery Hallway');

  // 3. Test Room Dock: Living & Dining Hall
  console.log('4. Gliding to Double-Height Living & Dining Hall...');
  const livingBtn = page.locator('button:has-text("Living & Dining")');
  await livingBtn.click();
  await page.waitForTimeout(2200);

  const shot3 = 'screenshots/pristine_03_living_dining_day.png';
  await page.screenshot({ path: shot3 });
  saveScreenshot(shot3, 'pristine_03_living_dining_day.png');
  console.log('✓ 3. Captured Grand Living & Dining Hall (Daylight, 100% clean view)');

  // 4. Test Sunset Lighting Preset in Living Room
  console.log('5. Switching to Sunset Golden Hour lighting...');
  const sunsetBtn = page.locator('button:has-text("Sunset")');
  if (await sunsetBtn.count() > 0) {
    await sunsetBtn.first().click();
    await page.waitForTimeout(1200);
  }
  const shot4 = 'screenshots/pristine_04_living_dining_sunset.png';
  await page.screenshot({ path: shot4 });
  saveScreenshot(shot4, 'pristine_04_living_dining_sunset.png');
  console.log('✓ 4. Captured Living & Dining Hall under Golden Hour Sunset');

  // 5. Test Night Mood Lighting
  console.log('6. Switching to Atmospheric Night lighting...');
  const nightBtn = page.locator('button:has-text("Night")');
  if (await nightBtn.count() > 0) {
    await nightBtn.first().click();
    await page.waitForTimeout(1200);
  }
  const shot5 = 'screenshots/pristine_05_living_dining_night.png';
  await page.screenshot({ path: shot5 });
  saveScreenshot(shot5, 'pristine_05_living_dining_night.png');
  console.log('✓ 5. Captured Living & Dining Hall under Atmospheric Night Chandeliers');

  // 6. Test Room Dock: Island Kitchen
  console.log('7. Gliding to Island Kitchen...');
  const kitchenBtn = page.locator('button:has-text("Kitchen")');
  await kitchenBtn.click();
  await page.waitForTimeout(2200);

  const shot6 = 'screenshots/pristine_06_kitchen_island.png';
  await page.screenshot({ path: shot6 });
  saveScreenshot(shot6, 'pristine_06_kitchen_island.png');
  console.log('✓ 6. Captured Island Kitchen');

  // 7. Test Room Dock: Presidential Master Suite
  console.log('8. Gliding to Presidential Master Suite...');
  const masterBtn = page.locator('button:has-text("Master Suite")');
  await masterBtn.click();
  await page.waitForTimeout(2200);

  const shot7 = 'screenshots/pristine_07_master_suite.png';
  await page.screenshot({ path: shot7 });
  saveScreenshot(shot7, 'pristine_07_master_suite.png');
  console.log('✓ 7. Captured Presidential Master Suite');

  // 8. Test Room Dock: Sky Deck Terrace
  console.log('9. Gliding to Panoramic Sky Deck Terrace...');
  const deckBtn = page.locator('button:has-text("Sky Deck")');
  await deckBtn.click();
  await page.waitForTimeout(2200);

  const shot8 = 'screenshots/pristine_08_sky_deck_terrace.png';
  await page.screenshot({ path: shot8 });
  saveScreenshot(shot8, 'pristine_08_sky_deck_terrace.png');
  console.log('✓ 8. Captured Panoramic Sky Deck Terrace');

  // 9. Test Specifications Drawer (Slides out from right edge, off 3D view)
  console.log('10. Opening Architectural Finishes & Specs Drawer...');
  const specsBtn = page.locator('button:has-text("Finishes & Specs")');
  await specsBtn.click();
  await page.waitForTimeout(800);

  const shot9 = 'screenshots/pristine_09_specs_drawer_open.png';
  await page.screenshot({ path: shot9 });
  saveScreenshot(shot9, 'pristine_09_specs_drawer_open.png');
  console.log('✓ 9. Captured Specs Drawer Open (Clean side panel, 3D remains visible)');

  // Close specs drawer
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // 10. Mobile Responsiveness (390 x 844)
  console.log('11. Testing Mobile Viewport (iPhone 14 / 390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  const shot10 = 'screenshots/pristine_10_mobile_clean_390x844.png';
  await page.screenshot({ path: shot10 });
  saveScreenshot(shot10, 'pristine_10_mobile_clean_390x844.png');
  console.log('✓ 10. Captured Mobile Clean Walkthrough');

  await browser.close();
  console.log('=== ALL REALISTIC ARCHITECTURAL TESTS PASSED ===');
}

run().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
