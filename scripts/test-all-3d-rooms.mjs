import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 1. Enter Foyer
  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.selectFloor(12);
    store.selectFlat('flat-12-a');
    store.enterRoom('foyer');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/walkthrough_3d_01_foyer.png' });
  console.log('Saved: walkthrough_3d_01_foyer.png');

  // 2. Enter Living Room
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('living_dining');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/walkthrough_3d_02_living.png' });
  console.log('Saved: walkthrough_3d_02_living.png');

  // 3. Enter Kitchen
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('kitchen');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/walkthrough_3d_03_kitchen.png' });
  console.log('Saved: walkthrough_3d_03_kitchen.png');

  // 4. Enter Master Bedroom
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('master_bedroom');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/walkthrough_3d_04_bedroom.png' });
  console.log('Saved: walkthrough_3d_04_bedroom.png');

  // 5. Enter Balcony
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('balcony');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: './screenshots/walkthrough_3d_05_balcony.png' });
  console.log('Saved: walkthrough_3d_05_balcony.png');

  await browser.close();
}

run().catch(console.error);
