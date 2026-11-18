import fs from 'fs';

function inspectInterior(filePath) {
  console.log(`\n=================== Inspecting: ${filePath} ===================`);
  const buf = fs.readFileSync(filePath);
  const chunk0Length = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);

  console.log(`Generator: ${gltf.asset?.generator}, Version: ${gltf.asset?.version}`);
  console.log(`Scenes count: ${gltf.scenes?.length}, Default scene: ${gltf.scene}`);
  console.log(`Nodes count: ${gltf.nodes?.length}`);
  console.log(`Meshes count: ${gltf.meshes?.length}`);
  console.log(`Materials count: ${gltf.materials?.length}`);
  console.log(`Textures count: ${gltf.textures?.length || 0}`);
  console.log(`Images count: ${gltf.images?.length || 0}`);

  // Find root nodes and top children
  const rootNodeIndices = gltf.scenes[gltf.scene || 0]?.nodes || [];
  console.log(`\n--- Root Nodes (${rootNodeIndices.length}) ---`);
  rootNodeIndices.slice(0, 30).forEach((idx) => {
    const node = gltf.nodes[idx];
    console.log(`Root [${idx}] name: "${node?.name}", children: ${node?.children?.length || 0}, mesh: ${node?.mesh}`);
  });

  // Collect some node names
  console.log(`\n--- First 50 Node Names with meshes ---`);
  let count = 0;
  for (let i = 0; i < gltf.nodes.length && count < 50; i++) {
    const node = gltf.nodes[i];
    if (node.mesh !== undefined || (node.name && !node.name.startsWith('unnamed'))) {
      console.log(`[${i}] "${node.name}" (mesh: ${node.mesh})`);
      count++;
    }
  }

  // Materials
  console.log(`\n--- Materials (${gltf.materials?.length}) ---`);
  gltf.materials?.slice(0, 25).forEach((mat, idx) => {
    console.log(`Mat [${idx}] "${mat.name}"`);
  });
}

inspectInterior('Interior_asset_optimized.glb');
