import { chromium } from 'playwright';

async function verifyModule1() {
  console.log('--- Verifying Module 1 Browser State at 1920x1080 and 390x844 ---');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1920x1080
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const desktopPage = await desktopContext.newPage();
    console.log('Navigating to http://localhost:5180 (desktop 1920x1080)...');
    await desktopPage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    try {
      await desktopPage.waitForSelector('text=Constructing 3D Architectural Scene', { state: 'detached', timeout: 25000 });
    } catch (_) {}
    await desktopPage.waitForTimeout(3000);
    await desktopPage.screenshot({ path: 'screenshots/module1_desktop_1080p.png' });
    console.log('Saved screenshots/module1_desktop_1080p.png');
    await desktopPage.close();
    await desktopContext.close();

    // 2. Mobile 390x844
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    console.log('Navigating to http://localhost:5180 (mobile 390x844)...');
    await mobilePage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    try {
      await mobilePage.waitForSelector('text=Constructing 3D Architectural Scene', { state: 'detached', timeout: 25000 });
    } catch (_) {}
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: 'screenshots/module1_mobile_390x844.png' });
    console.log('Saved screenshots/module1_mobile_390x844.png');
    await mobilePage.close();
    await mobileContext.close();

    console.log('--- Module 1 Screenshot Verification Complete ---');
  } finally {
    await browser.close();
  }
}

verifyModule1().catch((err) => {
  console.error('Module 1 verification error:', err);
  process.exit(1);
});
