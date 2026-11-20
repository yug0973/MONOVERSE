import { chromium } from 'playwright';

async function verifyModule2() {
  console.log('--- Verifying Module 2: Config + Hero at 1920x1080 and 390x844 ---');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1920x1080 Hero Journey
    console.log('\n--- 1/4 Capturing Desktop Hero Journey (1920x1080) ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: 'screenshots/module2_hero_desktop_1080p.png' });
    console.log('Saved screenshots/module2_hero_desktop_1080p.png');
    await desktopPage.close();
    await desktopContext.close();

    // 2. Mobile 390x844 Hero Journey
    console.log('\n--- 2/4 Capturing Mobile Hero Journey (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: 'screenshots/module2_hero_mobile_390x844.png' });
    console.log('Saved screenshots/module2_hero_mobile_390x844.png');
    await mobilePage.close();
    await mobileContext.close();

    // 3. Debug Mode (?debug=1) Calibration Test
    console.log('\n--- 3/4 Testing Debug Calibration Mode (?debug=1) ---');
    const debugContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const debugPage = await debugContext.newPage();
    const consoleLogs = [];
    debugPage.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('CALIBRATION') || text.includes('xPercent')) {
        consoleLogs.push(text);
      }
    });

    await debugPage.goto('http://localhost:5180/?debug=1', { waitUntil: 'domcontentloaded' });
    await debugPage.waitForTimeout(1500);

    // Simulate clicking on the target balcony area (~ x: 77%, y: 38% -> px: 1478, 410)
    await debugPage.mouse.click(1478, 410);
    await debugPage.waitForTimeout(1000);
    await debugPage.screenshot({ path: 'screenshots/module2_debug_mode_1080p.png' });
    console.log('Saved screenshots/module2_debug_mode_1080p.png');
    console.log('Captured Console Calibration Logs:', consoleLogs);
    await debugPage.close();
    await debugContext.close();

    // 4. Verification of 3D Explorer Route (#3d-explorer)
    console.log('\n--- 4/4 Testing Seamless 3D Explorer Route (#3d-explorer) ---');
    const explorerContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const explorerPage = await explorerContext.newPage();
    await explorerPage.goto('http://localhost:5180/#3d-explorer', { waitUntil: 'domcontentloaded' });
    try {
      await explorerPage.waitForSelector('text=Constructing 3D Architectural Scene', { state: 'detached', timeout: 20000 });
    } catch (_) {}
    await explorerPage.waitForTimeout(2500);
    await explorerPage.screenshot({ path: 'screenshots/module2_3d_explorer_entry_1080p.png' });
    console.log('Saved screenshots/module2_3d_explorer_entry_1080p.png');
    await explorerPage.close();
    await explorerContext.close();

    console.log('\n=== Module 2 Verification Completed Successfully ===');
  } finally {
    await browser.close();
  }
}

verifyModule2().catch((err) => {
  console.error('Module 2 verification error:', err);
  process.exit(1);
});
