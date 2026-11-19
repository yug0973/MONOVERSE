import { chromium } from 'playwright';

async function captureAllAcceptance() {
  console.log('--- Executing Playwright 1080p Acceptance Capture Suite ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  try {
    console.log('Navigating to http://localhost:5180...');
    await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);

    // Safe interaction zone: x: 700..1200, y: 200..450 (clear of all UI docks & HUD)
    // 1. Angle 1: Front-Right 45° (Default Orbit)
    console.log('\n--- 1/5 Capturing Angle 1: Front-Right 45° ---');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/acceptance_angle1_front_right.png' });
    await page.screenshot({ path: 'screenshots/acceptance_1080p_tower_orbit.png' });
    console.log('Saved Angle 1!');

    // 2. Angle 2: Front-Left 45° (South-West Orbit)
    console.log('\n--- 2/5 Capturing Angle 2: Front-Left 45° ---');
    await page.mouse.move(750, 300);
    await page.mouse.down();
    await page.mouse.move(1150, 300);
    await page.mouse.up();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/acceptance_angle2_front_left.png' });
    console.log('Saved Angle 2!');

    // 3. Angle 3: Hero Low-Angle Pedestrian Arrival
    console.log('\n--- 3/5 Capturing Angle 3: Hero Entrance View ---');
    await page.mouse.move(950, 240);
    await page.mouse.down();
    await page.mouse.move(950, 430);
    await page.mouse.up();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/acceptance_angle3_hero_entrance.png' });
    console.log('Saved Angle 3!');

    // 4. Night Mode: Tower Orbit Architecture
    console.log('\n--- 4/5 Capturing Night Mode Architecture ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setTimeOfDay('night');
    });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: 'screenshots/acceptance_1080p_night_mode.png' });
    console.log('Saved Night Mode!');

    // 5. Floor Slice Mode (Level 9 Sliced View with solid cut cap & ghosted massing)
    console.log('\n--- 5/5 Capturing Floor Slice View ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setTimeOfDay('golden_hour');
      window.__APP_STORE__.getState().selectFloor(9);
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'screenshots/acceptance_1080p_floor_slice.png' });
    console.log('Saved Floor Slice Mode!');

    console.log('\n=== All Acceptance Screenshots Captured Successfully ===');
  } finally {
    await browser.close();
  }
}

captureAllAcceptance().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
