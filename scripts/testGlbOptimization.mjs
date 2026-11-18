import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, weld, resample } from '@gltf-transform/functions';
import fs from 'fs';

async function optimizeBuilding() {
  console.log('Reading public/models/Waterfront_18F_optimized.glb...');
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read('public/models/Waterfront_18F_optimized.glb');
  const root = document.getRoot();

  console.log('Original Nodes:', root.listNodes().length);
  console.log('Original Meshes:', root.listMeshes().length);

  // Micro-props that tank performance by over 10 million triangles
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

  let removedNodes = 0;
  // Detach micro-prop nodes from the scene
  for (const node of root.listNodes()) {
    if (isMicroProp(node.getName())) {
      node.dispose();
      removedNodes++;
    }
  }
  console.log(`Removed ${removedNodes} micro-prop nodes.`);

  // Clean up unreferenced meshes, accessors, materials
  await document.transform(
    prune(),
    dedup(),
    weld({ tolerance: 0.0001 }),
    resample()
  );

  console.log('Optimized Nodes:', root.listNodes().length);
  console.log('Optimized Meshes:', root.listMeshes().length);

  const outPath = 'public/models/Waterfront_18F_fast.glb';
  console.log(`Writing optimized model to ${outPath}...`);
  await io.write(outPath, document);

  const inSize = fs.statSync('public/models/Waterfront_18F_optimized.glb').size;
  const outSize = fs.statSync(outPath).size;
  console.log(`File size: ${(inSize / (1024*1024)).toFixed(2)} MB -> ${(outSize / (1024*1024)).toFixed(2)} MB`);
  console.log('--- Optimization Completed Successfully ---');
}

optimizeBuilding().catch(console.error);
