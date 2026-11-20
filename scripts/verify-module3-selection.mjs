import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = './screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching Playwright for Module 3 Floor Selection verification...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  // 1. Desktop 1920x1080: Select Floor 12 and inspect side panel
  console.log('Testing Desktop 1920x1080 with Floor 12 selection...');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopCtx.newPage();

  await desktopPage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(4000); // Wait for Three.js scene & textures

  // Hover floor 12 to trigger terracotta emissive band highlight
  console.log('Hovering Floor 12 to trigger terracotta emissive ribbon...');
  await desktopPage.evaluate(() => {
    if (window.__APP_STORE__) {
      window.__APP_STORE__.getState().setHoveredFloor(12);
    }
  });
  await desktopPage.waitForTimeout(600);

  // Take screenshot 1: Desktop Floor 12 Hovered with Glowing Terracotta Ribbon
  await desktopPage.screenshot({
    path: path.join(outDir, 'module3_desktop_floor12_hover_1080p.png'),
  });
  console.log('Saved: module3_desktop_floor12_hover_1080p.png');

  // Select Floor 12 to trigger camera ease and open FloorDetailsPanel
  console.log('Selecting Floor 12 via useAppStore...');
  await desktopPage.evaluate(() => {
    if (window.__APP_STORE__) {
      window.__APP_STORE__.getState().setHoveredFloor(null);
      window.__APP_STORE__.getState().selectFloor(12);
    }
  });

  // Wait for smooth 600-900ms camera ease and side panel animation
  await desktopPage.waitForTimeout(1600);

  // Take screenshot 2: Desktop Floor 12 Selected with Side Panel & Terracotta Highlight
  await desktopPage.screenshot({
    path: path.join(outDir, 'module3_desktop_floor12_selected_1080p.png'),
  });
  console.log('Saved: module3_desktop_floor12_selected_1080p.png');

  await desktopPage.close();
  await desktopCtx.close();

  // 2. Mobile 390x844: Select Floor 12 and inspect bottom sheet drawer
  console.log('Testing Mobile 390x844 with Floor 12 bottom sheet...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();

  await mobilePage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(4000);

  console.log('Selecting Floor 12 on mobile...');
  await mobilePage.evaluate(() => {
    if (window.__APP_STORE__) {
      window.__APP_STORE__.getState().selectFloor(12);
    }
  });

  await mobilePage.waitForTimeout(1600);

  // Take screenshot 2: Mobile Bottom Sheet
  await mobilePage.screenshot({
    path: path.join(outDir, 'module3_mobile_floor12_bottomsheet_390x844.png'),
  });
  console.log('Saved: module3_mobile_floor12_bottomsheet_390x844.png');

  await mobilePage.close();
  await mobileCtx.close();

  await browser.close();
  console.log('Module 3 Playwright verification complete!');
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
