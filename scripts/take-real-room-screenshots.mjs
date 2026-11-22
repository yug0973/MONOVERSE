import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/YUG BRAHMBHATT/.gemini/antigravity/brain/6fe7aa3e-f6eb-4ce3-a115-a957e94ff3ad';

function copyArtifact(srcPath, filename) {
  const destPath = path.join(ARTIFACT_DIR, filename);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Saved screenshot to: ${destPath}`);
}

async function captureAllRooms() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  console.log('1. Loading application at http://localhost:5180...');
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__APP_STORE__ && !!window.__THREE_SCENE__);
  await page.waitForTimeout(1000);

  // 1. Enter Flat 12-A in Walkthrough mode
  console.log('2. Entering Floor 12 Unit 12-A in 3D walkthrough...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterApartment3D('flat-12-a');
  });
  await page.waitForTimeout(2500);

  // Helper to capture a room
  async function captureRoom(roomId, filename, label) {
    console.log(`Navigating to ${label}...`);
    // Click room button in dock
    const btn = page.locator(`button:has-text("${label}")`).first();
    if (await btn.count() > 0) {
      await btn.click();
    } else {
      await page.evaluate((r) => {
        window.__APP_STORE__.getState().enterRoom(r);
      }, roomId);
    }
    await page.waitForTimeout(2000);

    const shotPath = `screenshots/${filename}`;
    fs.mkdirSync('screenshots', { recursive: true });
    await page.screenshot({ path: shotPath });
    copyArtifact(shotPath, filename);
    console.log(`✓ Captured ${label}`);
  }

  // 1. Front Foyer
  await captureRoom('foyer', 'room_01_foyer.png', 'Front Foyer');

  // 2. Living & Dining Hall
  await captureRoom('living', 'room_02_living_dining.png', 'Living & Dining');

  // 3. Kitchen
  await captureRoom('kitchen', 'room_03_kitchen.png', 'Kitchen');

  // 4. Master Suite
  await captureRoom('master-bedroom', 'room_04_master_suite.png', 'Master Suite');

  // 5. Sky Deck / Terrace
  await captureRoom('balcony', 'room_05_sky_deck.png', 'Sky Deck');

  // 6. Family Lounge
  await captureRoom('family-lounge', 'room_06_family_lounge.png', 'Family Lounge');

  await browser.close();
  console.log('All real room screenshots successfully captured!');
}

captureAllRooms().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
