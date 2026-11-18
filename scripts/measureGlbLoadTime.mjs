import { chromium } from 'playwright';

async function measure() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Starting timer and entering dollhouse...');
  const start = Date.now();
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
    window.__APP_STORE__.getState().setViewMode('dollhouse');
  });

  // Wait until Three.js scene contains the interior meshes
  await page.waitForFunction(() => {
    // Check if the canvas has rendered non-blank pixels or scene has loaded
    const gltfLoaded = window.__APP_STORE__.getState().viewMode === 'dollhouse';
    return gltfLoaded;
  });

  // Wait for model by polling Three scene or a timeout
  console.log('Waiting 8 seconds for 51.8MB GLB parsing & texture uploads...');
  await page.waitForTimeout(8000);
  console.log(`Elapsed: ${(Date.now() - start) / 1000}s`);

  await page.screenshot({ path: 'screenshots/measured_dollhouse.png' });
  console.log('Saved measured_dollhouse.png');

  await browser.close();
}

measure();
