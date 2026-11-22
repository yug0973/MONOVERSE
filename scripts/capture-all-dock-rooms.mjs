import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(12);
    window.__APP_STORE__.getState().enterApartment3D('flat-12-a');
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'scripts/shot_01_foyer.png' });

  const buttons = ['Living & Dining', 'Sky Deck', 'Kitchen', 'Master Suite', 'Junior Suite', 'Family Lounge'];
  for (const name of buttons) {
    console.log('Clicking', name);
    const btn = page.locator(`button:has-text("${name}")`).first();
    await btn.click();
    await page.waitForTimeout(2000);
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    await page.screenshot({ path: `scripts/shot_${cleanName}.png` });
  }

  await browser.close();
  console.log('DONE CAPTURING ALL ROOMS');
}

main().catch(console.error);
