import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('Testing 3D walkthrough entry into Front Foyer...');
  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.selectFloor(12);
    store.selectFlat('flat-12-a');
    store.enterRoom('foyer');
  });
  await page.waitForTimeout(2500);

  await page.screenshot({ path: './screenshots/test_3d_foyer_entry.png' });
  console.log('Saved: screenshots/test_3d_foyer_entry.png');

  await browser.close();
}

run().catch(console.error);
