import { chromium } from 'playwright';

async function testBuildingFps() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-accelerated-2d-canvas'
    ]
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  
  console.log('Connecting to http://localhost:5180...');
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Take screenshot of building view to verify visuals
  await page.screenshot({ path: 'screenshots/building_view_optimized.png' });
  console.log('Saved screenshots/building_view_optimized.png');

  // Measure static FPS
  const staticFps = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let count = 0;
      const start = performance.now();
      function f() {
        count++;
        if (performance.now() - start >= 2000) {
          resolve(Math.round(count / ((performance.now() - start) / 1000)));
        } else {
          requestAnimationFrame(f);
        }
      }
      requestAnimationFrame(f);
    });
  });
  console.log(`Building Static FPS: ${staticFps}`);

  // Measure dragging / orbiting FPS
  console.log('Simulating mouse orbit drag...');
  const orbitFpsPromise = page.evaluate(async () => {
    return new Promise((resolve) => {
      let count = 0;
      const start = performance.now();
      function f() {
        count++;
        if (performance.now() - start >= 2500) {
          resolve(Math.round(count / ((performance.now() - start) / 1000)));
        } else {
          requestAnimationFrame(f);
        }
      }
      requestAnimationFrame(f);
    });
  });

  await page.mouse.move(680, 380);
  await page.mouse.down();
  for (let i = 0; i < 30; i++) {
    await page.mouse.move(680 + i * 10, 380 - i * 2);
    await page.waitForTimeout(40);
  }
  await page.mouse.up();

  const orbitFps = await orbitFpsPromise;
  console.log(`Building Orbit Drag FPS: ${orbitFps}`);

  // Test floor slice transition
  console.log('Testing Floor 9 slice...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(9);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/floor9_slice_optimized.png' });
  console.log('Saved screenshots/floor9_slice_optimized.png');

  await browser.close();
  console.log('Done.');
}

testBuildingFps().catch(console.error);
