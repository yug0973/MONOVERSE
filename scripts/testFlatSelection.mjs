import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(3000);

  const state1 = await page.evaluate(() => {
    return {
      viewMode: window.__APP_STORE__.getState().viewMode,
      selectedFlatId: window.__APP_STORE__.getState().selectedFlatId,
    };
  });
  console.log('Initial state:', state1);

  console.log('Calling selectFlat("flat-9-a")...');
  const res = await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
    return {
      viewMode: window.__APP_STORE__.getState().viewMode,
      selectedFlatId: window.__APP_STORE__.getState().selectedFlatId,
      flat: window.__APP_STORE__.getState().selectedFlatId,
    };
  });
  console.log('After selectFlat:', res);

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshots/test_flat9a.png' });
  console.log('Saved test_flat9a.png');

  await browser.close();
}

test();
