import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('Selecting flat-9-a and switching to dollhouse...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
    window.__APP_STORE__.getState().setViewMode('dollhouse');
  });

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshots/test_dollhouse.png' });
  console.log('Saved test_dollhouse.png');
  await browser.close();
}

diagnose();
