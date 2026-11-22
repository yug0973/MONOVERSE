import { chromium } from 'playwright';
import fs from 'fs';

async function verifyInteriorGLB() {
  console.log('Launching Playwright with WebGL acceleration...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Listen for console logs & errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`);
    }
  });

  const startTime = Date.now();
  console.log('Navigating to http://localhost:5180/...');
  await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
  const initialLoadTime = Date.now() - startTime;
  console.log(`Initial load time: ${initialLoadTime}ms`);

  // Wait for Three.js scene to be initialized
  await page.waitForFunction(() => !!window.__THREE_SCENE__ && !!window.__THREE_RENDERER__, { timeout: 15000 });

  // Switch to walkthrough mode
  console.log('Triggering walkthrough mode to mount Interior GLB...');
  const glbStartTime = Date.now();
  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.selectFloor(12);
    store.selectFlat('flat-12-a');
    store.enterRoom('foyer');
  });

  // Wait for GLB to load and populate inside scene
  await page.waitForFunction(() => {
    const scene = window.__THREE_SCENE__;
    let foundMesh = false;
    scene.traverse(node => {
      if (node.isMesh && (node.name.toLowerCase().includes('wall') || node.name.toLowerCase().includes('floor') || node.name.toLowerCase().includes('sofa'))) {
        foundMesh = true;
      }
    });
    return foundMesh;
  }, { timeout: 20000 });
  const glbLoadDuration = Date.now() - glbStartTime;
  console.log(`GLB mounted & rendered in: ${glbLoadDuration}ms`);

  // Allow one second for settle & textures
  await page.waitForTimeout(1500);

  // Deep Diagnostic Query on Live Three.js Scene Graph
  const diagnosticData = await page.evaluate(() => {
    const scene = window.__THREE_SCENE__;
    const renderer = window.__THREE_RENDERER__;
    const camera = window.__THREE_CAMERA__;

    const meshes = [];
    const materialsMap = new Map();
    const texturesSet = new Set();

    let totalTriangles = 0;
    let totalVertices = 0;
    let meshCount = 0;

    // Overall model bounding box
    const modelBox = new THREE.Box3();
    let hasModelBox = false;

    // Categories
    const structuralWalls = [];
    const floors = [];
    const ceilings = [];
    const doors = [];
    const windows = [];
    const furniture = [];
    const decor = [];
    const other = [];

    // Traverse all meshes
    scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        const geo = child.geometry;
        const name = child.name || '';
        const lowerName = name.toLowerCase();

        // Count triangles
        let tris = 0;
        let verts = 0;
        if (geo) {
          verts = geo.attributes.position ? geo.attributes.position.count : 0;
          if (geo.index) {
            tris = geo.index.count / 3;
          } else {
            tris = verts / 3;
          }
        }
        totalTriangles += tris;
        totalVertices += verts;

        // Compute world bounding box
        child.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Materials & Textures
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        const matNames = [];
        for (const m of mats) {
          if (m) {
            if (!materialsMap.has(m.uuid)) {
              materialsMap.set(m.uuid, {
                name: m.name || 'UnnamedMaterial',
                type: m.type,
                color: m.color ? m.color.getHexString() : null,
                roughness: m.roughness !== undefined ? m.roughness : null,
                metalness: m.metalness !== undefined ? m.metalness : null,
                hasMap: !!m.map,
                hasNormalMap: !!m.normalMap,
                hasRoughnessMap: !!m.roughnessMap,
                hasMetalnessMap: !!m.metalnessMap,
                transparent: m.transparent,
                opacity: m.opacity
              });
            }
            matNames.push(m.name || 'UnnamedMaterial');

            if (m.map) texturesSet.add(m.map.uuid);
            if (m.normalMap) texturesSet.add(m.normalMap.uuid);
            if (m.roughnessMap) texturesSet.add(m.roughnessMap.uuid);
            if (m.metalnessMap) texturesSet.add(m.metalnessMap.uuid);
          }
        }

        const meshInfo = {
          name,
          parent: child.parent ? child.parent.name : null,
          triangles: tris,
          vertices: verts,
          materials: matNames,
          box: {
            min: [box.min.x, box.min.y, box.min.z],
            max: [box.max.x, box.max.y, box.max.z],
            size: [size.x, size.y, size.z],
            center: [center.x, center.y, center.z]
          }
        };

        // Expand overall model box if part of interior
        if (lowerName.includes('wall') || lowerName.includes('floor') || lowerName.includes('ceiling') || lowerName.includes('sofa') || lowerName.includes('bed') || lowerName.includes('table') || lowerName.includes('door') || lowerName.includes('kitchen') || lowerName.includes('cabinet') || lowerName.includes('column')) {
          if (!hasModelBox) {
            modelBox.copy(box);
            hasModelBox = true;
          } else {
            modelBox.union(box);
          }
        }

        // Categorize
        if (lowerName.includes('wall') || lowerName.includes('column') || lowerName.includes('pillar') || lowerName.includes('partition')) {
          structuralWalls.push(meshInfo);
        } else if (lowerName.includes('floor') || lowerName.includes('slab') || lowerName.includes('deck') || lowerName.includes('travertine')) {
          floors.push(meshInfo);
        } else if (lowerName.includes('ceiling') || lowerName.includes('fascia') || lowerName.includes('roof')) {
          ceilings.push(meshInfo);
        } else if (lowerName.includes('door') || lowerName.includes('entry') || lowerName.includes('portal') || lowerName.includes('frame')) {
          doors.push(meshInfo);
        } else if (lowerName.includes('window') || lowerName.includes('glass') || lowerName.includes('railing')) {
          windows.push(meshInfo);
        } else if (lowerName.includes('sofa') || lowerName.includes('bed') || lowerName.includes('table') || lowerName.includes('chair') || lowerName.includes('wardrobe') || lowerName.includes('island') || lowerName.includes('cabinet') || lowerName.includes('counter') || lowerName.includes('desk') || lowerName.includes('nightstand')) {
          furniture.push(meshInfo);
        } else if (lowerName.includes('plant') || lowerName.includes('vase') || lowerName.includes('decor') || lowerName.includes('rug') || lowerName.includes('lamp') || lowerName.includes('sculpture') || lowerName.includes('book') || lowerName.includes('tray') || lowerName.includes('bottle')) {
          decor.push(meshInfo);
        } else {
          other.push(meshInfo);
        }
      }
    });

    const overallSize = new THREE.Vector3();
    const overallCenter = new THREE.Vector3();
    modelBox.getSize(overallSize);
    modelBox.getCenter(overallCenter);

    // Renderer stats
    const renderInfo = {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: renderer.info.render.points,
      lines: renderer.info.render.lines,
      frame: renderer.info.render.frame,
      memory: {
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures
      }
    };

    return {
      summary: {
        totalMeshes: meshCount,
        totalTriangles,
        totalVertices,
        totalMaterials: materialsMap.size,
        totalTextures: texturesSet.size,
        modelDimensions: {
          min: [modelBox.min.x, modelBox.min.y, modelBox.min.z],
          max: [modelBox.max.x, modelBox.max.y, modelBox.max.z],
          size: [overallSize.x, overallSize.y, overallSize.z],
          center: [overallCenter.x, overallCenter.y, overallCenter.z]
        }
      },
      renderInfo,
      categoryCounts: {
        structuralWalls: structuralWalls.length,
        floors: floors.length,
        ceilings: ceilings.length,
        doors: doors.length,
        windows: windows.length,
        furniture: furniture.length,
        decor: decor.length,
        other: other.length
      },
      structuralWalls: structuralWalls.slice(0, 30),
      floors,
      ceilings,
      doors,
      windows: windows.slice(0, 15),
      furniture: furniture.slice(0, 40),
      materials: Array.from(materialsMap.values())
    };
  });

  console.log('=== GLB VERIFICATION DATA ===');
  console.log('Meshes:', diagnosticData.summary.totalMeshes);
  console.log('Triangles:', diagnosticData.summary.totalTriangles);
  console.log('Vertices:', diagnosticData.summary.totalVertices);
  console.log('Materials:', diagnosticData.summary.totalMaterials);
  console.log('Textures:', diagnosticData.summary.totalTextures);
  console.log('Model Size (meters):', diagnosticData.summary.modelDimensions.size.map(v => v.toFixed(2)).join(' x '));
  console.log('Model Center:', diagnosticData.summary.modelDimensions.center.map(v => v.toFixed(2)).join(', '));
  console.log('Draw Calls:', diagnosticData.renderInfo.calls);
  console.log('Rendered Triangles:', diagnosticData.renderInfo.triangles);
  console.log('Categories:', diagnosticData.categoryCounts);

  fs.writeFileSync('scripts/interior_glb_verified_report.json', JSON.stringify(diagnosticData, null, 2));
  console.log('Saved detailed report to scripts/interior_glb_verified_report.json');

  // Now capture high-fidelity visual proof screenshots from key viewpoints
  console.log('Capturing visual proof screenshots from interior viewpoints...');

  const viewpoints = [
    {
      name: 'diagnostic_01_foyer_entrance',
      pos: [0.0, 1.6, -1.2],
      look: [0.0, 1.6, -8.0],
      room: 'foyer',
      desc: 'Front Foyer Entrance Doorway looking into residence'
    },
    {
      name: 'diagnostic_02_foyer_to_living',
      pos: [0.0, 1.6, -4.0],
      look: [6.0, 1.6, -7.0],
      room: 'foyer',
      desc: 'Corridor threshold looking into Grand Living & Dining Hall'
    },
    {
      name: 'diagnostic_03_living_center',
      pos: [7.15, 1.6, -6.5],
      look: [7.15, 1.5, -14.0],
      room: 'living_dining',
      desc: 'Grand Living Hall center looking towards sundeck'
    },
    {
      name: 'diagnostic_04_kitchen_island',
      pos: [5.67, 1.6, -3.2],
      look: [5.67, 1.4, -6.0],
      room: 'kitchen',
      desc: 'Modular Kitchen with center island and cabinetry'
    },
    {
      name: 'diagnostic_05_master_bedroom',
      pos: [-7.01, 1.6, -7.0],
      look: [-7.01, 1.4, -14.0],
      room: 'master_bedroom',
      desc: 'Master Suite looking towards king bed and exterior windows'
    },
    {
      name: 'diagnostic_06_balcony_deck',
      pos: [1.5, 1.6, -13.6],
      look: [-1.0, 1.3, -14.2],
      room: 'balcony',
      desc: 'Sundeck Balcony with glass railings and exterior outlook'
    },
    {
      name: 'diagnostic_07_doorway_clearance',
      pos: [-3.2, 1.6, -5.2],
      look: [-6.8, 1.6, -6.8],
      room: 'master_bedroom',
      desc: 'Passageway into Bedroom Wing verifying doorway clearance'
    }
  ];

  for (const vp of viewpoints) {
    await page.evaluate(({ pos, look, room }) => {
      const store = window.__APP_STORE__.getState();
      store.enterRoom(room);
      const cam = window.__THREE_CAMERA__;
      cam.position.set(pos[0], pos[1], pos[2]);
      cam.lookAt(look[0], look[1], look[2]);
      cam.updateMatrixWorld(true);
    }, vp);

    await page.waitForTimeout(600);
    const shotPath = `./screenshots/${vp.name}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath} (${vp.desc})`);
  }

  // Top-down cutaway diagnostic
  console.log('Capturing top-down cutaway diagnostic...');
  await page.evaluate(() => {
    const store = window.__APP_STORE__.getState();
    store.exitToDollhouse();
    const cam = window.__THREE_CAMERA__;
    cam.position.set(0, 24, -6);
    cam.lookAt(0, 0, -6);
    cam.updateMatrixWorld(true);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: './screenshots/diagnostic_08_dollhouse_topdown.png' });
  console.log('Saved screenshot: screenshots/diagnostic_08_dollhouse_topdown.png');

  await browser.close();
  console.log('Verification script completed successfully.');
}

verifyInteriorGLB().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
