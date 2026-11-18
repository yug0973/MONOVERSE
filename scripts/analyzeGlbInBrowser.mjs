import { chromium } from 'playwright';

async function analyze() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5180');
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    // Dynamic import Three.js GLTFLoader from jsm
    const THREE = window.__THREE__ || (await import('three'));
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();

    function loadModel(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    console.log('Loading Waterfront_18F_optimized.glb...');
    const bldgGltf = await loadModel('/models/Waterfront_18F_optimized.glb');
    const bldgBox = new THREE.Box3().setFromObject(bldgGltf.scene);
    const bldgSize = new THREE.Vector3();
    const bldgCenter = new THREE.Vector3();
    bldgBox.getSize(bldgSize);
    bldgBox.getCenter(bldgCenter);

    // List top-level children of building
    const bldgChildren = [];
    bldgGltf.scene.children.forEach(c => {
      const box = new THREE.Box3().setFromObject(c);
      const sz = new THREE.Vector3();
      const ct = new THREE.Vector3();
      box.getSize(sz);
      box.getCenter(ct);
      bldgChildren.push({
        name: c.name,
        type: c.type,
        childrenCount: c.children.length,
        size: { x: sz.x.toFixed(2), y: sz.y.toFixed(2), z: sz.z.toFixed(2) },
        center: { x: ct.x.toFixed(2), y: ct.y.toFixed(2), z: ct.z.toFixed(2) },
      });
    });

    console.log('Loading Interior_asset_optimized.glb...');
    const intGltf = await loadModel('/models/Interior_asset_optimized.glb');
    const intBox = new THREE.Box3().setFromObject(intGltf.scene);
    const intSize = new THREE.Vector3();
    const intCenter = new THREE.Vector3();
    intBox.getSize(intSize);
    intBox.getCenter(intCenter);

    const intChildren = [];
    intGltf.scene.children.slice(0, 35).forEach(c => {
      const box = new THREE.Box3().setFromObject(c);
      const sz = new THREE.Vector3();
      const ct = new THREE.Vector3();
      box.getSize(sz);
      box.getCenter(ct);
      intChildren.push({
        name: c.name,
        type: c.type,
        childrenCount: c.children.length,
        size: { x: sz.x.toFixed(2), y: sz.y.toFixed(2), z: sz.z.toFixed(2) },
        center: { x: ct.x.toFixed(2), y: ct.y.toFixed(2), z: ct.z.toFixed(2) },
      });
    });

    return {
      building: {
        boxMin: { x: bldgBox.min.x.toFixed(2), y: bldgBox.min.y.toFixed(2), z: bldgBox.min.z.toFixed(2) },
        boxMax: { x: bldgBox.max.x.toFixed(2), y: bldgBox.max.y.toFixed(2), z: bldgBox.max.z.toFixed(2) },
        size: { x: bldgSize.x.toFixed(2), y: bldgSize.y.toFixed(2), z: bldgSize.z.toFixed(2) },
        center: { x: bldgCenter.x.toFixed(2), y: bldgCenter.y.toFixed(2), z: bldgCenter.z.toFixed(2) },
        childrenCount: bldgGltf.scene.children.length,
        topChildren: bldgChildren.slice(0, 20),
      },
      interior: {
        boxMin: { x: intBox.min.x.toFixed(2), y: intBox.min.y.toFixed(2), z: intBox.min.z.toFixed(2) },
        boxMax: { x: intBox.max.x.toFixed(2), y: intBox.max.y.toFixed(2), z: intBox.max.z.toFixed(2) },
        size: { x: intSize.x.toFixed(2), y: intSize.y.toFixed(2), z: intSize.z.toFixed(2) },
        center: { x: intCenter.x.toFixed(2), y: intCenter.y.toFixed(2), z: intCenter.z.toFixed(2) },
        childrenCount: intGltf.scene.children.length,
        topChildren: intChildren,
      }
    };
  });

  console.log('--- Building Analysis ---');
  console.log(JSON.stringify(result.building, null, 2));

  console.log('\n--- Interior Analysis ---');
  console.log(JSON.stringify(result.interior, null, 2));

  await browser.close();
}

analyze().catch(console.error);
