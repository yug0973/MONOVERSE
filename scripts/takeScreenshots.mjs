import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser for architectural visualization capture...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=default',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const baseUrl = 'http://localhost:5180';
  console.log(`Navigating to ${baseUrl}...`);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 30000 });
  await page.waitForTimeout(5000); // Wait for initial GLB load and SceneLoader fadeout

  // Helper to change app state via exposed store
  const setAppState = async (fn) => {
    await page.evaluate(fn);
    await page.waitForTimeout(3000); // Allow camera lerp and scene transitions to complete
  };

  const shot = async (filename) => {
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, filename),
      animations: 'disabled',
      timeout: 15000,
    });
  };

  // 1. Landing View
  console.log('Capturing 01_landing.png...');
  await shot('01_landing.png');

  // 2. Tower Orbit View
  console.log('Capturing 02_tower_orbit.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().selectFlat(null);
    window.__APP_STORE__.getState().selectFloor(null);
    window.__APP_STORE__.getState().setViewMode('building');
  });
  await shot('02_tower_orbit.png');

  // 3. Floor Slice View (Floor 9 sliced)
  console.log('Capturing 03_floor_slice.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().selectFloor(9);
    window.__APP_STORE__.getState().setViewMode('floor_slice');
  });
  await shot('03_floor_slice.png');

  // 4. Dollhouse View (Flat 9A cutaway)
  console.log('Capturing 04_dollhouse.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
    window.__APP_STORE__.getState().setViewMode('dollhouse');
  });
  await shot('04_dollhouse.png');

  // 5. Living Room View (Walkthrough)
  console.log('Capturing 05_living_room.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().enterRoom('living_dining');
  });
  await shot('05_living_room.png');

  // 6. Master Bedroom View (Walkthrough)
  console.log('Capturing 06_master_bedroom.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().enterRoom('master_bedroom');
  });
  await shot('06_master_bedroom.png');

  // 7. Kitchen View (Walkthrough)
  console.log('Capturing 07_kitchen.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().enterRoom('kitchen');
  });
  await shot('07_kitchen.png');

  // 8. Balcony View (Walkthrough)
  console.log('Capturing 08_balcony.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().enterRoom('balcony');
  });
  await shot('08_balcony.png');

  // 9. Night Mode (Exterior Tower)
  console.log('Capturing 09_night_mode.png...');
  await setAppState(() => {
    window.__APP_STORE__.getState().selectFlat(null);
    window.__APP_STORE__.getState().selectFloor(null);
    window.__APP_STORE__.getState().setViewMode('building');
    window.__APP_STORE__.getState().setTimeOfDay('night');
  });
  await shot('09_night_mode.png');

  // 10. Responsive Viewports for UI Overlap Checks
  console.log('Capturing UI at 1920x1080...');
  await setAppState(() => {
    window.__APP_STORE__.getState().setTimeOfDay('golden_hour');
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
    window.__APP_STORE__.getState().setViewMode('walkthrough');
    window.__APP_STORE__.getState().enterRoom('living_dining');
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1500);
  await shot('ui_1920x1080.png');

  console.log('Capturing UI at 1366x768...');
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(1500);
  await shot('ui_1366x768.png');

  console.log('Capturing UI at 390x844 (Mobile)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await shot('ui_390x844.png');

  await browser.close();
  console.log('All screenshots captured successfully in /screenshots directory.');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
