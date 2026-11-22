import { chromium } from 'playwright';
import fs from 'fs';

async function extractCollisionData() {
  console.log('Extracting full collision geometry from live scene...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });

  // Wait for Three.js
  await page.waitForFunction(() => !!window.__THREE_SCENE__ && !!window.__APP_STORE__);

  // Mount walkthrough to load GLB
  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.selectFloor(12);
    store.selectFlat('flat-12-a');
    store.enterRoom('foyer');
  });

  await page.waitForFunction(() => {
    const scene = window.__THREE_SCENE__;
    let count = 0;
    scene.traverse(n => { if (n.isMesh) count++; });
    return count > 500;
  }, { timeout: 20000 });

  await page.waitForTimeout(1000);

  const collisionData = await page.evaluate(() => {
    const scene = window.__THREE_SCENE__;
    const THREE = window.THREE;

    const walls = [];
    const floors = [];
    const furnitureObstacles = [];

    scene.traverse(node => {
      if (!node.isMesh) return;
      const name = (node.name || '').toLowerCase();
      node.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(node);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Filter out tiny props or accessories
      const isSubstantial = size.x > 0.15 || size.z > 0.15;

      const item = {
        name: node.name,
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z],
        size: [size.x, size.y, size.z],
        center: [center.x, center.y, center.z]
      };

      if (name.includes('floor') || name.includes('slab') || name.includes('deck') || name.includes('travertine')) {
        floors.push(item);
      } else if (name.includes('wall') || name.includes('column') || name.includes('pillar') || name.includes('pier') || name.includes('partition')) {
        // Exclude door headers above 2.2m from floor collision
        if (box.min.y < 2.0 && isSubstantial) {
          walls.push(item);
        }
      } else if (name.includes('dining table') || name.includes('island') || name.includes('bed') || name.includes('wardrobe') || name.includes('cabinet') || name.includes('counter')) {
        if (isSubstantial && size.y > 0.4) {
          furnitureObstacles.push(item);
        }
      }
    });

    return { walls, floors, furnitureObstacles };
  });

  console.log(`Extracted: ${collisionData.walls.length} walls, ${collisionData.floors.length} floors, ${collisionData.furnitureObstacles.length} furniture obstacles`);

  fs.writeFileSync('src/features/walkthrough/collisionGeometry.json', JSON.stringify(collisionData, null, 2));
  console.log('Saved to src/features/walkthrough/collisionGeometry.json');

  await browser.close();
}

extractCollisionData().catch(err => {
  console.error(err);
  process.exit(1);
});
