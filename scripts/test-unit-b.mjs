import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('--- SELECTING FLOOR 12 ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setViewMode('building');
    window.__APP_STORE__.getState().selectFloor(12);
  });
  await page.waitForTimeout(1000);

  console.log('--- FLYING TO UNIT A ---');
  await page.evaluate(() => window.__APP_STORE__.getState().flyInFlat('flat-12-a'));
  await page.waitForTimeout(3500);

  const modeA = await page.evaluate(() => window.__APP_STORE__.getState().viewMode);
  console.log('Mode after Unit A:', modeA);

  console.log('--- RETURNING TO FLOOR ---');
  await page.evaluate(() => window.__APP_STORE__.getState().returnToFloor());
  await page.waitForTimeout(1500);

  console.log('--- FLYING TO UNIT B ---');
  await page.evaluate(() => window.__APP_STORE__.getState().flyInFlat('flat-12-b'));

  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({
      mode: window.__APP_STORE__.getState().viewMode,
      flat: window.__APP_STORE__.getState().selectedFlatId,
      mask: window.__APP_STORE__.getState().isDissolvingWarmMask,
    }));
    console.log(`t=${(i + 1) * 500}ms:`, JSON.stringify(state));
  }

  await browser.close();
}

run().catch(console.error);
