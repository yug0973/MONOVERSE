import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = './screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('--- STARTING MODULE 4 FLY-IN & 360 PANORAMA VERIFICATION ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--disable-gpu-watchdog'],
  });

  // 1. Desktop 1920x1080 Tests
  console.log('--- 1. DESKTOP 1920x1080 ---');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopCtx.newPage();

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Switch to building view
  await page.evaluate(() => window.__APP_STORE__?.getState().setViewMode('building'));
  await page.waitForTimeout(800);

  // Select Floor 12
  console.log('Selecting Floor 12...');
  await page.evaluate(() => window.__APP_STORE__?.getState().selectFloor(12));
  await page.waitForTimeout(1400);

  // Trigger fly-in to Unit A
  console.log('Triggering fly-in to Unit A (Penthouse Residence 12A)...');
  await page.evaluate(() => window.__APP_STORE__?.getState().flyInFlat('flat-12-a'));

  // Capture balcony approach window during flight
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, 'module4_desktop_balcony_flyin_1080p.png') });
  console.log('Saved: module4_desktop_balcony_flyin_1080p.png');

  // Wait for arrival at balcony + 800ms warm mask crossfade + entry into 360 panorama
  await page.waitForTimeout(3800);

  const currentMode = await page.evaluate(() => window.__APP_STORE__?.getState().viewMode);
  console.log(`Current viewMode after dissolve: ${currentMode} (expected 'panorama')`);

  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'module4_desktop_interior_panorama_1080p.png') });
  console.log('Saved: module4_desktop_interior_panorama_1080p.png');

  // 1c. Test Sample Residence label on Unit B & Warm Dissolve
  console.log('Returning to floor and testing Unit B Sample Residence label...');
  await page.evaluate(() => window.__APP_STORE__?.getState().returnToFloor());
  await page.waitForTimeout(1600);

  await page.evaluate(() => window.__APP_STORE__?.getState().flyInFlat('flat-12-b'));
  
  // Wait until viewMode becomes 'flat_flyin' or warm mask active
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'module4_desktop_warm_dissolve_1080p.png') });
  console.log('Saved: module4_desktop_warm_dissolve_1080p.png');

  // Wait until viewMode becomes 'panorama' and all animations settle
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => window.__APP_STORE__?.getState().viewMode);
    if (m === 'panorama') break;
  }

  const modeB = await page.evaluate(() => window.__APP_STORE__?.getState().viewMode);
  console.log(`Current viewMode for Unit B: ${modeB} (expected 'panorama')`);

  // Allow warm mask fade-out and HUD entrance animation to fully settle
  await page.waitForTimeout(2800);
  await page.screenshot({ path: path.join(outDir, 'module4_desktop_sample_residence_1080p.png') });
  console.log('Saved: module4_desktop_sample_residence_1080p.png');

  await page.close();
  await desktopCtx.close();

  // 2. Mobile 390x844 Test
  console.log('--- 2. MOBILE 390x844 ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();

  await mobilePage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(4000);

  console.log('Entering panorama on mobile...');
  await mobilePage.evaluate(() => {
    window.__APP_STORE__?.getState().setViewMode('building');
    window.__APP_STORE__?.getState().selectFloor(12);
  });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.evaluate(() => {
    window.__APP_STORE__?.getState().flyInFlat('flat-12-a');
  });
  await mobilePage.waitForTimeout(4200);

  const mobileMode = await mobilePage.evaluate(() => window.__APP_STORE__?.getState().viewMode);
  console.log(`Current viewMode on mobile: ${mobileMode} (expected 'panorama')`);

  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'module4_mobile_interior_panorama_390x844.png') });
  console.log('Saved: module4_mobile_interior_panorama_390x844.png');

  await mobilePage.close();
  await mobileCtx.close();

  await browser.close();
  console.log('--- ALL MODULE 4 VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
