import { chromium } from 'playwright';

async function runBenchmark() {
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
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  console.log('--- Connecting to http://localhost:5180 ---');
  await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // FPS measurement helper over 1.5 seconds with optional drag simulation
  async function measureInteractiveFps(label, dragAction = null) {
    if (dragAction) {
      await dragAction();
    }
    const fps = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let count = 0;
        const start = performance.now();
        function frame() {
          count++;
          if (performance.now() - start >= 1500) {
            resolve(Math.round(count / ((performance.now() - start) / 1000)));
          } else {
            requestAnimationFrame(frame);
          }
        }
        requestAnimationFrame(frame);
      });
    });
    console.log(`[BENCHMARK] ${label.padEnd(35)}: ${fps} FPS`);
    return fps;
  }

  // 1. Building View
  await measureInteractiveFps('1. Building Exterior View');

  // Simulate mouse drag orbit in Building view
  await measureInteractiveFps('1b. Building Orbiting (Mouse Drag)', async () => {
    await page.mouse.move(680, 400);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(680 + i * 15, 400 - i * 3);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
  });

  // 2. Select Floor 9
  console.log('\n--- Switching to Floor Slice View ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFloor(9);
  });
  await page.waitForTimeout(1500);
  await measureInteractiveFps('2. Floor Slice View');

  // 3. Select Flat 9A -> Dollhouse Cutaway
  console.log('\n--- Switching to Dollhouse Cutaway View ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().selectFlat('flat-9-a');
  });
  await page.waitForTimeout(2000);
  await measureInteractiveFps('3. Dollhouse Cutaway View');

  // Simulate mouse drag orbit in Dollhouse view
  await measureInteractiveFps('3b. Dollhouse Orbiting (Mouse Drag)', async () => {
    await page.mouse.move(680, 400);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(680 + i * 12, 400 - i * 2);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
  });

  // Test Customizer swaps latency
  console.log('\n--- Customizer Swap Latency ---');
  const paletteLatency = await page.evaluate(() => {
    const t0 = performance.now();
    window.__APP_STORE__.getState().setGlobalWallColor('terracotta');
    const t1 = performance.now();
    return Math.round((t1 - t0) * 100) / 100;
  });
  console.log(`Wall Color Palette Swap Latency: ${paletteLatency} ms`);

  const flooringLatency = await page.evaluate(() => {
    const t0 = performance.now();
    window.__APP_STORE__.getState().setFlooring('warm_oak');
    const t1 = performance.now();
    return Math.round((t1 - t0) * 100) / 100;
  });
  console.log(`Flooring Swap Latency: ${flooringLatency} ms`);

  const pkgLatency = await page.evaluate(() => {
    const t0 = performance.now();
    window.__APP_STORE__.getState().setFurniturePackage('essential');
    const t1 = performance.now();
    return Math.round((t1 - t0) * 100) / 100;
  });
  console.log(`Furniture Package Swap Latency: ${pkgLatency} ms`);

  // 4. Walkthrough Mode
  console.log('\n--- Switching to First-Person Walkthrough ---');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterWalkthrough('living_dining');
  });
  await page.waitForTimeout(2000);
  await measureInteractiveFps('4. Walkthrough (Living & Dining)');

  // Walkthrough mouse drag look-around
  await measureInteractiveFps('4b. Walkthrough Drag Look-Around', async () => {
    await page.mouse.move(680, 400);
    await page.mouse.down();
    for (let i = 0; i < 15; i++) {
      await page.mouse.move(680 - i * 14, 400 + i * 2);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
  });

  // Test room glide hotspots
  const rooms = [
    { id: 'master_bedroom', name: 'Master Bedroom' },
    { id: 'kitchen', name: 'Modular Kitchen' },
    { id: 'balcony', name: 'Garden Balcony' }
  ];

  for (const r of rooms) {
    await page.evaluate((roomId) => {
      window.__APP_STORE__.getState().setActiveRoom(roomId);
    }, r.id);
    await page.waitForTimeout(1500);
    await measureInteractiveFps(`5. Walkthrough (${r.name})`);
  }

  // Take verification screenshot of Master Bedroom walkthrough
  await page.screenshot({ path: 'screenshots/benchmark_master_bedroom.png' });
  console.log('\nSaved verification screenshot: screenshots/benchmark_master_bedroom.png');

  await browser.close();
  console.log('\n--- All benchmarks completed! ---');
}

runBenchmark().catch(console.error);
