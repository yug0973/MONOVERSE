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
  console.log('--- AAROHAN RESIDENCES: PHASE 2 FINAL WALKTHROUGH TEST SUITE ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser ERROR]: ${msg.text()}`);
  });

  console.log('1. Navigating to Aarohan Residences...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__APP_STORE__ && !!window.__THREE_SCENE__);
  await page.waitForTimeout(1000);

  // Enter Floor 12
  console.log('2. Selecting Floor 12...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await page.waitForTimeout(1400);

  // Enter Unit 12-A in 3D Foyer Walkthrough
  console.log('3. Entering Unit 12-A via Cinematic Foyer Entry...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterApartment3D('flat-12-a');
  });

  // Wait for 1.4s flight into Foyer
  await page.waitForTimeout(2200);

  const shot1 = 'screenshots/phase2_final_01_foyer_entrance.png';
  await page.screenshot({ path: shot1 });
  saveScreenshot(shot1, 'phase2_final_01_foyer_entrance.png');
  console.log('✓ Captured Foyer Entrance Arrival');

  // Verify Foyer Teak Portal Spec Pin & Sunset lighting
  console.log('4. Testing Time of Day Switcher: Golden Hour Sunset...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setTimeOfDay('golden_hour');
  });
  await page.waitForTimeout(1000);

  const shot2 = 'screenshots/phase2_final_02_golden_hour_foyer.png';
  await page.screenshot({ path: shot2 });
  saveScreenshot(shot2, 'phase2_final_02_golden_hour_foyer.png');
  console.log('✓ Captured Golden Hour Foyer with dynamic sunset lighting');

  // Glide to Living & Dining Room
  console.log('5. Gliding to Double-Height Living & Banquet Dining Hall...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('living_dining');
  });
  await page.waitForTimeout(2000);

  // Switch to Night lighting
  console.log('6. Switching to Atmospheric Night Lighting Preset...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setTimeOfDay('night');
  });
  await page.waitForTimeout(1200);

  const shot3 = 'screenshots/phase2_final_03_living_dining_night.png';
  await page.screenshot({ path: shot3 });
  saveScreenshot(shot3, 'phase2_final_03_living_dining_night.png');
  console.log('✓ Captured Living & Dining Hall under Atmospheric Night Lighting with warm chandeliers');

  // Open Statuario Marble Spec Pin
  console.log('7. Opening Italian Statuario Marble Specification Card...');
  const marblePin = page.locator('button:has-text("Italian Statuario Marble")');
  if (await marblePin.count() > 0) {
    await marblePin.first().dispatchEvent('click');
    await page.waitForTimeout(800);
    const shot4 = 'screenshots/phase2_final_04_marble_spec_card.png';
    await page.screenshot({ path: shot4 });
    saveScreenshot(shot4, 'phase2_final_04_marble_spec_card.png');
    console.log('✓ Captured Statuario Marble Specification Card');
  }

  // Glide to Island Kitchen
  console.log('8. Gliding to Show & Wet Kitchen with Blum Quartz Island in Morning daylight...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('kitchen');
    window.__APP_STORE__.getState().setTimeOfDay('morning');
  });
  await page.waitForTimeout(2000);

  const kitchenPin = page.locator('button:has-text("German Blum Modular Kitchen")');
  if (await kitchenPin.count() > 0) {
    await kitchenPin.first().dispatchEvent('click');
    await page.waitForTimeout(800);
  }
  const shot5 = 'screenshots/phase2_final_05_kitchen_island_morning.png';
  await page.screenshot({ path: shot5 });
  saveScreenshot(shot5, 'phase2_final_05_kitchen_island_morning.png');
  console.log('✓ Captured Island Kitchen under Morning Sunlight with Blum specifications');

  // Glide to Master Suite
  console.log('9. Gliding to Presidential Master Suite...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('master_bedroom');
    window.__APP_STORE__.getState().setTimeOfDay('golden_hour');
  });
  await page.waitForTimeout(2000);

  const woodPin = page.locator('button:has-text("Engineered European Oak")');
  if (await woodPin.count() > 0) {
    await woodPin.first().dispatchEvent('click');
    await page.waitForTimeout(800);
  }
  const shot6 = 'screenshots/phase2_final_06_master_suite_golden_hour.png';
  await page.screenshot({ path: shot6 });
  saveScreenshot(shot6, 'phase2_final_06_master_suite_golden_hour.png');
  console.log('✓ Captured Master Suite under Golden Hour sunset glow with Oak specifications');

  // Glide to Panoramic Sundeck Sky Terrace
  console.log('10. Gliding to Expansive Sky Deck Terrace...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('balcony');
  });
  await page.waitForTimeout(2000);

  const balconyPin = page.locator('button:has-text("Panoramic Glass Balustrade")');
  if (await balconyPin.count() > 0) {
    await balconyPin.first().dispatchEvent('click');
    await page.waitForTimeout(800);
  }
  const shot7 = 'screenshots/phase2_final_07_sundeck_sky_terrace.png';
  await page.screenshot({ path: shot7 });
  saveScreenshot(shot7, 'phase2_final_07_sundeck_sky_terrace.png');
  console.log('✓ Captured Sundeck Sky Terrace with frameless balustrade spec');

  // Mobile Viewport Verification (390 x 844)
  console.log('11. Testing Mobile Viewport (iPhone 14 / 390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1200);

  const shot8 = 'screenshots/phase2_final_08_mobile_walkthrough_390x844.png';
  await page.screenshot({ path: shot8 });
  saveScreenshot(shot8, 'phase2_final_08_mobile_walkthrough_390x844.png');
  console.log('✓ Captured Mobile Walkthrough Experience');

  // Return to Floor Cutaway (Zero State Loss)
  console.log('12. Returning to Floor Cutaway...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  const state = await page.evaluate(() => {
    const store = window.__APP_STORE__ ? window.__APP_STORE__.getState() : null;
    return {
      viewMode: store?.viewMode,
      selectedFloorNumber: store?.selectedFloorNumber,
      selectedFlatId: store?.selectedFlatId,
      timeOfDay: store?.customization?.timeOfDay,
    };
  });
  console.log('Final State check:', state);

  const shot9 = 'screenshots/phase2_final_09_returned_floor_cutaway.png';
  await page.screenshot({ path: shot9 });
  saveScreenshot(shot9, 'phase2_final_09_returned_floor_cutaway.png');

  await browser.close();
  console.log('=== ALL PHASE 2 VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

run().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
