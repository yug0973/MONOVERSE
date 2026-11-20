import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = './screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('--- STARTING MODULE 5 ROOMS & LIGHTING VERIFICATION ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--disable-gpu-watchdog'],
  });

  // ==========================================
  // 1. DESKTOP 1920x1080 VERIFICATIONS
  // ==========================================
  console.log('--- 1. DESKTOP 1920x1080 ---');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopCtx.newPage();

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Select Floor 12 and fly into Unit A
  console.log('Navigating to Floor 12 and flying into Unit A...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setViewMode('building');
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await page.waitForTimeout(1000);

  await page.evaluate(() => window.__APP_STORE__.getState().flyInFlat('flat-12-a'));
  await page.waitForTimeout(3800);

  const initialMode = await page.evaluate(() => window.__APP_STORE__.getState().viewMode);
  console.log(`Initial viewMode: ${initialMode} (expected 'panorama')`);

  // 1a. Test Living Room Day & Night Panorama variants
  console.log('Testing Living Room Day variant...');
  await page.evaluate(() => window.__APP_STORE__.getState().setLightingVariant('day'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_living_day_1080p.png') });
  console.log('Saved: module5_desktop_living_day_1080p.png');

  console.log('Testing Living Room Night variant...');
  await page.evaluate(() => window.__APP_STORE__.getState().setLightingVariant('night'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_living_night_1080p.png') });
  console.log('Saved: module5_desktop_living_night_1080p.png');

  // 1b. Test Master Bedroom (Sunset & Night with per-image transform)
  console.log('Switching to Master Bedroom...');
  await page.evaluate(() => window.__APP_STORE__.getState().switchTourRoom('bedroom'));
  await page.waitForTimeout(1000);

  const bedroomSunset = await page.evaluate(() => ({
    room: window.__APP_STORE__.getState().activeRoomId,
    variant: window.__APP_STORE__.getState().selectedLightingVariant,
  }));
  console.log('Bedroom Sunset State:', JSON.stringify(bedroomSunset));
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_bedroom_sunset_1080p.png') });
  console.log('Saved: module5_desktop_bedroom_sunset_1080p.png');

  console.log('Switching Master Bedroom to Night (500ms crossfade with alignment transform)...');
  await page.evaluate(() => window.__APP_STORE__.getState().setLightingVariant('night'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_bedroom_night_1080p.png') });
  console.log('Saved: module5_desktop_bedroom_night_1080p.png');

  // 1c. Test Modular Kitchen (Day & Sunset with fixed 1.06 zoom)
  console.log('Switching to Kitchen...');
  await page.evaluate(() => window.__APP_STORE__.getState().switchTourRoom('kitchen'));
  await page.waitForTimeout(1000);

  const kitchenSunset = await page.evaluate(() => ({
    room: window.__APP_STORE__.getState().activeRoomId,
    variant: window.__APP_STORE__.getState().selectedLightingVariant,
  }));
  console.log('Kitchen Sunset State:', JSON.stringify(kitchenSunset));
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_kitchen_sunset_1080p.png') });
  console.log('Saved: module5_desktop_kitchen_sunset_1080p.png');

  console.log('Switching Kitchen to Day...');
  await page.evaluate(() => window.__APP_STORE__.getState().setLightingVariant('day'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_kitchen_day_1080p.png') });
  console.log('Saved: module5_desktop_kitchen_day_1080p.png');

  // 1d. Test Balcony (Sunset only, no faked Day or Night)
  console.log('Switching to Balcony...');
  await page.evaluate(() => window.__APP_STORE__.getState().switchTourRoom('balcony'));
  await page.waitForTimeout(1000);

  const balconyState = await page.evaluate(() => ({
    room: window.__APP_STORE__.getState().activeRoomId,
    variant: window.__APP_STORE__.getState().selectedLightingVariant,
  }));
  console.log('Balcony State:', JSON.stringify(balconyState));
  await page.screenshot({ path: path.join(outDir, 'module5_desktop_balcony_sunset_1080p.png') });
  console.log('Saved: module5_desktop_balcony_sunset_1080p.png');

  await page.close();
  await desktopCtx.close();

  // ==========================================
  // 2. MOBILE 390x844 VERIFICATIONS
  // ==========================================
  console.log('--- 2. MOBILE 390x844 ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();

  await mobilePage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(3000);

  await mobilePage.evaluate(() => {
    window.__APP_STORE__.getState().setViewMode('building');
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.evaluate(() => window.__APP_STORE__.getState().flyInFlat('flat-12-a'));
  await mobilePage.waitForTimeout(3800);

  console.log('Mobile: Switching to Master Bedroom...');
  await mobilePage.evaluate(() => window.__APP_STORE__.getState().switchTourRoom('bedroom'));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'module5_mobile_bedroom_sunset_390x844.png') });
  console.log('Saved: module5_mobile_bedroom_sunset_390x844.png');

  console.log('Mobile: Switching to Kitchen...');
  await mobilePage.evaluate(() => window.__APP_STORE__.getState().switchTourRoom('kitchen'));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'module5_mobile_kitchen_sunset_390x844.png') });
  console.log('Saved: module5_mobile_kitchen_sunset_390x844.png');

  await mobilePage.close();
  await mobileCtx.close();

  await browser.close();
  console.log('--- ALL MODULE 5 VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
