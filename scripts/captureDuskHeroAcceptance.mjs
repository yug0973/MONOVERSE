import { chromium } from 'playwright';

async function captureDuskHeroAcceptance() {
  console.log('--- Launching Playwright 1080p Dusk Cinematic Acceptance Suite ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  try {
    console.log('Navigating to http://localhost:5180...');
    await page.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });

    console.log('Waiting for 3D shaders and assets to compile and loader to dismiss...');
    try {
      await page.waitForSelector('text=Constructing 3D Architectural Scene', { state: 'detached', timeout: 30000 });
    } catch (_) {
      console.log('Loader dismiss wait finished.');
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3500);

    // 1. Hero Landing View (Requirement 7 & 8: lower wider angle, tower in right third, left gradient scrim, glowing windows)
    console.log('\n--- 1/3 Capturing Hero Landing View (1920x1080) ---');
    await page.screenshot({ path: 'screenshots/dusk_hero_landing_1080p.png', timeout: 15000 });
    console.log('Saved screenshots/dusk_hero_landing_1080p.png');

    // 2. Tower Orbit View (Explore Mode)
    console.log('\n--- 2/3 Capturing Tower Orbit View in Building Mode ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setViewMode('building');
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/dusk_tower_orbit_1080p.png', timeout: 15000 });
    console.log('Saved screenshots/dusk_tower_orbit_1080p.png');

    // 3. Night Mode Tower View (Full Night Illumination)
    console.log('\n--- 3/3 Capturing Full Night Illumination View ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setTimeOfDay('night');
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/dusk_night_mode_1080p.png', timeout: 15000 });
    console.log('Saved screenshots/dusk_night_mode_1080p.png');

    console.log('\n=== Dusk Cinematic Acceptance Suite Completed ===');
  } finally {
    await browser.close();
  }
}

captureDuskHeroAcceptance().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
