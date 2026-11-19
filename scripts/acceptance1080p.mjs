import { chromium } from 'playwright';

async function runAcceptance() {
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

  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    page.on('console', msg => {
      if (msg.type() === 'error') console.log('[BROWSER ERROR]:', msg.text());
    });

    console.log('--- Step 1: Navigating to http://localhost:5180 at 1920x1080 ---');
    await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Helper to sample FPS and WebGL draw calls
    async function sampleMetrics(label) {
      const metrics = await page.evaluate(async () => {
        return new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();
          function loop() {
            frames++;
            if (performance.now() - start >= 1500) {
              const dur = (performance.now() - start) / 1000;
              const fps = Math.round(frames / dur);
              const info = window.__THREE_RENDERER__?.info?.render;
              resolve({
                fps,
                calls: info?.calls || 0,
                triangles: info?.triangles || 0,
              });
            } else {
              requestAnimationFrame(loop);
            }
          }
          requestAnimationFrame(loop);
        });
      });
      console.log(`[PERF] ${label.padEnd(35)}: ${metrics.fps} FPS | ${metrics.calls} draw calls | ${metrics.triangles.toLocaleString()} tris`);
      return metrics;
    }

    // 1. Tower Orbit View (Golden Hour)
    console.log('\n--- Capturing Tower Orbit View (1920x1080) ---');
    await sampleMetrics('Tower Orbit (Static)');
    
    // Simulate gentle orbit drag
    await page.mouse.move(960, 540);
    await page.mouse.down();
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(960 + i * 15, 540 - i * 2);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'screenshots/acceptance_1080p_tower_orbit.png' });
    console.log('Saved screenshots/acceptance_1080p_tower_orbit.png');

    // 2. Floor Slice View (Floor 9)
    console.log('\n--- Capturing Floor Slice View (1920x1080) ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().selectFloor(9);
    });
    await page.waitForTimeout(2000);
    await sampleMetrics('Floor Slice (Floor 9)');
    await page.screenshot({ path: 'screenshots/acceptance_1080p_floor_slice.png' });
    console.log('Saved screenshots/acceptance_1080p_floor_slice.png');

    // 3. Unit View (Dollhouse Cutaway - Flat 9A)
    console.log('\n--- Capturing Unit View / Dollhouse Cutaway (1920x1080) ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().selectFlat('flat-9-a');
    });
    await page.waitForTimeout(2500);
    await sampleMetrics('Dollhouse Cutaway (Flat 9A)');
    await page.screenshot({ path: 'screenshots/acceptance_1080p_dollhouse.png' });
    console.log('Saved screenshots/acceptance_1080p_dollhouse.png');

    // 4. Unit Walkthrough (Master Bedroom)
    console.log('\n--- Capturing Unit Walkthrough View (1920x1080) ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().enterRoom('master_bedroom');
    });
    await page.waitForTimeout(2500);
    await sampleMetrics('Unit Walkthrough (Master Bedroom)');
    await page.screenshot({ path: 'screenshots/acceptance_1080p_unit_walkthrough.png' });
    console.log('Saved screenshots/acceptance_1080p_unit_walkthrough.png');

    // 5. Night Mode (Tower Exterior)
    console.log('\n--- Capturing Night Mode Architecture (1920x1080) ---');
    await page.evaluate(() => {
      window.__APP_STORE__.getState().exitToLanding();
      window.__APP_STORE__.getState().setTimeOfDay('night');
    });
    await page.waitForTimeout(3000);
    await sampleMetrics('Night Mode Tower Orbit');
    await page.screenshot({ path: 'screenshots/acceptance_1080p_night_mode.png' });
    console.log('Saved screenshots/acceptance_1080p_night_mode.png');

    console.log('\n--- Acceptance Test Run Completed Successfully ---');
  } finally {
    await browser.close();
  }
}

runAcceptance().catch((err) => {
  console.error('Fatal error during acceptance test:', err);
  process.exit(1);
});
