import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = './screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching Playwright for Module 2 verification...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  // 1. Desktop 1920x1080 with ?debug=1
  console.log('Testing Desktop 1920x1080 in Textured Mode...');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopCtx.newPage();

  // Navigate to 3D app with debug enabled
  await desktopPage.goto('http://localhost:5180/?debug=1', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(3000); // Wait for Three.js textures and shader compilation

  // Take screenshot 1: Desktop Textured
  await desktopPage.screenshot({
    path: path.join(outDir, 'module2_desktop_textured_1080p.png'),
  });
  console.log('Saved: module2_desktop_textured_1080p.png');

  // Press 'd' to switch to Clay mode
  console.log('Pressing D to toggle Clay mode...');
  await desktopPage.keyboard.press('d');
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(outDir, 'module2_desktop_clay_1080p.png'),
  });
  console.log('Saved: module2_desktop_clay_1080p.png');

  // Press 'd' to switch to Wireframe mode
  console.log('Pressing D to toggle Wireframe mode...');
  await desktopPage.keyboard.press('d');
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.join(outDir, 'module2_desktop_wireframe_1080p.png'),
  });
  console.log('Saved: module2_desktop_wireframe_1080p.png');

  // Press 'd' to return to Textured mode
  await desktopPage.keyboard.press('d');
  await desktopPage.waitForTimeout(500);

  await desktopPage.close();
  await desktopCtx.close();

  // 2. Mobile 390x844 (iPhone 14 / modern standard)
  console.log('Testing Mobile 390x844...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  // Wait until loading screen is fully dismissed
  await mobilePage.waitForFunction(() => !document.querySelector('text-ink-secondary') && window.scrollY >= 0, { timeout: 15000 }).catch(() => {});
  await mobilePage.waitForTimeout(6000);

  await mobilePage.screenshot({
    path: path.join(outDir, 'module2_mobile_textured_390x844.png'),
  });
  console.log('Saved: module2_mobile_textured_390x844.png');

  await mobilePage.close();
  await mobileCtx.close();

  await browser.close();
  console.log('Module 2 Playwright verification complete!');
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
