import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, weld, resample, draco } from '@gltf-transform/functions';
import draco3d from 'draco3d';
import fs from 'fs';

async function runOptimization() {
  console.log('=== Step 1: Initializing glTF-Transform with Draco 3D ===');
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const inPath = 'public/models/Waterfront_18F_optimized.glb';
  const outPath = 'public/models/Waterfront_18F_fast.glb';

  console.log(`Reading source building model: ${inPath}...`);
  const document = await io.read(inPath);
  const root = document.getRoot();

  console.log(`Initial Nodes count: ${root.listNodes().length}`);
  console.log(`Initial Meshes count: ${root.listMeshes().length}`);

  // Test triangle count
  let initialTris = 0;
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices();
      if (indices) initialTris += indices.getCount() / 3;
    }
  }
  console.log(`Initial Total Triangles: ${Math.round(initialTris).toLocaleString()}`);

  // Micro-props filter: removes 10+ million micro-triangles of photogrammetry plants,
  // tumbler glasses, range hoods, sofas, armchairs, and curtain gliders from the building model
  const isMicroProp = (name) => {
    const n = (name || '').toLowerCase();
    return (
      n.includes('armchair') ||
      n.includes('sofa') ||
      n.includes('cushion') ||
      n.includes('pillow') ||
      n.includes('leaves') ||
      n.includes('palm') ||
      n.includes('foliage') ||
      n.includes('shrub') ||
      n.includes('banana') ||
      n.includes('pot') ||
      n.includes('trunk') ||
      n.includes('soil') ||
      n.includes('tumbler') ||
      n.includes('crosshatch') ||
      n.includes('hood') ||
      n.includes('rice') ||
      n.includes('glider') ||
      n.includes('pendant') ||
      n.includes('chandelier') ||
      n.includes('ceramic') ||
      n.includes('cover') ||
      n.includes('text_')
    );
  };

  console.log('=== Step 2: Pruning 10-Million-Triangle Invisible Interior Micro-Props ===');
  let removedNodes = 0;
  for (const node of root.listNodes()) {
    if (isMicroProp(node.getName())) {
      node.dispose();
      removedNodes++;
    }
  }
  console.log(`Disposed of ${removedNodes} redundant micro-prop nodes.`);

  console.log('=== Step 3: Bypassing KHR_materials_transmission to Eliminate FBO Pass ===');
  for (const mat of root.listMaterials()) {
    const transmission = mat.getExtension('KHR_materials_transmission');
    if (transmission) {
      transmission.dispose();
      mat.setAlphaMode('BLEND');
      mat.setRoughnessFactor(0.08);
      mat.setMetallicFactor(0.1);
    }
    const volume = mat.getExtension('KHR_materials_volume');
    if (volume) volume.dispose();
  }

  console.log('=== Step 4: Running glTF-Transform Geometry Dedup, Weld & Prune ===');
  await document.transform(
    prune(),
    dedup(),
    weld({ tolerance: 0.0001 }),
    resample(),
    draco({ compressionLevel: 7 })
  );

  let finalTris = 0;
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices();
      if (indices) finalTris += indices.getCount() / 3;
    }
  }

  console.log(`Optimized Nodes count: ${root.listNodes().length}`);
  console.log(`Optimized Meshes count: ${root.listMeshes().length}`);
  console.log(`Optimized Total Triangles: ${Math.round(finalTris).toLocaleString()}`);
  console.log(`Triangle Reduction: -${Math.round(((initialTris - finalTris) / initialTris) * 100)}%`);

  console.log(`=== Step 5: Writing ${outPath}... ===`);
  await io.write(outPath, document);

  const inSize = fs.statSync(inPath).size;
  const outSize = fs.statSync(outPath).size;
  console.log(`File size: ${(inSize / (1024*1024)).toFixed(2)} MB -> ${(outSize / (1024*1024)).toFixed(2)} MB`);
  console.log('=== Building Model Optimization Completed Successfully! ===');
}

runOptimization().catch(console.error);
