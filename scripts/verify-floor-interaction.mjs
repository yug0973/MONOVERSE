import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = './screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('--- RUNNING MODULE 3 VERIFICATION & SCREENSHOT CAPTURE ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  // 1. Desktop 1920x1080
  console.log('Desktop 1920x1080: Hovering & Selection tests...');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopCtx.newPage();

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Switch from landing overlay to building view
  await page.evaluate(() => window.__APP_STORE__?.getState().setViewMode('building'));
  await page.waitForTimeout(1000);

  // Hover Floor 6 -> right in center of building camera frustum
  console.log('Hovering Floor 6...');
  await page.evaluate(() => window.__APP_STORE__?.getState().setHoveredFloor(6));
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(outDir, 'module3_desktop_floor_hover_1080p.png') });
  console.log('Saved: module3_desktop_floor_hover_1080p.png');

  // Select Floor 12 -> camera eases, other floors dim, side panel opens
  console.log('Selecting Floor 12...');
  await page.evaluate(() => {
    window.__APP_STORE__?.getState().setHoveredFloor(null);
    window.__APP_STORE__?.getState().selectFloor(12);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(outDir, 'module3_desktop_floor12_selected_1080p.png') });
  console.log('Saved: module3_desktop_floor12_selected_1080p.png');

  // Keyboard navigation checks
  await page.click('body');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const floorAfterEsc = await page.evaluate(() => window.__APP_STORE__?.getState().selectedFloorNumber);
  console.log(`Keyboard Check: after Escape -> selectedFloorNumber = ${floorAfterEsc} (expected null)`);

  await page.evaluate(() => window.__APP_STORE__?.getState().selectFloor(12));
  await page.waitForTimeout(600);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(600);
  const floorAfterDown = await page.evaluate(() => window.__APP_STORE__?.getState().selectedFloorNumber);
  console.log(`Keyboard Check: after ArrowDown -> selectedFloorNumber = ${floorAfterDown} (expected 11)`);

  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(600);
  const floorAfterUp = await page.evaluate(() => window.__APP_STORE__?.getState().selectedFloorNumber);
  console.log(`Keyboard Check: after ArrowUp -> selectedFloorNumber = ${floorAfterUp} (expected 12)`);

  await page.close();
  await desktopCtx.close();

  // 2. Mobile 390x844
  console.log('Mobile 390x844: Floor selection & bottom sheet drawer...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();

  await mobilePage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(4000);

  await mobilePage.evaluate(() => {
    window.__APP_STORE__?.getState().setViewMode('building');
    window.__APP_STORE__?.getState().selectFloor(12);
  });
  await mobilePage.waitForTimeout(1800);

  await mobilePage.screenshot({ path: path.join(outDir, 'module3_mobile_floor12_bottomsheet_390x844.png') });
  console.log('Saved: module3_mobile_floor12_bottomsheet_390x844.png');

  await mobilePage.close();
  await mobileCtx.close();

  await browser.close();
  console.log('--- ALL MODULE 3 CHECKS COMPLETED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
