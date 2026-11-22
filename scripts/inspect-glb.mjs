import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

async function inspectGLB() {
  const glbPath = path.resolve('public/models/Interior_asset_optimized.glb');
  console.log(`Inspecting GLB: ${glbPath}`);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(glbPath);
  const root = document.getRoot();

  const meshes = root.listMeshes();
  const materials = root.listMaterials();
  const textures = root.listTextures();
  const nodes = root.listNodes();
  const scenes = root.listScenes();

  let totalTriangles = 0;
  let totalVertices = 0;
  let primitiveCount = 0;

  const meshDetails = [];

  for (const mesh of meshes) {
    const meshName = mesh.getName() || 'UnnamedMesh';
    let meshTris = 0;
    let meshVerts = 0;

    for (const prim of mesh.listPrimitives()) {
      primitiveCount++;
      const indices = prim.getIndices();
      const position = prim.getAttribute('POSITION');
      
      const vCount = position ? position.getCount() : 0;
      meshVerts += vCount;
      totalVertices += vCount;

      let tCount = 0;
      if (indices) {
        tCount = indices.getCount() / 3;
      } else if (position) {
        tCount = position.getCount() / 3;
      }
      meshTris += tCount;
      totalTriangles += tCount;
    }

    meshDetails.push({
      name: meshName,
      primitives: mesh.listPrimitives().length,
      triangles: meshTris,
      vertices: meshVerts
    });
  }

  // Calculate approximate bounds from nodes
  // Let's also inspect node hierarchy & names
  const nodeNames = nodes.map(n => n.getName()).filter(Boolean);
  
  // Categorize nodes
  const categories = {
    walls: [],
    floors: [],
    ceilings: [],
    doors: [],
    windows: [],
    furniture: [],
    decor: [],
    lighting: [],
    other: []
  };

  for (const n of nodes) {
    const name = (n.getName() || '').toLowerCase();
    if (!name) continue;
    const translation = n.getTranslation();
    const scale = n.getScale();
    const rotation = n.getRotation();

    const info = { name: n.getName(), translation, scale, rotation };

    if (name.includes('wall') || name.includes('partition') || name.includes('column') || name.includes('pillar')) {
      categories.walls.push(info);
    } else if (name.includes('floor') || name.includes('slab') || name.includes('ground') || name.includes('deck')) {
      categories.floors.push(info);
    } else if (name.includes('ceiling') || name.includes('roof') || name.includes('fascia')) {
      categories.ceilings.push(info);
    } else if (name.includes('door') || name.includes('portal') || name.includes('entry') || name.includes('foyer')) {
      categories.doors.push(info);
    } else if (name.includes('window') || name.includes('glass') || name.includes('glazing') || name.includes('railing')) {
      categories.windows.push(info);
    } else if (name.includes('sofa') || name.includes('bed') || name.includes('table') || name.includes('chair') || name.includes('wardrobe') || name.includes('island') || name.includes('cabinet') || name.includes('shelf') || name.includes('desk')) {
      categories.furniture.push(info);
    } else if (name.includes('plant') || name.includes('vase') || name.includes('decor') || name.includes('rug') || name.includes('curtain') || name.includes('book') || name.includes('art') || name.includes('frame') || name.includes('lamp') || name.includes('light')) {
      categories.decor.push(info);
    } else {
      categories.other.push(info);
    }
  }

  console.log('=== GLB SUMMARY ===');
  console.log(`Total Nodes: ${nodes.length}`);
  console.log(`Total Meshes: ${meshes.length}`);
  console.log(`Total Primitives: ${primitiveCount}`);
  console.log(`Total Materials: ${materials.length}`);
  console.log(`Total Textures: ${textures.length}`);
  console.log(`Total Vertices: ${totalVertices}`);
  console.log(`Total Triangles: ${totalTriangles}`);

  console.log('\n=== MATERIAL LIST ===');
  materials.forEach((m, idx) => {
    const baseColor = m.getBaseColorFactor();
    const roughness = m.getRoughnessFactor();
    const metalness = m.getMetallicFactor();
    console.log(`  [${idx}] ${m.getName()} (Rough: ${roughness}, Metal: ${metalness}, BaseColor: ${baseColor ? baseColor.slice(0,3).map(v=>v.toFixed(2)).join(',') : 'none'})`);
  });

  console.log('\n=== CATEGORY COUNTS ===');
  for (const [cat, items] of Object.entries(categories)) {
    console.log(`  ${cat}: ${items.length} items`);
  }

  // Dump detailed breakdown to json for analysis
  fs.writeFileSync('scripts/glb_inspection_report.json', JSON.stringify({
    summary: {
      nodes: nodes.length,
      meshes: meshes.length,
      primitives: primitiveCount,
      materials: materials.length,
      textures: textures.length,
      vertices: totalVertices,
      triangles: totalTriangles
    },
    materials: materials.map(m => ({
      name: m.getName(),
      baseColorFactor: m.getBaseColorFactor(),
      roughness: m.getRoughnessFactor(),
      metalness: m.getMetallicFactor(),
      hasBaseTexture: !!m.getBaseColorTexture(),
      hasNormalTexture: !!m.getNormalTexture()
    })),
    categories,
    meshDetails
  }, null, 2));

  console.log('\nSaved full report to scripts/glb_inspection_report.json');
}

inspectGLB().catch(err => {
  console.error('Error inspecting GLB:', err);
  process.exit(1);
});
