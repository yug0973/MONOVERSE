import fs from 'fs';

function inspectTowerCoords() {
  const buf = fs.readFileSync('public/models/Waterfront_18F_optimized.glb');
  const chunk0Length = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

  // Compute bounding box for Level 01..15 and Podium
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];

  const levelNodes = gltf.nodes?.filter(n => n.name && (n.name.includes('Level') || n.name.includes('Podium')));
  console.log(`Found ${levelNodes.length} Level/Podium nodes`);

  levelNodes.forEach(n => {
    if (n.mesh !== undefined) {
      const mesh = gltf.meshes[n.mesh];
      mesh.primitives?.forEach(p => {
        const accIdx = p.attributes?.POSITION;
        if (accIdx !== undefined) {
          const acc = gltf.accessors[accIdx];
          if (acc && acc.min && acc.max) {
            for (let i = 0; i < 3; i++) {
              if (acc.min[i] < min[i]) min[i] = acc.min[i];
              if (acc.max[i] > max[i]) max[i] = acc.max[i];
            }
          }
        }
      });
    }
  });

  console.log('Tower Only Bounds:');
  console.log('Min:', min.map(v => v.toFixed(2)));
  console.log('Max:', max.map(v => v.toFixed(2)));
  console.log('Size:', [max[0]-min[0], max[1]-min[1], max[2]-min[2]].map(v => v.toFixed(2)));
  console.log('Center:', [(max[0]+min[0])/2, (max[1]+min[1])/2, (max[2]+min[2])/2].map(v => v.toFixed(2)));

  // Check Level 01 vs Level 02 vs Level 15 heights
  ['Podium', 'Level 01', 'Level 02', 'Level 05', 'Level 09', 'Level 14', 'Level 15', 'Roof'].forEach(lvl => {
    let lMin = [Infinity, Infinity, Infinity];
    let lMax = [-Infinity, -Infinity, -Infinity];
    gltf.nodes?.forEach(n => {
      if (n.name && n.name.includes(lvl) && n.mesh !== undefined) {
        const mesh = gltf.meshes[n.mesh];
        mesh.primitives?.forEach(p => {
          const accIdx = p.attributes?.POSITION;
          if (accIdx !== undefined) {
            const acc = gltf.accessors[accIdx];
            if (acc && acc.min && acc.max) {
              for (let i = 0; i < 3; i++) {
                if (acc.min[i] < lMin[i]) lMin[i] = acc.min[i];
                if (acc.max[i] > lMax[i]) lMax[i] = acc.max[i];
              }
            }
          }
        });
      }
    });
    console.log(`${lvl} -> Y range: [${lMin[1].toFixed(2)}, ${lMax[1].toFixed(2)}] (height: ${(lMax[1]-lMin[1]).toFixed(2)}m)`);
  });
}

inspectTowerCoords();
