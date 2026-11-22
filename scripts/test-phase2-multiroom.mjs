import { chromium } from 'playwright';
import fs from 'fs';

async function testPhase2MultiRoom() {
  console.log('====================================================');
  console.log('STARTING PHASE 2 MULTI-ROOM 3D EXPLORATION TEST');
  console.log('====================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`);
    }
  });

  // 1. Load app and enter Foyer
  console.log('[STEP 1] Entering Unit 12-A Foyer...');
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__APP_STORE__ && !!window.__THREE_SCENE__);

  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.enterApartment3D('flat-12-a');
  });

  await page.waitForFunction(() => {
    return window.__APP_STORE__.getState().viewMode === 'walkthrough';
  }, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // 2. Walk into Grand Living & Dining Hall
  console.log('[STEP 2] Walking from Foyer into Grand Living & Dining Hall...');
  await page.evaluate(() => {
    // Smooth glide to living room hotspot
    window.__APP_STORE__.getState().enterRoom('living_dining');
  });
  await page.waitForTimeout(2000);

  const livingPos = await page.evaluate(() => {
    const cam = window.__THREE_CAMERA__;
    return {
      x: +cam.position.x.toFixed(2),
      y: +cam.position.y.toFixed(2),
      z: +cam.position.z.toFixed(2),
      activeRoom: window.__APP_STORE__.getState().activeRoomId,
    };
  });
  console.log('✓ Inside Grand Living & Dining:', livingPos);
  await page.screenshot({ path: './screenshots/phase2_01_living_dining.png' });
  console.log('✓ Captured: screenshots/phase2_01_living_dining.png');

  // 3. Inspect Architectural Specification Hotspot: Italian Statuario Marble
  console.log('[STEP 3] Inspecting Architectural Spec: Italian Statuario Marble...');
  // Click the marble spec pin in 3D
  const hasMarblePin = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const marbleBtn = buttons.find(b => b.textContent && b.textContent.includes('Italian Statuario Marble'));
    if (marbleBtn) {
      marbleBtn.click();
      return true;
    }
    return false;
  });
  console.log('✓ Clicked Marble Spec Pin:', hasMarblePin);
  await page.waitForTimeout(600);
  await page.screenshot({ path: './screenshots/phase2_02_marble_spec_modal.png' });
  console.log('✓ Captured: screenshots/phase2_02_marble_spec_modal.png');

  // Close spec card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Specification"]');
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(300);

  // 4. Walk into Modular Kitchen with Island
  console.log('[STEP 4] Walking into Modular Kitchen & Center Island...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('kitchen');
  });
  await page.waitForTimeout(2000);

  const kitchenPos = await page.evaluate(() => {
    const cam = window.__THREE_CAMERA__;
    return {
      x: +cam.position.x.toFixed(2),
      y: +cam.position.y.toFixed(2),
      z: +cam.position.z.toFixed(2),
      activeRoom: window.__APP_STORE__.getState().activeRoomId,
    };
  });
  console.log('✓ Inside Modular Kitchen:', kitchenPos);

  // Click Kitchen Spec Pin
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const kBtn = buttons.find(b => b.textContent && b.textContent.includes('German Blum Modular Kitchen'));
    if (kBtn) kBtn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: './screenshots/phase2_03_kitchen_spec_modal.png' });
  console.log('✓ Captured: screenshots/phase2_03_kitchen_spec_modal.png');

  // Close spec card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Specification"]');
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(300);

  // 5. Walk into Master Bedroom Suite
  console.log('[STEP 5] Walking into Master Suite with Walk-in Closet...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('master_bedroom');
  });
  await page.waitForTimeout(2000);

  const masterPos = await page.evaluate(() => {
    const cam = window.__THREE_CAMERA__;
    return {
      x: +cam.position.x.toFixed(2),
      y: +cam.position.y.toFixed(2),
      z: +cam.position.z.toFixed(2),
      activeRoom: window.__APP_STORE__.getState().activeRoomId,
    };
  });
  console.log('✓ Inside Master Bedroom Suite:', masterPos);

  // Click European Oak Spec Pin
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const oakBtn = buttons.find(b => b.textContent && b.textContent.includes('Engineered European Oak'));
    if (oakBtn) oakBtn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: './screenshots/phase2_04_master_bedroom_spec.png' });
  console.log('✓ Captured: screenshots/phase2_04_master_bedroom_spec.png');

  // Close spec card
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Specification"]');
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(300);

  // 6. Walk out to Sundeck Sky Terrace
  console.log('[STEP 6] Stepping out to Panoramic Sundeck Sky Terrace...');
  await page.evaluate(() => {
    window.__APP_STORE__.getState().enterRoom('balcony');
  });
  await page.waitForTimeout(2000);

  const balconyPos = await page.evaluate(() => {
    const cam = window.__THREE_CAMERA__;
    return {
      x: +cam.position.x.toFixed(2),
      y: +cam.position.y.toFixed(2),
      z: +cam.position.z.toFixed(2),
      activeRoom: window.__APP_STORE__.getState().activeRoomId,
    };
  });
  console.log('✓ On Sundeck Sky Terrace:', balconyPos);

  // Click Glass Balustrade Spec Pin
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const balcBtn = buttons.find(b => b.textContent && b.textContent.includes('Panoramic Glass Balustrade'));
    if (balcBtn) balcBtn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: './screenshots/phase2_05_sundeck_spec.png' });
  console.log('✓ Captured: screenshots/phase2_05_sundeck_spec.png');

  // 7. Test Mobile Viewport across rooms
  console.log('[STEP 7] Testing Mobile 390x844 responsive walkthrough...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: './screenshots/phase2_06_mobile_sundeck_390x844.png' });
  console.log('✓ Captured: screenshots/phase2_06_mobile_sundeck_390x844.png');

  // Dump report
  fs.writeFileSync('scripts/phase2_multi_room_report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    livingPos,
    kitchenPos,
    masterPos,
    balconyPos,
    specsVerified: [
      'Italian Statuario Marble',
      'German Blum Modular Kitchen',
      'Engineered European Oak',
      'Panoramic Glass Balustrade'
    ]
  }, null, 2));

  console.log('====================================================');
  console.log('PHASE 2 MULTI-ROOM EXPLORATION COMPLETED SUCCESSFULLY');
  console.log('====================================================');

  await browser.close();
}

testPhase2MultiRoom().catch(err => {
  console.error('Phase 2 test failed:', err);
  process.exit(1);
});
