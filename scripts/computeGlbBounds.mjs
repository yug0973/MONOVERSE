import fs from 'fs';

function computeBounds(filePath) {
  const buf = fs.readFileSync(filePath);
  const chunk0Length = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);

  let globalMin = [Infinity, Infinity, Infinity];
  let globalMax = [-Infinity, -Infinity, -Infinity];

  gltf.meshes?.forEach((mesh, mIdx) => {
    mesh.primitives?.forEach((prim) => {
      const posAccIdx = prim.attributes?.POSITION;
      if (posAccIdx !== undefined) {
        const acc = gltf.accessors[posAccIdx];
        if (acc && acc.min && acc.max) {
          for (let i = 0; i < 3; i++) {
            if (acc.min[i] < globalMin[i]) globalMin[i] = acc.min[i];
            if (acc.max[i] > globalMax[i]) globalMax[i] = acc.max[i];
          }
        }
      }
    });
  });

  const size = [
    globalMax[0] - globalMin[0],
    globalMax[1] - globalMin[1],
    globalMax[2] - globalMin[2],
  ];
  const center = [
    (globalMax[0] + globalMin[0]) / 2,
    (globalMax[1] + globalMin[1]) / 2,
    (globalMax[2] + globalMin[2]) / 2,
  ];

  console.log(`\n=== Bounds for ${filePath} ===`);
  console.log('Min:', globalMin.map(v => v.toFixed(2)));
  console.log('Max:', globalMax.map(v => v.toFixed(2)));
  console.log('Size (X, Y, Z):', size.map(v => v.toFixed(2)));
  console.log('Center (X, Y, Z):', center.map(v => v.toFixed(2)));

  // Let's also inspect all named parent groups or layers
  console.log('\nTop-level / prominent object names:');
  const interestingNodes = gltf.nodes?.filter(n => n.name && !n.name.startsWith('unnamed') && (n.children?.length > 1 || n.mesh !== undefined));
  console.log(`Total named nodes: ${interestingNodes.length}`);
  const groupNames = new Set();
  gltf.nodes?.forEach(n => {
    if (n.name && !n.name.startsWith('unnamed')) {
      const base = n.name.split('.')[0].split('_')[0];
      groupNames.add(base);
    }
  });
  console.log('Unique node name prefixes:', Array.from(groupNames).slice(0, 40).join(', '));
}

computeBounds('public/models/Waterfront_18F_optimized.glb');
computeBounds('public/models/Interior_asset_optimized.glb');
