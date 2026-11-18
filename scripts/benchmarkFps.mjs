import { chromium } from 'playwright';

async function measureFps() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11']
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  console.log('Navigating to http://localhost:5180...');
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Helper to measure FPS for 2 seconds
  async function sampleFps(label) {
    const fps = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        function loop() {
          frames++;
          if (performance.now() - start >= 2000) {
            const duration = (performance.now() - start) / 1000;
            resolve(Math.round(frames / duration));
          } else {
            requestAnimationFrame(loop);
          }
        }
        requestAnimationFrame(loop);
      });
    });
    console.log(`[FPS] ${label}: ${fps} fps`);
    return fps;
  }

  // 1. Landing / Building view
  await sampleFps('Building View (Default)');

  // 2. Click Floor 9
  const floorBtn = page.locator('button', { hasText: 'Floor 9' }).first();
  if (await floorBtn.count() > 0) {
    await floorBtn.click();
    await page.waitForTimeout(1500);
    await sampleFps('Floor Slice View');
  }

  // 3. Click Dollhouse View
  const dollhouseBtn = page.locator('button', { hasText: 'Dollhouse' }).first();
  if (await dollhouseBtn.count() > 0) {
    await dollhouseBtn.click();
    await page.waitForTimeout(2000);
    await sampleFps('Dollhouse Cutaway View');
  }

  // 4. Click Walkthrough button
  const walkthroughBtn = page.locator('button', { hasText: 'Walkthrough' }).first();
  if (await walkthroughBtn.count() > 0) {
    await walkthroughBtn.click();
    await page.waitForTimeout(2000);
    await sampleFps('Walkthrough - Default Room');

    // Test each room tab
    const roomButtons = ['Living & Dining', 'Master Bedroom', 'Balcony & Terrace', 'Open Kitchen'];
    for (const name of roomButtons) {
      const btn = page.locator('button', { hasText: name }).first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1500);
        await sampleFps(`Walkthrough - ${name}`);
      }
    }
  }

  await browser.close();
}

measureFps().catch(console.error);
