import { chromium } from 'playwright';

async function testFullJourney() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11'
    ]
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  
  console.log('--- Step 1: Loading Building View ---');
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  console.log('--- Step 2: Selecting Flat 9-A (Dollhouse Cutaway) ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'screenshots/dollhouse_optimized.png' });
  console.log('Saved screenshots/dollhouse_optimized.png');

  console.log('--- Step 3: Customizing Finishes ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setGlobalWallColor('terracotta');
    window.__APP_STORE__.getState().setFlooring('warm_oak');
    window.__APP_STORE__.getState().setFurniturePackage('premium');
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/dollhouse_customized.png' });
  console.log('Saved screenshots/dollhouse_customized.png');

  console.log('--- Step 4: Entering Walkthrough Mode ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterWalkthrough('living_dining');
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'screenshots/walkthrough_living_dining.png' });
  console.log('Saved screenshots/walkthrough_living_dining.png');

  console.log('--- Step 5: Moving to Master Bedroom ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setActiveRoom('master_bedroom');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/walkthrough_master_bedroom.png' });
  console.log('Saved screenshots/walkthrough_master_bedroom.png');

  console.log('--- Step 6: Moving to Balcony ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setActiveRoom('balcony');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/walkthrough_balcony.png' });
  console.log('Saved screenshots/walkthrough_balcony.png');

  console.log('--- Step 7: Night Mode ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().setTimeOfDay('night');
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/night_walkthrough.png' });
  console.log('Saved screenshots/night_walkthrough.png');

  await browser.close();
  console.log('--- Full User Journey Verification Complete ---');
}

testFullJourney().catch(console.error);
