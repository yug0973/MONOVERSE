import { chromium } from 'playwright';

async function captureThreeAngles() {
  console.log('--- Launching Playwright 1080p 3-Angle Tower Orbit Inspection ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  try {
    console.log('Navigating to http://localhost:5180...');
    await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    // ==========================================
    // Angle 1: Front-Right 45° (South-East Orbit)
    // ==========================================
    console.log('\n--- Capturing Angle 1: Front-Right 45° (South-East) ---');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/acceptance_angle1_front_right.png' });
    await page.screenshot({ path: 'screenshots/acceptance_1080p_tower_orbit.png' });
    console.log('Saved screenshots/acceptance_angle1_front_right.png');

    // ==========================================
    // Angle 2: Front-Left 45° (South-West Orbit)
    // Drag camera smoothly across canvas
    // ==========================================
    console.log('\n--- Capturing Angle 2: Front-Left 45° (South-West) ---');
    await page.mouse.move(800, 500);
    await page.mouse.down();
    await page.mouse.move(1350, 480, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/acceptance_angle2_front_left.png' });
    console.log('Saved screenshots/acceptance_angle2_front_left.png');

    // ==========================================
    // Angle 3: Hero Low-Angle Pedestrian Arrival
    // Orbit and zoom closer toward lobby entrance canopy
    // ==========================================
    console.log('\n--- Capturing Angle 3: Hero Low-Angle Pedestrian Entrance ---');
    await page.mouse.move(960, 400);
    await page.mouse.down();
    await page.mouse.move(960, 720, { steps: 15 });
    await page.mouse.up();
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/acceptance_angle3_hero_entrance.png' });
    console.log('Saved screenshots/acceptance_angle3_hero_entrance.png');

    // ==========================================
    // Night Mode Tower Orbit
    // ==========================================
    console.log('\n--- Capturing Night Mode Architecture ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setTimeOfDay('night');
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/acceptance_1080p_night_mode.png' });
    console.log('Saved screenshots/acceptance_1080p_night_mode.png');

    // ==========================================
    // Floor Slice Mode (Level 9 Sliced View)
    // ==========================================
    console.log('\n--- Capturing Floor Slice View ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().setTimeOfDay('golden_hour');
      window.__APP_STORE__.getState().selectFloor(9);
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'screenshots/acceptance_1080p_floor_slice.png' });
    console.log('Saved screenshots/acceptance_1080p_floor_slice.png');

    console.log('\n--- 3-Angle Acceptance Benchmark Complete ---');
  } finally {
    await browser.close();
  }
}

captureThreeAngles().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
