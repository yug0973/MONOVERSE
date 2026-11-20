import { chromium } from 'playwright';

async function verifyModule3() {
  console.log('--- Verifying Module 3: Zoom Transition Suite (1920x1080 and 390x844) ---');
  const browser = await chromium.launch({ headless: true });

  try {
    // ========================================================
    // 1. Desktop 1920x1080 Zoom Transition Progression
    // ========================================================
    console.log('\n--- 1/4 Capturing Desktop Zoom Transition Progression ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1500);

    // Trigger Explore CTA
    console.log('Clicking "Explore the residences" CTA button...');
    await desktopPage.click('button:has-text("Explore the residences")');

    // Capture Mid-Hero Zoom (~700ms into the 1.4s zoom)
    await desktopPage.waitForTimeout(700);
    await desktopPage.screenshot({ path: 'screenshots/module3_desktop_mid_zoom_1080p.png' });
    console.log('Saved screenshots/module3_desktop_mid_zoom_1080p.png');

    // Capture Flat Closeup Phase (~1600ms, closeup crossfade)
    await desktopPage.waitForTimeout(900);
    await desktopPage.screenshot({ path: 'screenshots/module3_desktop_closeup_1080p.png' });
    console.log('Saved screenshots/module3_desktop_closeup_1080p.png');

    // Capture Interior Stage (~2600ms)
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: 'screenshots/module3_desktop_interior_arrival_1080p.png' });
    console.log('Saved screenshots/module3_desktop_interior_arrival_1080p.png');

    // Test Reverse Back Control
    console.log('Testing reverse journey back control...');
    await desktopPage.click('button:has-text("Exterior View")');
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: 'screenshots/module3_desktop_reversed_1080p.png' });
    console.log('Saved screenshots/module3_desktop_reversed_1080p.png');

    await desktopPage.close();
    await desktopContext.close();

    // ========================================================
    // 2. Mobile 390x844 Zoom Experience
    // ========================================================
    console.log('\n--- 2/4 Capturing Mobile 390x844 Zoom Experience ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1500);

    await mobilePage.click('button:has-text("Explore the residences")');
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: 'screenshots/module3_mobile_mid_zoom_390x844.png' });
    console.log('Saved screenshots/module3_mobile_mid_zoom_390x844.png');

    await mobilePage.waitForTimeout(1800);
    await mobilePage.screenshot({ path: 'screenshots/module3_mobile_interior_390x844.png' });
    console.log('Saved screenshots/module3_mobile_interior_390x844.png');

    await mobilePage.close();
    await mobileContext.close();

    // ========================================================
    // 3. Prefers-Reduced-Motion Plain Crossfade Test
    // ========================================================
    console.log('\n--- 3/4 Testing prefers-reduced-motion Compliance ---');
    const reducedMotionContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      reducedMotion: 'reduce',
    });
    const rmPage = await reducedMotionContext.newPage();
    await rmPage.goto('http://localhost:5180', { waitUntil: 'domcontentloaded' });
    await rmPage.waitForTimeout(1500);

    await rmPage.click('button:has-text("Explore the residences")');
    await rmPage.waitForTimeout(800);
    await rmPage.screenshot({ path: 'screenshots/module3_reduced_motion_crossfade_1080p.png' });
    console.log('Saved screenshots/module3_reduced_motion_crossfade_1080p.png');

    await rmPage.close();
    await reducedMotionContext.close();

    console.log('\n=== Module 3 Verification Suite Completed Successfully ===');
  } finally {
    await browser.close();
  }
}

verifyModule3().catch((err) => {
  console.error('Module 3 verification error:', err);
  process.exit(1);
});
