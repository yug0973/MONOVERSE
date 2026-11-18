import fs from 'fs';

function inspectGlb(filePath) {
  console.log(`\n=================== Inspecting: ${filePath} ===================`);
  const buf = fs.readFileSync(filePath);
  const magic = buf.readUInt32LE(0);
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  console.log(`Magic: 0x${magic.toString(16)}, Version: ${version}, Total length: ${(totalLength / 1024 / 1024).toFixed(2)} MB`);

  const chunk0Length = buf.readUInt32LE(12);
  const chunk0Type = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);

  console.log(`Generator: ${gltf.asset?.generator}, Version: ${gltf.asset?.version}`);
  console.log(`Scenes count: ${gltf.scenes?.length}, Default scene: ${gltf.scene}`);
  console.log(`Nodes count: ${gltf.nodes?.length}`);
  console.log(`Meshes count: ${gltf.meshes?.length}`);
  console.log(`Materials count: ${gltf.materials?.length}`);
  console.log(`Textures count: ${gltf.textures?.length || 0}`);
  console.log(`Images count: ${gltf.images?.length || 0}`);
  console.log(`Animations count: ${gltf.animations?.length || 0}`);

  console.log(`\n--- Top 30 Nodes ---`);
  gltf.nodes?.slice(0, 30).forEach((node, idx) => {
    console.log(`Node [${idx}] name: "${node.name || 'unnamed'}", mesh: ${node.mesh !== undefined ? node.mesh : 'none'}, children: ${node.children ? JSON.stringify(node.children) : '[]'}, translation: ${JSON.stringify(node.translation)}, scale: ${JSON.stringify(node.scale)}`);
  });

  if (gltf.materials) {
    console.log(`\n--- Materials Sample (first 15) ---`);
    gltf.materials.slice(0, 15).forEach((mat, idx) => {
      console.log(`Material [${idx}] name: "${mat.name}", pbr: ${JSON.stringify(mat.pbrMetallicRoughness)}`);
    });
  }

  // Check scene root nodes
  if (gltf.scenes && gltf.scenes[gltf.scene || 0]) {
    console.log(`\n--- Scene Root Node Indices ---`);
    console.log(gltf.scenes[gltf.scene || 0].nodes);
  }
}

inspectGlb('Waterfront_18F_optimized.glb');
inspectGlb('Interior_asset_optimized.glb');
